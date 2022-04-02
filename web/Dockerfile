ARG IMBUE_DOCKERFILE_NODE_IMAGE="node:16-slim"

FROM ${IMBUE_DOCKERFILE_NODE_IMAGE} AS builder

ARG IMBUE_LOCAL_INIT_SCRIPTS

WORKDIR /builds/imbue
ADD . .

RUN if [ "${IMBUE_LOCAL_INIT_SCRIPTS}x" != "x" ]; then \
        for file in ${IMBUE_LOCAL_INIT_SCRIPTS}/*; do bash -l $file; done;\
    fi

RUN yarn install
RUN yarn run webpack build


FROM nginx:latest
COPY --from=builder /builds/imbue/dist /usr/share/nginx/html/dist

RUN rm /etc/nginx/conf.d/default.conf
ADD ./nginx/conf /etc/nginx/conf.d/
ADD ./nginx/templates /etc/nginx/templates/

ADD ./assets /usr/share/nginx/html/assets

ENV HTTP_PORT=80
ENV WEBFLOW_URL=https://imbue-e67fe2-46873a03f61498e3c4ae7180df.webflow.io

# FIXME: if we're always behind a load-balancer, etc., that handles TLS for us,
# will it ever make sense to require these certs, configs, et al.?
ADD ./nginx/ssl /etc/ssl/
ENV HTTPS_PORT=8443
ENV SSL_DHPARAM=/etc/nginx/conf.d/includes/dhparam.pem
ENV SSL_CERTS_CONF=conf.d/includes/self-signed.conf
