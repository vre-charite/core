FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY page/ ./

COPY page/ ./vre/

COPY page/ ./maintenance-page/

ENTRYPOINT ["nginx", "-g", "daemon off;"]

EXPOSE 80

