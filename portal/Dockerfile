FROM 10.32.42.225:5000/node:12
COPY .  ./
#ARG PORTAL_ENV
RUN npm config set proxy "http://proxy.charite.de:8080/"
RUN npm config set https-proxy "http://proxy.charite.de:8080/"
RUN npm cache clear
RUN npm install
RUN npm run build-charite
#RUN npm run ${PORTAL_ENV}

FROM 10.32.42.225:5000/nginx:latest
COPY --from=0 build /usr/share/nginx/html/vre
EXPOSE 80

