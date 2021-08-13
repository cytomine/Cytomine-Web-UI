#!/bin/bash

set -o xtrace
set -o errexit

echo "************************************** Publish docker ******************************************"

file='./ci/version'
VERSION_NUMBER=$(<"$file")
echo "$1"
docker build --no-cache --rm -f scripts/docker/web-ui/Dockerfile -t  repository.cytom.in:5004/web_ui-$CUSTOMER:v$VERSION_NUMBER .

docker push repository.cytom.in:5004/web_ui-$CUSTOMER:v$VERSION_NUMBER

docker rmi repository.cytom.in:5004/web_ui-$CUSTOMER:v$VERSION_NUMBER

echo "Image: repository.cytom.in:5004/web_ui-$CUSTOMER:v$VERSION_NUMBER"

echo "In order to download image on a new host:"
echo "1. Create/Modify /etc/docker/daemon.json file with this: "
echo "{ \"insecure-registries\":[\"repository.cytom.in:5004\"] }"
echo "2. Restart docker service"
echo "3. sudo docker login -u jenkins http://repository.cytom.in:5004"
