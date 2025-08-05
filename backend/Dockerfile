# Use official Node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Install TypeScript and ts-node globally (optional)
RUN npm install -g ts-node typescript

# Expose port (adjust if needed)
EXPOSE 4000

# Start the app
# CMD ["npx", "nodemon"]
CMD ["npx", "ts-node", "index.ts"]

