import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as dutiesService from "./duties.service";

interface DutyRequestBody {
  name?: unknown;
}

export const listDuties = catchAsync(async (_req: Request, res: Response) => {
  const duties = await dutiesService.listDuties();
  res.status(200).json({ data: duties });
});

export const createDuty = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as DutyRequestBody;
  const duty = await dutiesService.createDuty(body.name);
  res.status(201).json({ data: duty });
});

export const updateDuty = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as DutyRequestBody;
  const duty = await dutiesService.updateDuty(req.params["id"] ?? "", body.name);
  res.status(200).json({ data: duty });
});

export const removeDuty = catchAsync(async (req: Request, res: Response) => {
  await dutiesService.removeDuty(req.params["id"] ?? "");
  res.status(204).send();
});
