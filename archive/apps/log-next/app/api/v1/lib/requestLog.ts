import type { NextRequest } from "next/server";

const extractBody = async (request: NextRequest) => {
  let bodyData: unknown = null;
  let bodyText = "";

  if (request.method !== "POST") {
    return { bodyData, bodyText };
  }

  const contentType = request.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    try {
      bodyData = await request.json();
    } catch {
      bodyText = await request.text();
    }
    return { bodyData, bodyText };
  }

  if (contentType && contentType.includes("form")) {
    bodyData = Object.fromEntries(await request.formData());
    return { bodyData, bodyText };
  }

  bodyText = await request.text();
  return { bodyData, bodyText };
};

export const buildRequestLogData = async (request: NextRequest) => {
  const { bodyData, bodyText } = await extractBody(request);

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  const headers = {
    "user-agent": request.headers.get("user-agent"),
    "content-type": request.headers.get("content-type"),
    accept: request.headers.get("accept"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "x-real-ip": request.headers.get("x-real-ip"),
  };

  return {
    bodyText,
    logData: {
      method: request.method,
      url: request.nextUrl.href,
      pathname: request.nextUrl.pathname,
      searchParams,
      headers,
      bodyData,
      bodyText,
    },
  };
};
