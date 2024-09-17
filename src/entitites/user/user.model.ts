import { Model, InferAttributes, DataTypes, CreationOptional } from "sequelize";
import { storage } from "../../connection";

interface UserCreationAttributes {
  login: string;
  password: string;
  email: string;
}

export class User extends Model<InferAttributes<User>, UserCreationAttributes> {
  declare id: CreationOptional<number>;
  login!: string;
  password!: string;
  email!: string;
  active!: boolean;
}

User.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Пожалуйста, введите логин",
        },
        len: [3, 33],
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Пожалуйста, введите пароль",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Пожалуйста, введите email",
        },
        isEmail: {
          msg: "Пожалуйста, введите корректный email",
        },
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },

  {
    indexes: [{ unique: true, fields: ["login"] }],
    sequelize: storage,
    timestamps: true,
    tableName: "user",
  }
);
