// import { sleep } from 'pauls-pure-functions/functions/promises.js';
// host -s -t ns -W 1 webdev.net | head -n 1;
// host -s -t ns -W 1 cyber.tech | head -n 1;

import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import check_ping from "@api/domains/availability/promise_one/cli_host"

// ok go
;(async function () {
  // ping
  let ava: any = await check_ping("asdfdfdfdfdfdfd.com")
  console.log("pinged")
  console.log(ava)

  // exit
  process.exit()
})()
