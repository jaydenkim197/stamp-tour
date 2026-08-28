<?php
// getplaces_map.php

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

// CORS 설정 적용
require_once __DIR__ . '/../includes/cors.php';
setCorsHeaders();

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// 파라미터 체크
if (!isset($_GET['station_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing station_id']);
    exit;
}

$station_id = $_GET['station_id'];

try {
    // ✅ 스탬프 명소 구분을 위해 is_stampPlace 칼럼도 SELECT에 포함시킴
    $stmt = $pdo->prepare("
        SELECT id, name, description, latitude, longitude, is_stampPlace
        FROM places
        WHERE station_id = ?
    ");
    $stmt->execute([$station_id]);
    $places = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($places);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database query failed',
        'details' => $e->getMessage()
    ]);
}
