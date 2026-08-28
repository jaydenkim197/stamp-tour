<?php
// melb_tram_api/public/getUserStamps.php
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
session_start(); // ✅ 세션 시작

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// ✅ 세션에서 user_id 확인
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // 인증 필요
    echo json_encode(["error" => "로그인이 필요합니다."]);
    exit();
}

$user_id = $_SESSION['user_id'];

try {
    // 스탬프 받은 명소 정보 조회
    $stmt = $pdo->prepare("
        SELECT 
            s.place_id,
            p.name AS place_name,
            p.category,
            p.subcategory,
            p.latitude,
            p.longitude,
            s.earned_at
        FROM stamps s
        JOIN places p ON s.place_id = p.id
        WHERE s.user_id = :user_id
        ORDER BY s.earned_at DESC
    ");
    $stmt->execute([':user_id' => $user_id]);
    $stamps = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($stamps);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB 오류: " . $e->getMessage()]);
}
