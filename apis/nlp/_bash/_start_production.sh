#!/bin/bash
##/etc/init.d/logdna-agent start
cwd=$( cd "$(dirname "$0")" ; pwd -P )
rootdir=$cwd/../
monodir=$rootdir/../../
cd $monodir

# 
# This script is run by /etc/crontab
#
eval "$(ssh-agent -s)"
ssh-add /root/.ssh/2022 # fixMe: using /root instead of ~ because it's run by /etc/crontab

# 
# Reset codebase
#
echo "RESET root"
git fetch --all
git add .
branch=$(git symbolic-ref --short HEAD);
git reset --hard --no-recurse-submodules HEAD # clear local changes
git reset --hard --no-recurse-submodules origin/$branch # reset to remote
git pull
cd $rootdir
echo "RESET project"
git fetch --all
git add .
branch=$(git symbolic-ref --short HEAD);
git reset --hard HEAD # clear local changes
git reset --hard origin/$branch # reset to remote
git pull

#
# Reset Install all monorepo dependencies
#
cd $monodir
yarn
cd $rootdir

#
# Map the port numbers
#
iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 1080
ufw allow 80/tcp
iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 1443
ufw allow 443/tcp

#
# Reset cache files
#
# domainAvailability
rm -rf $rootdir/tmp/localStorage-domainsAvailability
sleep 2
mkdir $rootdir/tmp/localStorage-domainsAvailability
# ?
rm -rf $rootdir/tmp/localStorage-trustClientIPs
sleep 2
mkdir $rootdir/tmp/localStorage-trustClientIPs
# whois
rm -rf $rootdir/tmp/localStorage-whois6
sleep 2
mkdir $rootdir/tmp/localStorage-whois6

#
# Start node process
#
pm2 stop all < "/dev/null"
pm2 delete all < "/dev/null"
pm2 start ts-node-esm -f -- --transpile-only --esm --experimental-specifier-resolution=node -r tsconfig-paths/register $rootdir/api;
pm2 monit;