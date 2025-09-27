FROM node:20 AS builder

RUN apt-get update && apt-get install -y ghostscript graphicsmagick

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20

RUN apt-get update && apt-get install -y ghostscript graphicsmagick

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]