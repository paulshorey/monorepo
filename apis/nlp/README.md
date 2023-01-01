## `backend-nlp` API server

Database, API, business logic, and algorithms for wordio.co, besta.domains, and others.

This is deployed using a github.com webhook: to https://api-staging.wordio.co when git push to `staging` and to `https://api.wordio.co` when git push to `main`.

This is served using bash scripts in `_bash` folder. Node process is managed using `pm2`.

This is part of a monorepo github.com/paulshorey/harmony, but this is not imported as a dependency by any other project. This does depend on a couple modules from that repo though. This package is its own module. It is included in the monorepo as a submodule.

<br />

## Getting started

### First of all...

This depends on a submodule `./secrets` which is a private git repo. It contains API keys and DB passwords.

This project is open sourced just so I could get a code review and feedback on the setup and architecture.

### Start development server

Run `yarn dev` or `bash _bash/_start_dev.sh`. This will simply start the node server. It will not affect the filesystem or anything else.

### Start production

`_bash/_start_production.sh` is meant to be run on the remote server. It will pull the latest code from github, install dependencies, and restart the Node server.

Be careful if testing it on the development computer. **⚠️ `_bash/_start_production.sh` will GIT force update the entire codebase to remote origin/HEAD, losing all local changes. ⚠️** Then the script will start or restart the PM2 Node manager. The script is called by `/etc/crontab` on server reboot.

Essentially this setup acts as a docker container - with the added benefits of having a database on the same machine, plus fs access and much faster deploy times. But yes, this lacks the scaling benefits of containers.
