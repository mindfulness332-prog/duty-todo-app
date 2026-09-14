import { Router } from "express";
import * as dutiesController from "./duties.controller";

export const dutiesRouter = Router();

dutiesRouter.get("/", dutiesController.listDuties);
dutiesRouter.post("/", dutiesController.createDuty);
