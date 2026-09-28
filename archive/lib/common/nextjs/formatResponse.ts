import { NextResponse } from "next/server";

export const formatResponse = (data: { ok: Boolean } & Record<string, any>, status: number = 200): NextResponse => {
  return NextResponse.json({
    ...data,
    status,
  });
};
