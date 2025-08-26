FROM node:22.17.0

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm install --legacy-peer-deps --include=dev --no-cache

COPY . .

EXPOSE 5173

# MODIFIEZ CETTE LIGNE :
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]