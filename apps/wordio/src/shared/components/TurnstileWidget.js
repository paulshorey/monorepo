import Turnstile from "react-turnstile";

export default function TurnstileWidget() {
  return (
    <Turnstile
      id="turnstile-widget"
      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_CLIENT_KEY}
      autoResetOnExpire={true}
      onVerify={(token) => {
        console.log(token);
        setTimeout(function () {
          document.getElementById("turnstile-widget").style.display = "none";
        }, 1500);
      }}
      size="compact"
      style={{ position: "fixed", bottom: "0", right: "0", zIndex: "1000000000" }}
    />
  );
}
