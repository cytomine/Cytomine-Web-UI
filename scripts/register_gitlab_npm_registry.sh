#!/bin/sh

if [ -z ${REPO_TOKEN+x} ]; then
  if [ -z ${1+x} ]; then
    echo "error: repo fetch token not set"
    echo "usage:" 
    echo " - '$SHELL $0 TOKEN' "
    echo " - or 'JS_CLIENT_REPO_TOKEN=TOKEN $SHELL $0'"
    exit 1
  else
    REPO_TOKEN=$1
  fi
fi

append_if_not_exist() {
  local content=$2
  local filepath=$1
  grep -Fxq $content $filepath || echo -e $content | tee -a $filepath > /dev/null
}

append_if_not_exist .npmrc "@cm:registry=https://${REPO_URL:=gitlab.cytom.in/api/v4/packages/npm/}"
append_if_not_exist .npmrc "//$REPO_URL:_authToken=$REPO_TOKEN"
