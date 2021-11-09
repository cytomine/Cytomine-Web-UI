#!/bin/bash

set -o xtrace
set -o errexit

echo "************************************** Publish docker ******************************************"

file='./ci/version'
VERSION_NUMBER=$(<"$file")
echo "$1"
docker build --no-cache --rm -f scripts/docker/web-ui/Dockerfile -t  cytomine/web_ui:v$VERSION_NUMBER .

docker push cytomine/web_ui:v$VERSION_NUMBER

docker rmi cytomine/web_ui:v$VERSION_NUMBER
