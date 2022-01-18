FROM ubuntu:18.04

RUN apt-get update
ENV NODE_VERSION=12.6.0
RUN apt install -y curl
# Installation node
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
# Installation python
RUN apt-get update && \
    apt-get install --no-install-recommends -y \
    python3 python3-pip python3-dev
RUN apt install -y build-essential
RUN pip3 install wheel
RUN pip3 install --upgrade setuptools
RUN apt-get install docker.io -y
RUN pip3 install mavsdk
RUN pip3 install requests
RUN pip3 install random_object_id
RUN pip3 install asyncio
RUN pip3 install folium
RUN pip3 install selenium
RUN pip3 install Image
RUN pip3 install webdriver-manager
RUN apt-get install -y firefox
# Installation du projet sans node_modules
COPY . ./rescue-tactic
WORKDIR /rescue-tactic
# Installation des dépendances

RUN npm install
EXPOSE 3000
CMD node -r dotenv/config server.js
