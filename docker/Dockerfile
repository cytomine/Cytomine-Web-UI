#
# Copyright (c) 2009-2020. Authors: see NOTICE file.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

ARG SCRIPTS_REPO_TAG
ARG NODE_VERSION=14.16.1-alpine3.13

#######################################################################################
## Stage: build front-end
FROM node:${NODE_VERSION} as frontend-builder
WORKDIR /app

ADD . /app/Cytomine-Web-UI
WORKDIR /app/Cytomine-Web-UI
RUN npm install
RUN npm run build

#######################################################################################
## Stage: downloading provisioning scripts
FROM alpine/git:2.36.3 as scripts-downloader
ARG SCRIPTS_REPO_TAG

WORKDIR /root
RUN mkdir -p /root/scripts
RUN --mount=type=secret,id=scripts_repo_url \
    git clone $(cat /run/secrets/scripts_repo_url) /root/scripts \
    && cd /root/scripts \
    && git checkout tags/${SCRIPTS_REPO_TAG}

#######################################################################################
## Stage: dev image (with hot swap)
FROM node:${NODE_VERSION} as dev-server

WORKDIR /app
# ui source code should be mounted in /app

RUN apk update && apk add gettext

RUN mkdir /docker-entrypoint-cytomine.d/
COPY --from=scripts-downloader --chmod=774 /root/scripts/cytomine-entrypoint.sh /usr/local/bin/
COPY --from=scripts-downloader --chmod=774 /root/scripts/envsubst-on-templates-and-move.sh /docker-entrypoint-cytomine.d/500-envsubst-on-templates-and-move.sh

ENV WEB_UI_PORT=8887

ENTRYPOINT ["cytomine-entrypoint.sh", "docker-entrypoint.sh"]
# rebuild (ignoring current node-module folder) then serve
CMD ["npm", "run", "serve"]

#######################################################################################
## Stage: building nginx image serving the front-end
FROM nginx:1.22.1-alpine as prod-server

WORKDIR /app

# copying entrypoint scripts
RUN mkdir /docker-entrypoint-cytomine.d/
COPY --from=scripts-downloader --chmod=774 /root/scripts/cytomine-entrypoint.sh /usr/local/bin/
COPY --from=scripts-downloader --chmod=774 /root/scripts/envsubst-on-templates-and-move.sh /docker-entrypoint-cytomine.d/500-envsubst-on-templates-and-move.sh

COPY docker/configs/nginx.conf /etc/nginx/nginx.conf

# actual front end
COPY --from=frontend-builder /app/Cytomine-Web-UI/dist /app

ENTRYPOINT ["cytomine-entrypoint.sh", "/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

