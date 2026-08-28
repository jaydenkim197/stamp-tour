<?php
// 환경변수 로딩
require_once __DIR__ . '/../vendor/autoload.php';

// .env 파일 로드
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// 데이터베이스 설정
define('DB_HOST', $_ENV['DB_HOST'] ?? 'yamabiko.proxy.rlwy.net');
define('DB_PORT', $_ENV['DB_PORT'] ?? '55085');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'railway');
define('DB_USERNAME', $_ENV['DB_USERNAME'] ?? 'root');
define('DB_PASSWORD', $_ENV['DB_PASSWORD'] ?? 'LLeiCmOoBITYlbPUxlNtUdfUfXLNXMyt');

// API 키 설정
define('GEMINI_API_KEY', $_ENV['GEMINI_API_KEY'] ?? '');
define('GOOGLE_PLACE_API_KEY', $_ENV['GOOGLE_PLACE_API_KEY'] ?? '');

// 이미지 URL 설정
define('IMAGE_BASE_URL', $_ENV['IMAGE_BASE_URL'] ?? APP_URL);

// 애플리케이션 설정
define('APP_ENV', $_ENV['APP_ENV'] ?? 'production');
define('APP_DEBUG', $_ENV['APP_DEBUG'] ?? false);
define('APP_URL', $_ENV['APP_URL'] ?? 'https://melb-stamp-tour.netlify.app');

// CORS 설정
define('ALLOWED_ORIGINS', $_ENV['ALLOWED_ORIGINS'] ?? 'https://melb-stamp-tour.netlify.app'); 