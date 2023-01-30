import Turnstile from "react-turnstile";
import { turnstileToken } from "src/shared/nanostore/ui";
import React, { useEffect } from "react";
import { useStore } from "@nanostores/react";

export default function TurnstileWidget() {
  const [initial3Seconds, setInitial3Seconds] = React.useState(true);
  let timeout;
  useEffect(() => {
    timeout = setTimeout(() => {
      setInitial3Seconds(false);
    }, 3000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  const watchToken = useStore(turnstileToken);
  return (
    <Turnstile
      id="turnstile-widget"
      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_CLIENT_KEY}
      autoResetOnExpire={true}
      onVerify={(token) => {
        console.log("turnstile onVerify token", token);
        turnstileToken.set(token);
      }}
      onExpire={() => {
        console.log("turnstile onExpire");
        turnstileToken.set("");
      }}
      size="compact"
      style={{
        position: "fixed",
        top: "calc(50vh - 65px)",
        left: "calc(50vw - 65px)",
        zIndex: "1000000000",
        display: initial3Seconds || watchToken ? "none" : "flex",
      }}
    />
  );
}
