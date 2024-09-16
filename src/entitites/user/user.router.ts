import { Router } from "express";
import { UserController } from "./user.controller";

export const userRouter = Router()
const userController = new UserController()

userRouter.post("/reg",userController.registerUser)
userRouter.patch("/validate_email",userController.validateEmail)
userRouter.post("/login",userController.login)
userRouter.get("/:id",userController.getUserById)