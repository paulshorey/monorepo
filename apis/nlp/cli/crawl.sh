#!/usr/bin/env bash

cwd=$( cd "$(dirname "$0")" ; pwd -P )
echo $cwd
echo " "

node --experimental-specifier-resolution=node --inspect $cwd/../cli/crawl/index.js
