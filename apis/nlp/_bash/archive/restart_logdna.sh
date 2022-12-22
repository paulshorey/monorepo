#!/bin/bash
echo "" > /etc/logdna.conf
echo "hostname = $(hostname)--PM2" >> /etc/logdna.conf &&
echo "app = PM2" >> /etc/logdna.conf &&
echo "logdir = /root/.pm2/logs" >> /etc/logdna.conf &&
echo "key = b41c17f49899e674ac66414d26a7b0af" >> /etc/logdna.conf &&
/etc/init.d/logdna-agent restart