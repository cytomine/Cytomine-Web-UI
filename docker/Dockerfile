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

ADD . /app
WORKDIR /app
RUN npm rebuild node-sass
RUN npm run build

#######################################################################################
## Stage: dev image (with hot swap)
FROM node:${NODE_VERSION} as dev-server

WORKDIR /app
# ui source code should be mounted in /app

RUN apk update && apk add gettext

RUN mkdir /docker-entrypoint-cytomine.d/
COPY --from=cytomine/entrypoint-scripts:1.3.0 --chmod=774 /cytomine-entrypoint.sh /usr/local/bin/
COPY --from=cytomine/entrypoint-scripts:1.3.0 --chmod=774 /envsubst-on-templates-and-move.sh /docker-entrypoint-cytomine.d/500-envsubst-on-templates-and-move.sh
COPY --from=cytomine/entrypoint-scripts:1.3.0 --chmod=774 /run-npm-install.sh /docker-entrypoint-cytomine.d/750-run-npm-install.sh
COPY --chmod=774 scripts/generate-metadata-prefix-json-file.sh /docker-entrypoint-cytomine.d/875-generate-metadata-prefix-json-file.sh

ENTRYPOINT ["cytomine-entrypoint.sh", "docker-entrypoint.sh"]
# rebuild (ignoring current node-module folder) then serve
CMD ["npm", "run", "serve"]

#######################################################################################
## Stage: building nginx image serving the front-end
FROM nginx:1.22.1-alpine as prod-server

WORKDIR /app

# copying entrypoint scripts
RUN mkdir /docker-entrypoint-cytomine.d/
COPY --from=cytomine/entrypoint-scripts:1.3.0 --chmod=774 /cytomine-entrypoint.sh /usr/local/bin/
COPY --from=cytomine/entrypoint-scripts:1.3.0 --chmod=774 /envsubst-on-templates-and-move.sh /docker-entrypoint-cytomine.d/500-envsubst-on-templates-and-move.sh
COPY --chmod=774 scripts/generate-metadata-prefix-json-file.sh /docker-entrypoint-cytomine.d/750-generate-metadata-prefix-json-file.sh

COPY docker/configs/nginx.conf /etc/nginx/nginx.conf

# actual front end
COPY --from=frontend-builder /app/dist /app

ENTRYPOINT ["cytomine-entrypoint.sh", "/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

