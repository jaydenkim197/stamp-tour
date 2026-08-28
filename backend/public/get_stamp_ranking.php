<?php
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

require_once __DIR__ . '/db_connect.php';        // DB 연결 포함

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("
        SELECT u.id AS user_id, u.name, COUNT(s.id) AS stamp_count
        FROM users u
        LEFT JOIN stamps s ON u.id = s.user_id
        GROUP BY u.id, u.name
        ORDER BY stamp_count DESC
    ");
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'ranking' => $result
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'DB 오류: ' . $e->getMessage()
    ]);
}
