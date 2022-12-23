#!/bin/bash

npx nodemon --exec 'ts-node --esm --experimental-specifier-resolution=node src' -e ts,js,json
