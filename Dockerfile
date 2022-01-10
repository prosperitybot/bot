FROM node:alpine

# Creates the directory for the bot
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install

COPY src /usr/src/bot/src

# Start the bot
CMD ["node", "src/index.js"]