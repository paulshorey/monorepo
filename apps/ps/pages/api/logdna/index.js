/*
 * Host
 */
import * as os from 'os';
const hostname = os.hostname();
const hosttype = os.type();
const DEVELOPMENT = hosttype.toLowerCase().includes('darwin');

//
// Error reporting
//
import * as Airbrake from '@airbrake/node';
const airbrake = new Airbrake.Notifier({
  projectId: 268629,
  projectKey: 'a51fcfa809e5edfa05e612f8de171f48',
  environment: DEVELOPMENT ? 'development' : 'production',
});

//
// Cloud logging
//
import logdna from '@logdna/logger';
let dnaOptions = {
  app: 'vercel-ps-api',
  source: hostname + '-' + DEVELOPMENT ? 'development' : 'production',
  level: 'trace',
};
let dnaConsole = logdna.createLogger(
  '42ce61a790ba92d5c1661e4ad3affb83',
  dnaOptions
);

/*
 * API
 */
export default async function handler(req, res) {
  try {
    let str = req.body.string;
    switch (req.query.level) {
      case 'info':
        dnaConsole.log(str, { level: 'info' });
        break;
      case 'warn':
        dnaConsole.log(str, { level: 'warn' });
        break;
      case 'error':
        dnaConsole.log(str, { level: 'error' });
        airbrake.notify(str);
        break;
      default:
        // logdna only supports debug/info/warn/error, so using debug instead of log
        dnaConsole.log(str, { level: 'debug' });
        break;
    }
    res.status(200).send('Logged successfully: ' + str);
  } catch (err) {
    res.status(500).send('Error: ' + JSON.stringify(err));
  }
}
