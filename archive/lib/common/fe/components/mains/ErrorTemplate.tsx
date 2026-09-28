"use client";

import { useEffect } from "react";

type ErrorType = Readonly<{
  server?: boolean;
  filePath?: string;
  documentId?: string;
  phraseId?: string;
  page?: string;
  error?: Error;
  response?: {
    url?: string;
    status?: number;
    statusText?: string;
  };
}>;
function errorInfo(props: ErrorType) {
  const info = {} as Record<string, string>;
  if (props.response?.url) info.URL = props.response.url;
  if (props.response?.status) info.Code = props.response.status.toString();
  if (props.response?.statusText) info.Status = props.response.statusText;
  if (props.page) info.Page = props.page;
  if (props.phraseId) info.phraseId = props.phraseId;
  if (props.documentId) info.documentId = props.documentId;
  if (props.filePath) info.filePath = props.filePath;
  if (props.error?.message) info.Error = props.error.message;
  // if (process.env.NODE_ENV === 'development') {
  if (props.error?.stack) info.Error = props.error.stack;
  // }
  if (typeof props.error === "string") info.Error = props.error;
  return info;
}
export function ErrorTemplate(props: ErrorType) {
  const title = props.server ? "Server Error" : "Client Error";
  const info = errorInfo(props);
  useEffect(() => {
    console.error({
      title,
      ...info,
    });
  }, [title, info]);
  return (
    <>
      <div className="w-full bg-gray-100 h-screen relative text-center flex flex-col justify-center items-center overflow-hidden">
        <div className="flex items-center flex-col relative z-10 min-w-[500px] max-w-2xl text-gray-600">
          <h1 className="text-4xl font-regular mb-1">{title}</h1>
          {info && (
            <div className="mt-7 text-center text-sm">
              {Object.entries(info).map(([key, value]) => (
                <div key={key} className="flex justify-center items-center">
                  <span>{key}:&nbsp;</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
