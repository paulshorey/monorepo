import type { Response } from "express";

type ApiResult = {
  ok: boolean;
  status: number;
  error?: string;
  message?: string;
  resultId?: number;
  data?: unknown;
  rows?: unknown[];
};

export const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  return undefined;
};

export const formatResponse = (res: Response, body: Omit<ApiResult, "status">, status = 200): Response => {
  return res.status(status).json({
    ...body,
    status,
  });
};
