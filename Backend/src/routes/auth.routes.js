import { Router } from "express";
import { userRegister, userLogin, userLogout, getMe } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);
authRouter.post("/logout", userLogout);
authRouter.get("/me", authenticateUser, getMe);

export default authRouter;