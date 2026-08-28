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

require_once __DIR__ . '/db_connect.php';        // DB 연결

header('Content-Type: application/json');

// JSON 데이터 받기
$data = json_decode(file_get_contents("php://input"), true);

// place_id 유효성 확인
if (!isset($data['place_id']) || !is_numeric($data['place_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "place_id가 필요합니다."]);
    exit;
}

$placeId = intval($data['place_id']);

try {
    // 트랜잭션 시작
    $pdo->beginTransaction();

    // 연관된 리뷰 먼저 삭제 (필요 시)
    $stmtReviews = $pdo->prepare("DELETE FROM reviews WHERE place_id = ?");
    $stmtReviews->execute([$placeId]);

    // 명소 삭제
    $stmtPlace = $pdo->prepare("DELETE FROM places WHERE id = ?");
    $stmtPlace->execute([$placeId]);

    if ($stmtPlace->rowCount() > 0) {
        $pdo->commit();
        echo json_encode(["success" => true, "message" => "명소가 삭제되었습니다."]);
    } else {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["error" => "해당 명소를 찾을 수 없습니다."]);
    }

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "서버 오류: " . $e->getMessage()]);
}
