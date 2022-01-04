from node:16-slim AS builder

WORKDIR /builds/imbue
ADD . .
RUN yarn install
RUN yarn run webpack build

from nginx:latest

RUN rm /etc/nginx/conf.d/default.conf
ADD ./nginx/conf /etc/nginx/conf.d/
ADD ./nginx/ssl /etc/ssl/
COPY --from=builder /builds/imbue/dist /usr/share/nginx/html/dist

ENV DOLLAR=\$
ENV SSL_PORT=8443

CMD [ "/bin/bash"\
    , "-c"\
    , "envsubst\
        < /etc/nginx/conf.d/imbue.conf.template\
        > /etc/nginx/conf.d/imbue.conf;\
        /docker-entrypoint.sh nginx -g 'daemon off;'"\
    ]
