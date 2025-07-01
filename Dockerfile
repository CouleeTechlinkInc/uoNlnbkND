FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create data directory and file
RUN touch data.json

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 