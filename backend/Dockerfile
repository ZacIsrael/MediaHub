# Step 1: Use a lightweight Node base image
FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy only the package files first (leverage Docker layer caching)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your app
COPY . .

# Step 6: Build the TypeScript project
RUN npm run build

# Step 7: DEBUG - Check if dist/index.js was created
RUN echo "Contents of dist directory:" && ls -al dist

# Step 8: Expose the app port (Railway will use PORT env variable)
EXPOSE 4000

# Step 9: Start the app using the built JavaScript file
CMD ["node", "dist/index.js"]
