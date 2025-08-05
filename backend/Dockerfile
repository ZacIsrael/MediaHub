# Use a lightweight Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm install -g typescript
RUN tsc

# Expose port
EXPOSE 4000

# Run the compiled JavaScript
CMD ["node", "dist/index.js"]
