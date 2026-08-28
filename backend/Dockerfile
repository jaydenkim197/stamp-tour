# PHP + Apache 공식 이미지 사용
FROM php:8.2-apache

# 필요한 PHP 확장 설치
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Apache 모듈 활성화
RUN a2enmod rewrite headers

# 도구 설치
RUN apt-get update && apt-get install -y nano curl unzip

# CORS 허용 (headers 모듈이 활성화된 이후에 설정해야 함)
RUN echo "Header set Access-Control-Allow-Origin \"*\"" >> /etc/apache2/apache2.conf

# ✅ Composer 설치
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# 프로젝트 파일 복사
COPY ./public/ /var/www/html/
COPY ./public/uploads/reviews/ /var/www/html/uploads/reviews/
COPY ./includes/ /var/www/includes/
COPY composer.json composer.lock .env /var/www/

# 작업 디렉토리 설정
WORKDIR /var/www

# Composer 의존성 설치
RUN composer install --no-dev --optimize-autoloader

# 퍼미션 설정
RUN chown -R www-data:www-data /var/www \
  && chmod -R 755 /var/www

# 기본 포트
EXPOSE 80
