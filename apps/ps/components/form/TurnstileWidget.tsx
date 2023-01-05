import Turnstile from 'react-turnstile';
import appState from 'state/appState';
import { appStateType } from 'state/appState';

function TurnstileWidget() {
  const app = appState((state) => state as appStateType);
  return (
    <Turnstile
      sitekey="0x4AAAAAAABozpPwjOO9kwYb"
      autoResetOnExpire={true}
      onVerify={(token) => {
        app.turnstileTokenSet(token);
      }}
    />
  );
}
export default TurnstileWidget;
