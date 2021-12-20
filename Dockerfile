FROM registry-proxy.engineering.redhat.com/rh-osbs/rhacm2-yarn-builder:v2.3.0_14-1.20210810163126 AS build
RUN dnf install -y git

ADD . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install && yarn build

FROM nginx:stable

RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html