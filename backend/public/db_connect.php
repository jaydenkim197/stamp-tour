<?php
// melb_tram_api/public/db_connect.php

// 환경변수 설정 파일 로드
require_once __DIR__ . '/../includes/config.php';

$host = DB_HOST;
$port = DB_PORT;
$dbname = DB_NAME;
$username = DB_USERNAME;
$password = DB_PASSWORD;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    $error = "DB 연결 실패: " . $e->getMessage();
    if (php_sapi_name() === 'cli') {
        echo "❌ {$error}\n";
        exit(1);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $error]);
        exit;
    }
}
