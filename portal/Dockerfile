FROM 10.32.42.225:5000/node:12
#ARG PORTAL_ENV
COPY package.json ./
COPY package-lock.json  ./
COPY yarn.lock ./
RUN npm config set proxy "http://proxy.charite.de:8080/"
RUN npm config set https-proxy "http://proxy.charite.de:8080/"
RUN npm install
COPY .  ./
RUN npm run build-charite
#RUN npm run ${PORTAL_ENV}

FROM 10.32.42.225:5000/nginx:latest
COPY --from=0 build /usr/share/nginx/html/vre
EXPOSE 80
