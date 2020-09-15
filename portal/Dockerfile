FROM 10.32.42.225:5000/node:12
COPY .  ./
ARG PORTAL_ENV
RUN http_proxy="http://proxy.charite.de:8080/" npm ins/tall
RUN http_proxy="http://proxy.charite.de:8080/" npm run ${PORTAL_ENV}

FROM 10.32.42.225:5000/nginx:latest
COPY --from=0 build /usr/share/nginx/html/vre
EXPOSE 80

