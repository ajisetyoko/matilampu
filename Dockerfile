FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server/ ./server/


# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/index.cjs"]
