FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM cytomine/nginx:v1.2.0 as production-stage
COPY --from=build-stage /app/dist /tmp/dist
