import express from "express";
import authUser from "../middlewares/authUser.js";
import { updateCart } from "../controllers/cartController.js";

export const cartRouter=express.Router();
cartRouter.post('/update',authUser,updateCart);