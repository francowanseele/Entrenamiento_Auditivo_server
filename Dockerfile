FROM ubuntu:20.04

USER root
COPY . .

RUN apt-get update
RUN apt-get install -y timidity
RUN apt-get install -y ffmpeg


RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
RUN npm install


# RUN apt-get install npm
# RUN npm install --global yarn


# FROM node:17-alpine




# RUN yarn

CMD [ "node", "index.js" ]