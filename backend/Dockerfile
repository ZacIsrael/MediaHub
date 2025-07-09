# backend/Dockerfile

# Use official Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend code into the container
COPY . .

# Expose the port defined in your .env (e.g., 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
