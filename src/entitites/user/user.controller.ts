import { plainToClass } from "class-transformer";
import { User } from "./user.model";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { UserDto } from "./dto/user.dto";
import jwt from "jsonwebtoken";
import Nodemailer from "nodemailer";
import crypto from "crypto";
import { EmailValidator } from "./email_validator.model";
import { ValidateEmailDto } from "./dto/validate_email.dto";
import { decode } from "jwt-js-decode";

export class UserController {
  async registerUser(req: Request, res: Response) {
    const body = plainToClass(UserDto, req.body);
    if (body.password.length < 4 || body.password.length > 20)
      return res.status(400).json({
        msg: "Ваш пароль должен содержать от 4 до 20 символов",
      });
    const hashPassword = await bcrypt.hash(body.password, 10);
    let [user, created] = [new User(), false];
    try {
      [user, created] = await User.findOrCreate({
        where: { login: body.login },
        defaults: {
          login: body.login,
          password: hashPassword,
          email: body.email,
        },
      });
      if (!created) {
        return res.status(400).json({
          msg: "Логин уже занят",
        });
      }
    } catch (err) {
      return res.status(400).json({ msg: err });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "", {
      expiresIn: "30d",
    });

    const secretCode = crypto.randomInt(1000, 9999);
    const hashSecretCode = await bcrypt.hash(secretCode.toString(), 10);
    const [, created_validator] = await EmailValidator.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        secret_code: hashSecretCode,
      },
    });
    if (!created_validator) {
      return res.status(400).json({
        msg: "Ошибка при регистрации аккаунта",
      });
    }

    const transport = Nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS,
      },
    });

    const sender = {
      address: "Test@gmail.com",
      name: "Test",
    };
    const recipients = [body.email];

    transport
      .sendMail({
        from: sender,
        to: recipients,
        subject: "Регистрация аккаунта",
        text: `Вы зарегистрировали аккаунт, код подтверждения: ${secretCode}`,
      })
      .then(console.log, console.error);

    return res.status(201).json({ token });
  }
  async login(req: Request, res: Response) {
    const body = plainToClass(UserDto, req.body);
    let user = await User.findOne({ where: { login: body.login } });
    if (!user) {
      return res.status(400).json({
        msg: "Неверный логин или пароль",
      });
    }
    const isCorrectPassword = await bcrypt.compare(
      body.password,
      user.dataValues.password
    );
    if (!isCorrectPassword) {
      return res.status(400).json({
        msg: "Неверный логин или пароль",
      });
    }
    if (!user.dataValues.active)
      return res.status(400).json({
        msg: "Учётная запись ещё не активирована",
      });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "", {
      expiresIn: "30d",
    });
    return res.status(202).json({ token });
  }
  async validateEmail(req: Request, res: Response) {
    const body = plainToClass(ValidateEmailDto, req.body);
    let header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Требуется аккаунт",
      });
    }
    const token = header.split(" ")[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || "");
    } catch (err) {
      return res.status(401).json({
        msg: "Требуется аккаунт",
      });
    }
    let user_jwt;
    try {
      user_jwt = decode(token);
    } catch (err) {
      return res.status(400).json({ msg: `Ошибка в jwt: ${err}` });
    }
    let user_id = user_jwt.payload.userId;

    const user = await EmailValidator.findOne({
      where: { user_id: user_id },
    });

    if (!user)
      return res.status(400).json({ msg: "Учётная запись уже активирована" });

    const secret_code = user.dataValues.secret_code;

    if (await bcrypt.compare(body.secret_code, secret_code)) {
      await EmailValidator.destroy({
        where: { user_id: user_id },
      });
      const activated_user = await User.findOne({
        where: { id: user_id },
      });
      if (activated_user)
        activated_user.update({
          active: true,
        });
      return res.status(202).json({ msg: "Почта успешно подтверждена" });
    }

    return res.status(400).json({ msg: "Ошибка при подтверждении почты" });
  }
  async getUserById(req: Request, res: Response) {
    let id = req.params.id;
    const user = await User.findOne({ where: { id: id } });
    if (!user?.dataValues)
      return res.status(400).json({ msg: "Пользователь с таким id не найден" });
    return res.status(202).json({ user });
  }
}
