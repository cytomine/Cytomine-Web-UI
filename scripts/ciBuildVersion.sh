#!/bin/bash

set -o xtrace
set -o errexit

srcRoot=$(git rev-parse --show-toplevel)
cd $srcRoot

# get version number from git
lastGitTag=$(git describe --long --dirty)

if [[ $lastGitTag =~ v[0-9]+.[0-9]+.[0-9]+-beta.[0-9]+-0-[0-9a-g]{8,9}$ ]]; then
  echo "BETA"
  versionNumber=$(echo $lastGitTag | sed -r "s/v([0-9]+\.[0-9]+\.[0-9]+-beta.[0-9]+)-[0-9]+-.+/\1/")
elif [[ $lastGitTag =~ v[0-9]+.[0-9]+.[0-9]+-0-[0-9a-g]{8,9}$ ]]; then
  echo "OFFICIAL"
  versionNumber=$(echo $lastGitTag | sed -r "s/v([0-9]+\.[0-9]+\.[0-9]+)-[0-9]+-.+/\1/")
else
  echo "WARNING: invalid tag for an official release $lastGitTag"
  versionNumber=${1:-$(git rev-parse --abbrev-ref HEAD)}-$(date "+%Y%m%d%H%M%S")-SNAPSHOT
fi
echo $versionNumber
echo $versionNumber > ./ci/version
