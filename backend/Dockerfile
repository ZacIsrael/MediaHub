# ----------- Stage 1: Build -----------
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app (including tsconfig and src)
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# ----------- Stage 2: Runtime -----------
FROM node:18 AS production

# Set working directory
WORKDIR /app

# Copy only production dependencies
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Set environment variable
ENV NODE_ENV=production

# Expose your port if needed (optional for Railway)
EXPOSE 4000

# Run the compiled app
CMD ["node", "dist/index.js"]
