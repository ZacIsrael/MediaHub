# Use Node 18 as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy all remaining project files
COPY . .

# Compile TypeScript -> JavaScript into /dist
RUN npm run build

# Start the application
CMD ["node", "dist/index.js"]
