FROM php:8.1-apache

# Enable MySQL extension
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy API files to web root
COPY . /var/www/html/

EXPOSE 80