#!/bin/bash

# Figure out the real current directory path
cwd=$( cd "$(dirname "$0")" ; pwd -P )
monodir=$rootdir/../../
cd $monodir

# Remove secrets from git
git submodule deinit -f ./secrets 
rm .gitmodules

# Backup the example folder
mv ./secrets/example ./secrets-example 

# Delete ./secrets folder
rm -rf ./secrets

# Move example real secrets location
mv ./secrets-example ./secrets