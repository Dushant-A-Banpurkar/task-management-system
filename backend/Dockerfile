FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
