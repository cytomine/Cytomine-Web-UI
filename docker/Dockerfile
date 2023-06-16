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

ARG WEB_UI_VERSION
ARG WEB_UI_REVISION
ARG JS_CLIENT_REPO_URL=gitlab.cytom.in/api/v4/packages/npm/
ARG NODE_VERSION=14.16.1-alpine3.13
ARG NGINX_VERSION=1.22.1
ARG ENTRYPOINT_SCRIPTS_VERSION=1.3.0


#######################################################################################
## Stage: build front-end
FROM node:${NODE_VERSION} as frontend-builder

# URL of the package registry (no scheme)
ENV REPO_URL=${JS_CLIENT_REPO_URL}
ENV REPO_TOKEN=${JS_CLIENT_REPO_TOKEN}

RUN echo "WEB_UI_VERSION=${WEB_UI_VERSION}, REPO_URL=${REPO_URL}, REPO_TOKEN=${REPO_TOKEN}, JS_CLIENT_REPO_URL=${JS_CLIENT_REPO_URL}, JS_CLIENT_REPO_TOKEN=${JS_CLIENT_REPO_TOKEN}"

ADD . /app
WORKDIR /app

# (re-)add script explicitely with correct executable permissions
COPY --chmod=744 scripts/register_gitlab_npm_registry.sh scripts/register_gitlab_npm_registry.sh

# create .npmrc for fetching JS Client from private package repository
# js_client_repo_auth_token: a build secret, the access token (in GitLab, this token must have with 'read_api' scope and at least 'Reporter' role )
RUN --mount=type=secret,id=js_client_repo_auth_token \
    ./scripts/register_gitlab_npm_registry.sh ${REPO_TOKEN} && \
    npm install && \
    npm run build && \
    rm .npmrc

#######################################################################################
## Stage: entrypoint script. Use a multi-stage because COPY --from cannot interpolate variables
FROM cytomine/entrypoint-scripts:${ENTRYPOINT_SCRIPTS_VERSION} as entrypoint-scripts

#######################################################################################
## Stage: dev image (with hot swap)
FROM node:${NODE_VERSION} as dev-server
WORKDIR /app
# ui source code should be mounted in /app

RUN apk update && apk add gettext

RUN mkdir /docker-entrypoint-cytomine.d/
# COPY --from cannot interpolate variables
COPY --from=entrypoint-scripts --chmod=744 /cytomine-entrypoint.sh /usr/local/bin/
COPY --from=entrypoint-scripts --chmod=744 /envsubst-on-templates-and-move.sh /docker-entrypoint-cytomine.d/500-envsubst-on-templates-and-move.sh
COPY --from=entrypoint-scripts --chmod=744 /run-npm-install.sh /docker-entrypoint-cytomine.d/750-run-npm-install.sh
COPY --chmod=744 scripts/generate-metadata-prefix-json-file.sh /docker-entrypoint-cytomine.d/875-generate-metadata-prefix-json-file.sh

ENTRYPOINT ["cytomine-entrypoint.sh", "docker-entrypoint.sh"]
# rebuild (ignoring current node-module folder) then serve
CMD ["npm", "run", "serve"]

#######################################################################################
## Stage: building nginx image serving the front-end
FROM nginx:${NGINX_VERSION}-alpine as prod-server

LABEL org.opencontainers.image.authors='support@cytomine.com' \
      org.opencontainers.image.url='https://www.cytomine.org/' \
      org.opencontainers.image.documentation='https://doc.cytomine.org/' \
      org.opencontainers.image.source='https://gitlab.cytom.in/cm/rnd/cytomine/frontend/web-ui-ee' \
      org.opencontainers.image.vendor='Cytomine Corporation SA' \
      org.opencontainers.image.version=${WEB_UI_VERSION} \
      org.opencontainers.image.revision=${WEB_UI_REVISION} \
      org.opencontainers.image.deps.nginx.version=${NGINX_VERSION} \
      org.opencontainers.image.deps.node.version=${NODE_VERSION} \
      org.opencontainers.image.deps.node.entrypoint.scripts.version=${ENTRYPOINT_SCRIPTS_VERSION}

WORKDIR /app

# copying entrypoint scripts
RUN mkdir /docker-entrypoint-cytomine.d/
COPY --from=entrypoint-scripts --chmod=744 /cytomine-entrypoint.sh /usr/local/bin/
COPY --from=entrypoint-scripts --chmod=744 /envsubst-on-templates-and-move.sh /docker-entrypoint-cytomine.d/500-envsubst-on-templates-and-move.sh
COPY --chmod=744 scripts/generate-metadata-prefix-json-file.sh /docker-entrypoint-cytomine.d/750-generate-metadata-prefix-json-file.sh

COPY docker/configs/nginx.conf /etc/nginx/nginx.conf

# actual front end
COPY --from=frontend-builder /app/dist /app

ENTRYPOINT ["cytomine-entrypoint.sh", "/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

