FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM cytomine/nginx:v1.2.0 as production-stage
COPY --from=build-stage /app/dist /tmp/dist

ADD nginx.conf.sample /tmp/nginx.conf.sample
ADD configuration.json.sample /tmp/configuration.json.sample

RUN apt-get update && apt-get install -y curl

ADD run.sh /tmp/run.sh
RUN chmod 755 /tmp/run.sh
ENTRYPOINT ["/tmp/run.sh"]
