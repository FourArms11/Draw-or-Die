import {Router} from "express";
import { userRegister, userLogin } from "../controllers/auth.controller.js";


const authRouter = Router();

authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);
// authRouter.post("/logout", userLogout);
// authRouter.post("/login",);
// authRouter.post("/register",);
// authRouter.post("/register",);


export default authRouter;