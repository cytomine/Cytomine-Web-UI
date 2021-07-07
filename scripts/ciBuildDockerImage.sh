#!/bin/bash

set -o xtrace
set -o errexit

echo "************************************** Publish docker ******************************************"

file='./ci/version'
VERSION_NUMBER=$(<"$file")
file='./ci/url'
CORE_URL=$(<"$file")

docker build --rm -f scripts/docker/web-ui/Dockerfile --build-arg CURRENT_BRANCH=$GIT_BRANCH -t  cytomine/web_ui:v$VERSION_NUMBER ./scripts/docker/web-ui

docker push cytomine/web_ui:v$VERSION_NUMBER

docker rmi cytomine/web_ui:v$VERSION_NUMBER
