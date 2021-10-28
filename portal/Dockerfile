FROM node:12
#ARG PORTAL_ENV
COPY package.json ./
COPY package-lock.json  ./
COPY yarn.lock ./
RUN npm install
COPY .  ./
RUN npm run build-charite
#RUN npm run ${PORTAL_ENV}

FROM nginx:latest
COPY --from=0 build /usr/share/nginx/html/vre
EXPOSE 80
