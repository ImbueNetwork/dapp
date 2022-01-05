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

ENV HTTP_PORT=8081
ENV HTTPS_PORT=8443
ENV SSL_DHPARAM=/etc/nginx/conf.d/includes/dhparam.pem
ENV SSL_CERTS_CONF=conf.d/includes/self-signed.conf
ENV WEBFLOW_URL=https://imbue-e67fe2-46873a03f61498e3c4ae7180df.webflow.io
