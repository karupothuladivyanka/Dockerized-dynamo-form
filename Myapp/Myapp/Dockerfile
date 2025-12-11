# Use the official Node.js LTS image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project
COPY . .

# Create uploads folder inside the container
RUN mkdir -p uploads

# Expose app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
