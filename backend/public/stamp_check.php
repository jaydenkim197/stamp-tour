<?php
// stamp_check.php
$origin = "https://melb-stamp-tour.netlify.app";

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

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '', // 동일 도메인 내부라면 빈값으로
    'secure' => true, // Netlify는 HTTPS 배포이므로 true
    'httponly' => true,
    'samesite' => 'None'
]);
session_start();

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// ✅ 로그인된 사용자 확인
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => '로그인이 필요합니다.']);
    exit;
}

$user_id = $_SESSION['user_id'];


// ✅ place_id 유효성 검사
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['place_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'place_id가 필요합니다.']);
    exit;
}

$place_id = intval($data['place_id']);

try {
    // ✅ 기존 스탬프 확인
    $stmt = $pdo->prepare("SELECT id FROM stamps WHERE user_id = ? AND place_id = ?");
    $stmt->execute([$user_id, $place_id]);

    if ($stmt->fetch()) {
        echo json_encode(['status' => 'exists']);
    } else {
        // ✅ 신규 스탬프 발급
        $stmt = $pdo->prepare("INSERT INTO stamps (user_id, place_id, earned_at) VALUES (?, ?, NOW())");
        $stmt->execute([$user_id, $place_id]);
        echo json_encode(['status' => 'new']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'DB 오류: ' . $e->getMessage()]);
}
