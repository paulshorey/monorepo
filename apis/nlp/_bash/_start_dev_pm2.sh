#!/bin/bash

#
# Install all monorepo dependencies
#
cwd=$( cd "$(dirname "$0")" ; pwd -P )
rootdir=$cwd/../
monodir=$rootdir/../../
# cd $monodir
# yarn
cd $rootdir

#
# Start node process
#
pm2 stop all < "/dev/null";
pm2 delete all < "/dev/null";
echo $(pwd);
# ts-node-esm does not support the --watch flag to restart on file changes, but pm2 does
pm2 start ts-node-esm -f --watch -- --transpile-only --esm --experimental-specifier-resolution=node -r tsconfig-paths/register ./api && pm2 monit;

