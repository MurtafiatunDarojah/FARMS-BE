FROM node:lts-slim

# Create app directory
WORKDIR /usr/src/app/

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install
RUN npm install pm2 -g
RUN npm cache clean --force

RUN apt-get update -y
RUN apt-get install -y openssl

RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Expose the port your app is running on (if necessary)
EXPOSE 80

# Start the application with PM2 in cluster mode
CMD ["pm2-runtime", "server.js", "-i", "max"]

