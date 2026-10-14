
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

USER node

EXPOSE 5001

CMD ["node", "server.js"]
