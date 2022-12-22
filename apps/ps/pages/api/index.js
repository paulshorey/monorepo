/*
 * CLI control (pm2 and other bash commands)
 */
import * as child_process from 'child_process';
const exec = child_process.exec;
const execute = function (command, callback) {
  exec(command, function (error, stdout) {
    if (callback) {
      callback(stdout, error);
    }
  });
};

export default async function handler(req, res) {
  return new Promise((resolve) => {
    execute('pwd', function (stdout, error) {
      res.status(200).send(`Hello world! ${stdout}`);
      resolve();
    });
  });
}
