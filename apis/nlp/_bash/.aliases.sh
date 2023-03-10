#!/usr/bin/env bash
alias sublime='open -a /Applications/Sublime\ Text.app/Contents/MacOS/Sublime\ Text';
alias vscode='open -a /Applications/Visual\ Studio\ Code.app/Contents/MacOS/Electron';
alias vs='open -a /Applications/Visual\ Studio\ Code.app/Contents/MacOS/Electron';
alias webstorm='open -a /Applications/WebStorm.app/Contents/MacOS/webstorm';
alias ws='open -a /Applications/WebStorm.app/Contents/MacOS/webstorm';

eval "$(ssh-agent -s)"; 
ssh-add ~/.ssh/2022;
ssh-add ~/.ssh/newssh;

#############################################################
# NOTES
#############################################################
# $1 = first argument
# $@ = all arguments
# $# = number of arguments
# $0 = name of the script

### Caution: 
## You may want to perform find/replace to rename "function y" to "function git-" or something, 
# if you are afraid of a 2-letter functions like "yx" conflicting with your other shell scripts.

#############################################################
# VARIOUS UTILITIES
#############################################################

## Opens a new iTerm tab
## cd into current directory + relative directory specified by the first argument:
function newtab() {
  PWD=$(pwd)
  echo "opening new tab to directory $PWD$1"

  osascript -e 'tell application "iTerm2"
    tell current window
        create tab with default profile
    end tell
  end tell'

  osascript -e "tell application \"iTerm2\"
    tell current session of current window
        write text \"cd $PWD/$1\"
        write text \"echo $PWD/$1 = $(pwd)\"
    end tell
  end tell"
}

## Gives permission to the current user to modify the current directory and all its files:
alias chownme='sudo chown -R $(id -u):$(id -g) .';

## Removes "read-only" permission from current directory, recursively:
alias chmodme='sudo chmod -R u+w .';

#############################################################
# YARN 
# Yarn is better than NPM, but it's missing shortcuts like "npm i". This adds shortcuts like "yi" is for "yarn install".
#############################################################

## Cleanup NPM modules, including lock files:
function yclean() {
  npm cache clean --force && 
  find . \( -name "out" -o -name ".next" -o -name "node_modules" \) -type d -prune -exec rm -rf '{}' +
  find . \( -name "pnpm-lock.yaml" -o -name "package-lock.json" -o -name "yarn.lock" -o -name "yarn-error.log" \) -type f -prune -exec rm -rf '{}' +
}

function yi() {
  if [ "$1" ]; then
    yarn add "$@"
  else
    yarn install
  fi
}
function yu() {
  yarn update "$@"
}
function yr() {
  yarn run "$@"
}
alias ydev='rm -rf .next && yarn run dev'
alias ybuild='yarn run build'
alias yname='git remote get-url origin'

# This doesn't do anything. Just a template for future functions. Still need to figure out how to add auto-completion
function example12() {
    FILTER1=""
    FILTER2=""

    while [[ $# -gt 0 ]]
    do
        key="$1"
        case $key in
            -f|--filter|-f1|--filter1)
                FILTER1="$2"
                shift # past argument
                shift # past value
                ;;
            -f=*|--filter=*|-f1=*|--filter1=*)
                FILTER1="${key#*=}"
                shift # past argument=value
                ;;
            -f2|--filter2)
                FILTER2="$2"
                shift # past argument
                shift # past value
                ;;
            -f2=*|--filter2=*)
                FILTER2="${key#*=}"
                shift # past argument=value
                ;;
            *)
                # unknown option
                echo "Error: Unexpected argument: $key"
                return 1
                ;;
        esac
    done

    echo "Filter1 value: $FILTER1"
    echo "Filter2 value: $FILTER2"
}

#############################################################
# GIT 
#############################################################

## Convert betweeb ssh<->https GIT connections
alias git-url-ssh='git remote set-url origin "$(git remote get-url origin | sed -E '\''s,^https://([^/]*)/(.*)$,git@\1:\2,'\'')"'
alias git-url-https='git remote set-url origin "$(git remote get-url origin | sed -E '\''s,^git@([^:]*):/*(.*)$,https://\1/\2,'\'')"'
alias git-url='git remote get-url origin'

function private-git-force-ssh() {
  compare1=$(git remote get-url origin)
  compare2=$(git remote get-url origin | sed -E 's,^https://([^/]*)/(.*)$,git@\1:\2,')
  if [ $compare1 = $compare2 ]; then
    # echo "Already using ssh"
  else
    # echo "Forcing ssh for all git remotes..."
    echo "Converting to use ssh..."
    git-url-ssh
  fi
}

## NEW BRANCH
function yb() {
  git checkout -b "$1" && git push --set-upstream origin "$1" && echo "PUSHED BRANCH $1"
}

## RESET TO HEAD
function yx() {
  # reset
  echo "resetting to HEAD"
  git fetch --all
  git add .
  branch=$(git symbolic-ref --short HEAD);
  git reset --hard HEAD # clear local changes
  git reset --hard origin/$branch # reset to remote
  git pull
  # log
  yy
}

## RESET TO SPECIFIC COMMIT HASH (ON REMOTE AS WELL AS IN LOCAL)
function yxxx() {
### Oops, I fucked up. How to get back to a previous commit?
# git log # to see previous commits. Find one that you want to go back in time to, copy its long hash id
### This function is a shortcut. Use it simply like this...
# yxxx 65be4b7147xc246b3c3495fa851de0x331xb3781
### OR, do it manually....
# yx # to undo all your un-pushed work in progress, so it won't mess up what we're doing next
# git reset --hard 65be4b7147xc246b3c3495fa851de0x331xb3781 # to reset to that specific hash
# git push --force # to push this change
# git status # to see if push was successful or if you're still ahead/behind
# git log # to see the new commit history
  # reset
  echo "resetting to SPECIFIC COMMIT HASH (ON REMOTE AS WELL AS IN LOCAL)"
  yx && git reset --hard $1 && git push --force && git status && git log
}

## UNDO LAST COMMIT - ON LOCAL ONLY
function yz() {
  git reset HEAD~1 # undo to previous LOCAL commit (which has not been pushed)
}
## UNDO LAST COMMIT - ON REMOTE ALSO
function yzz() {
  echo resetting to previous commit
  git add .
  git reset -\-hard HEAD~1 # undo to previous REMOTE commit
  git push -\-force
  echo '\n\n You must still run "git push --force" to save this operation \n'
}

## Shortcut for other functions here
function yy() {
  echo "\n\n"
  echo "STATUS:"
  git status
}

## ABORT MERGE IN PROGRESS
function ymx() {
  echo "ABORTING LOCAL MERGE IN PROGRESS"
  echo "\n\n"
  git merge --abort 2>/dev/null
}

## DELETE LOCAL BRANCH
function yd() {
  echo DELETING LOCAL $1
  git branch -D $1
  yy 
}

## DELETE LOCAL AND REMOTE
function ydd() {
  echo DELETING REMOTE $1
  echo "\n\n"
  # if [ $1 = main ]
  # then
  #   echo "CANNOT MERGE TO MAIN";
  #   return 1
  # fi
  git branch -D $1;
  # git push origin :$1;
  git push origin -d $1;
}

# UPDATE
function ya() {
  echo PULLING $1
  echo "\n"
  # Update
  git fetch
  if [ $1 ]; then
    git checkout $1
    git pull
  else
    git pull
  fi
  # Log
  yy
}

# UPDATE (WITH GIT STASH / POP) - USE WHEN COLLABORATION
function yaa() {
  echo STASHING AND PULLING $1
  echo "\n"
  # Update
  git stash
  git pull
  git stash pop
  # Log
  yy
}

## FIX MARKDOWN for GitHub flavor
# Add 2 spaces to the end of every line (but maximum 2, not more)
function ymd() {
  echo gitmd disabled
  # 	perl -pi -e 's/[\s]*?\n/\ \ \n/g' *.md;
  # 	perl -pi -e 's/[\s]*?\n/\ \ \n/g' */*.md;
  # 	perl -pi -e 's/[\s]*?\n/\ \ \n/g' */*/*.md;
  # 	perl -pi -e 's/[\s]*?\n/\ \ \n/g' */*/*/*.md;
}

# PUSH
function private-push() {
  echo "\n\n"
  echo PUSHING TO $branch
  git push
}

# SAVE
function ys() {
  branch=$(git symbolic-ref --short HEAD)
  # while true; do
  #   case "$1" in
  #     -f|--force)
  #       force="$2"
  #       shift 2;;
  #     --)
  #       break;;
  #     *)
  #       printf "Unknown option %s\n" "$1"
  #       exit 1;;
  #   esac
  # done
  # if [ $branch = main ]
  # then
  #   echo "CANNOT PUSH TO MAIN";
  #   return 1
  # fi
  private-git-force-ssh
  echo COMMITTING $1
  echo "\n\n"
  # First, go through and fix markdown files to be GitHub compatible
  gitmd
  # Pull, to make sure commit will not have problems because of untracked files
  git add .
  git pull
  # Experimental
  # git stash;
  # git pull;
  # git stash pop;
  # Save
  git add .
  # Commit && Push (if no pre-commit errors)
  git commit -m $1 && private-push && yy
}

# SAVE
function ysm() {
  branch=$(git symbolic-ref --short HEAD)
  # if branch is main, staging, integration, or production, then do not push
  if [[ $branch = "main" || $branch = "staging" || $branch = "integration" ]]
  then
    echo "CANNOT PUSH TO $branch";
    return 1
  fi
  private-git-force-ssh
  # Commit
  message="feat(cms): $1 --- squash this"
  echo "COMMITTING $branch with message\n\n$message"
  echo "\n\n"
  # First, go through and fix markdown files to be GitHub compatible
  gitmd
  # Pull
  git add .
  git pull
  # Save
  git add .
  git commit -m $message
  # push
  echo "\n\n"
  echo PUSHING TO $branch
  git push
  # log
  yy
}

# MERGE to $1, and stay on that branch
function ym() {
  branch=$(git symbolic-ref --short HEAD)
  echo "MERGING $branch TO $1"
  echo "\n\n"
  # Validate
  if [[ ! $1 ]]; then
    return 1
  fi
  # if [ $1 = main ]
  # then
  #   echo "CANNOT MERGE TO MAIN";
  #   return 1
  # fi
  # Merge
  git fetch
  git checkout $1
  git pull
  echo $2
  if [[ $2 ]]; then
    git merge $branch -m "merged from $branch - $2"
  else
    git merge $branch -m "merged from $branch"
  fi
  git push
  # Log
  yy
}

# MERGE $1 to $2, then go back go original branch you were on
#   takes 2 arguments, unlike the other ym
#   you do not have to be on the source branch, unlike the other ym
function ym2() {
  original_branch=$(git symbolic-ref --short HEAD)
  echo "MERGING $1 TO $2"
  echo "\n\n"
  # Validate
  if [[ ! $1 || ! $2 ]]; then
    echo "1 or 2 is empty"
    return 1
  fi
  # if [ $1 = main ]
  # then
  #   echo "CANNOT MERGE TO MAIN"
  #   return 1
  # fi
  # Merge
  ya $1
  ym $2
  ya $original_branch # apparently bash variables are not scoped to their function block like in JavaScript
  # Log
  yy
}

# MERGE to $1, THEN GO BACK TO ORIGINAL BRANCH
function yma() {
  branch=$(git symbolic-ref --short HEAD)
  echo "MERGING $branch TO $1"
  echo "\n\n"
  # Validate
  if [[ ! $1 ]]; then
    return 1
  fi
  # if [ $1 = main ]
  # then
  #   echo "CANNOT MERGE TO MAIN";
  #   return 1
  # fi
  # Merge
  git fetch
  git checkout $1
  git pull
  echo $2
  git merge $branch -m "merged from $branch"
  git push
  # Log
  yy && 
  # Go back to original branch
  ya $branch
}

# RENAME BRANCH NAME (BOTH LOCAL AND REMOTE)
function ymv() {
  # if [ $1 = main ]
  # then
  #   echo "CANNOT RENAME MAIN";
  #   return 1
  # fi
  # if [ $1 = staging ]
  # then
  #   echo "CANNOT RENAME STAGING";
  #   return 1
  # fi
  if [ $1 ]; then
    branch=$(git symbolic-ref --short HEAD)
    echo RENAMING $branch TO $1
    echo "\n\n"

    git branch -m $1
    git push origin -u $1
    git push origin --delete $branch

    echo DELETING LOCAL $1
    git checkout $1
    
    yy

  else
    echo "missing argument: name"
  fi
}

#############################################################
# DOCKER
#############################################################
function docker_killall() {
  docker stop $(docker ps -a -q)
  docker rm $(docker ps -a -q)
}
function docker_list() {
  docker container ls
}
function docker_cleanup() {
  docker rmi $(docker images -f "dangling=true" -q)
}