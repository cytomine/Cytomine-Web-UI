#!/bin/bash

set -o xtrace
set -o errexit

srcRoot=$(git rev-parse --show-toplevel)
cd $srcRoot

# get version number from git
lastGitTag=$(git describe --long --dirty)

if [[ $lastGitTag =~ v[0-9]+.[0-9]+.[0-9]+-0-[0-9a-g]{8,9}$ ]]; then
  # official release x.y.z
  versionNumber=$(echo $lastGitTag | sed -r "s/v([0-9]+\.[0-9]+\.[0-9]+)-[0-9]+-.+/\1/")
else
  # rc: branchname + date + 'SNAPSHOT'
  versionNumber=${1:-$(git rev-parse --abbrev-ref HEAD)}-$(date "+%Y%m%d%H%M%S")-SNAPSHOT
fi
echo $versionNumber
echo $versionNumber > ./ci/version
