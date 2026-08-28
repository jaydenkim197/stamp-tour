<?php
// melb_tram_api/public/getFavoriteStations.php

// 환경변수 설정 파일 로드
require_once __DIR__ . '/../includes/config.php';

// CORS 설정
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = explode(',', ALLOWED_ORIGINS);
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: " . APP_URL);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "db_connect.php";

header("Content-Type: application/json");

// user_id 필수
if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "user_id가 필요합니다."]);
    exit();
}

$user_id = $_GET['user_id'];

try {
    $stmt = $pdo->prepare("
        SELECT s.*
        FROM stations s
        JOIN user_stations ufs ON s.id = ufs.station_id
        WHERE ufs.user_id = :user_id
    ");
    $stmt->execute([':user_id' => $user_id]);
    $favoriteStations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($favoriteStations);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB 오류: " . $e->getMessage()]);
}
?>
