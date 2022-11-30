# Copyright 2022 Indoc Research
# 
# Licensed under the EUPL, Version 1.2 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
# 
# https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
# 
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
# 

FROM python:3.7-buster

ARG pip_username
ARG pip_password
ARG MINIO_USERNAME
ARG MINIO_PASSWORD

ENV MINIO_USERNAME=$MINIO_USERNAME
ENV MINIO_PASSWORD=$MINIO_PASSWORD

RUN groupadd --gid 1004 deploy \
    && useradd --home-dir /home/deploy --create-home --uid 1004 \
        --gid 1004 --shell /bin/sh --skel /dev/null deploy
WORKDIR /home/deploy

COPY mc /usr/local/bin
RUN chmod +x /usr/local/bin/mc

COPY .  ./

RUN chown -R deploy:deploy /home/deploy
RUN apt-get update && apt-get install libsasl2-dev python-dev libldap2-dev libssl-dev -y && rm -rf /var/lib/apt/lists/*
USER deploy
RUN chmod +x /home/deploy/gunicorn_starter.sh
RUN pip install --no-cache-dir -r requirements.txt --user
RUN PIP_USERNAME=$pip_username PIP_PASSWORD=$pip_password pip install --no-cache-dir -r internal_requirements.txt
ENV PATH="/home/deploy/.local/bin:${PATH}"
ENV MINIO_USERNAME=$MINIO_USERNAME
ENV MINIO_PASSWORD=$MINIO_PASSWORD
CMD ["sh", "-c", "mc alias set minio http://minio.minio:9000 $MINIO_USERNAME $MINIO_PASSWORD && ./gunicorn_starter.sh"]

