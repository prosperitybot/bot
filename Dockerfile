FROM node:alpine

# Creates the directory for the bot
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
COPY tsconfig.json /usr/src/bot
COPY src /usr/src/bot/src

RUN ls -a
RUN npm install
RUN npm run build

FROM node:alpine

# Creates the directory for the bot
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot

RUN npm install --only=production

COPY --from=0 /usr/src/bot/dist .
COPY translations /usr/src/bot/translations

# Start the bot
CMD ["node", "index.js"]