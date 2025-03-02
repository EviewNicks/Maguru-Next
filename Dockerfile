# Menggunakan image node.js sebagai base
FROM node:16

# Set working directory
WORKDIR /app

# Copy semua file ke dalam container
COPY . /app

# Install dependencies
RUN npm install

# Expose port yang digunakan aplikasi
EXPOSE 3000

# Command untuk menjalankan aplikasi
CMD ["npm", "run", "dev"]