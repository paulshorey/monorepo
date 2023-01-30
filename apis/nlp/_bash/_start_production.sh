# #!/bin/bash
# ##/etc/init.d/logdna-agent start

# function loglabel() {
#   if [ "$1" ]; then
#     echo -e "\033[48;5;22m\033[38;5;15m$1\033[0m"
#   fi
# }

# loglabel "_start_production.sh"
# cwd=$( cd "$(dirname "$0")" ; pwd -P )
# rootdir=$cwd/..
# monodir=$rootdir/../..
# cd $monodir
# loglabel "\$cwd = $cwd"
# loglabel "\$rootdir = $rootdir"

# # 
# # This script is run by /etc/crontab
# #
# loglabel "This script is run by /etc/crontab"
# eval "$(ssh-agent -s)"
# ssh-add /root/.ssh/2022 # fixMe: using /root instead of ~ because it's run by /etc/crontab

# # 
# # Reset codebase
# #
# loglabel "Reset codebase"
# loglabel "RESET root"
# git fetch --all
# git add .
# branch=$(git symbolic-ref --short HEAD);
# git reset --hard --no-recurse-submodules HEAD # clear local changes
# git reset --hard --no-recurse-submodules origin/$branch # reset to remote
# git pull
# cd $rootdir
# loglabel "RESET project"
# git fetch --all
# git add .
# branch=$(git symbolic-ref --short HEAD);
# git reset --hard HEAD # clear local changes
# git reset --hard origin/$branch # reset to remote
# git pull
# git submodule update --init --recursive
# source $rootdir/_bash/.aliases.sh

# #
# # Remove unused packages, to not waste time/space installing their dependencies
# #
# loglabel "Remove unused packages"
# rm -rf $rootdir/apps
# rm -rf $rootdir/modules/ui
# find $rootdir/apis -type d -maxdepth 1 -mindepth 1 -print | grep -v "nlp" | xargs rm -rf
# # find .. -type d -maxdepth 1 -mindepth 1 -print | grep -v "nlp" | xargs echo

# #
# # Reset Install all monorepo dependencies
# #
# loglabel "Reset Install all monorepo dependencies"
# cd $monodir
# yarn
# cd $rootdir

# #
# # Map the port numbers
# #
# loglabel "Map the port numbers"
# iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 1080
# ufw allow 80/tcp
# iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 1443
# ufw allow 443/tcp

# #
# # Reset cache files
# #
# # domainAvailability
# loglabel "Reset cache files"
# rm -rf $rootdir/tmp
# mkdir $rootdir/tmp
# #
# sleep 4
# mkdir $rootdir/tmp/localStorage-domainsAvailability
# mkdir $rootdir/tmp/localStorage-trustClientIPs
# mkdir $rootdir/tmp/localStorage-whois6

# #
# # Start node process
# #
# loglabel "Reset cache files"
# pm2 stop all || true
# pm2 delete all || true
# pm2 start ts-node-esm -f -- --transpile-only --esm --experimental-specifier-resolution=node -r tsconfig-paths/register $rootdir/api;
# pm2 monit;

# # ts-node-esm --transpile-only --esm --experimental-specifier-resolution=node -r tsconfig-paths/register api