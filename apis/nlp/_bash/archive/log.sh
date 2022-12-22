echo "deb https://repo.logdna.com stable main" | sudo tee /etc/apt/sources.list.d/logdna.list
wget -O- https://repo.logdna.com/logdna.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install logdna-agent < "/dev/null" # this line needed for copy/paste
sudo logdna-agent -k b41c17f49899e674ac66414d26a7b0af # this is your unique Ingestion Key
# /var/log is monitored/added by default (recursively), optionally add more dirs with:
# sudo logdna-agent -d /path/to/log/folders
# You can configure the agent to tag your hosts with:
# sudo logdna-agent -t mytag,myothertag
sudo update-rc.d logdna-agent defaults
sudo /etc/init.d/logdna-agent start
