
FROM registry.ci.openshift.org/open-cluster-management/builder:nodejs14-linux AS builder

ADD . /plugin
WORKDIR /plugin
RUN yarn install && yarn build

FROM registry.access.redhat.com/ubi8/nginx-118
ADD default.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder /plugin/dist .
CMD /usr/libexec/s2i/run
