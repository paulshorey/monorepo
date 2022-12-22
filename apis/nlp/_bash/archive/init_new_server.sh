#!/bin/bash

cwd=$(dirname $(realpath $0))
#rootdir=$cwd/..

#
# Timezone
#
sudo timedatectl set-timezone "America/Chicago"

#
# Log
#
bash $cwd/log.sh

