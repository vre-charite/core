FROM node:12
COPY .  ./
ARG PORTAL_ENV
RUN npm install
RUN npm run ${PORTAL_ENV}

FROM nginx
COPY --from=0 build /usr/share/nginx/html/vre
EXPOSE 80

