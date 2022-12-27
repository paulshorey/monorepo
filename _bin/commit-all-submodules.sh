#!/bin/bash

# Usage: bash _bin/commit-all.sh <folder-to-start-at> <commit-message>
# bash _bin/commit-all.sh . 'fixed npm dependencies so all modules work in mono/multi repo'

if [[ ! $1 ]]; then
  echo -e "\n" "Error: Must specify starting directory (as first parameter)" "\n"
  exit 1
fi
if [[ ! $2 ]]; then
  echo -e "\n" "Error: Must specify git commit message (as second parameter)" "\n"
  exit 1
fi

# Optionally, make this file executable: chmod +x recursive_iteration.sh
# Or call it with: bash recursive_iteration.sh
cwd=$( cd "$(dirname "$0")" ; pwd -P )
echo $cwd
rootdir=$cwd/../

# Save changes to git
function git_save {
  if [[ `git status --porcelain` ]]; then
    npm version patch --no-git-tag-version
    git add .
    git pull
    git add .
    git commit -m "$1"
    git push
  fi
}

# Function to be called for each directory
function process_dir {
  # $1 is the directory passed as an argument to the function
  # Make sure the input is a relative path
  if [[ $1 == /* ]]; then
    echo "Error: Input must be a relative path."
    return 1
  fi
  # Only process submodules
  if [ ! -f "$1/lerna.json" ]; then
    if [ -d "$1/.git" ]; then
      echo -e "\n\033[0;33mAttempting to commit changes in \033[0m" "\033[0;32m$1\033[0m"
      cd "$rootdir$1"
      git_save "$2"
      cd $rootdir
    fi
  fi
}

# Input directory
# input_dir=$1
# commit_message=$2
# echo -e "\033[0;31minput_dir= $input_dir\033[0m"
# echo -e "\033[0;31mcommit_message= $commit_message\033[0m"

# Recursively iterate through every subdirectory in the input directory
for dir in $(find "$1" -maxdepth 2 -type d ! -path "*node_modules*" ! -path "*node_modules_x*"); do
  process_dir "$dir" "$2"
done

# Commit the root
# echo -e "\n\033[0;33mDONE. Committing changes in \033[0m" "\033[0;32mroot multi-repo\033[0m"
# git_save "$2"