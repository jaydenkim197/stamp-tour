<?php
// CORS 설정을 위한 공통 헤더 함수
function setCorsHeaders() {
    // 환경변수 설정 파일 로드
    require_once __DIR__ . '/config.php';
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = explode(',', ALLOWED_ORIGINS);
    
    // 허용된 origin인지 확인
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: " . APP_URL);
    }
    
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    // OPTIONS 프리플라이트 요청 처리
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
} 