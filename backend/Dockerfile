# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install all dependencies including devDependencies (like typescript)
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the TypeScript project
RUN npx tsc

# Expose the port your app runs on
EXPOSE 4000

# Start the application
CMD ["node", "dist/index.js"]
