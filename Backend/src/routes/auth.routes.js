import {Router} from "express";
import { userRegister } from "../controllers/auth.controller.js";


const authRouter = Router();

authRouter.post("/register", userRegister);
// authRouter.post("/login",);
// authRouter.post("/register",);
// authRouter.post("/register",);


export default authRouter;