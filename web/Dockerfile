FROM node:16-slim AS builder

WORKDIR /builds/imbue
ADD . .
RUN yarn install
RUN yarn run webpack build


FROM nginx:latest
COPY --from=builder /builds/imbue/dist /usr/share/nginx/html/dist

RUN rm /etc/nginx/conf.d/default.conf
ADD ./nginx/conf /etc/nginx/conf.d/
ADD ./nginx/templates /etc/nginx/templates/
ADD ./nginx/ssl /etc/ssl/

ENV SSL_PORT=8443
