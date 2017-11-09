FROM mhart/alpine-node:8
MAINTAINER Kevin Brown <kevin@rindecuentas.org>

ENV NODE_ENV=production

RUN apk --no-cache add tini \
  && addgroup -S node \
  && adduser -S -G node node

WORKDIR /src

COPY package.json .

COPY . .

RUN chown -R node:node /src

EXPOSE $PORT

USER node
RUN npm install -g --silent .

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./bin/updateProduction.sh"]
