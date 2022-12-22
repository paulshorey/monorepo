#!/usr/bin/env bash

i="0"

while [[ $i -lt 1000 ]]
do
echo ${i}
node cli/proper.js
sleep 1
i=$[$i+1]
done
