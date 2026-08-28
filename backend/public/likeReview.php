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

require_once "db_connect.php";

header("Content-Type: application/json");

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->review_id) || !isset($data->user_id)) {
        echo json_encode(["success" => false, "message" => "필수 데이터 없음"]);
        exit;
    }

    $review_id = $data->review_id;
    $user_id = $data->user_id;

    // 1. 중복 체크
    $checkStmt = $pdo->prepare("SELECT * FROM review_likes WHERE review_id = ? AND user_id = ?");
    $checkStmt->execute([$review_id, $user_id]);

    if ($checkStmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "이미 좋아요를 눌렀습니다."]);
        exit;
    }

    // 2. 좋아요 테이블에 삽입
    $insertStmt = $pdo->prepare("INSERT INTO review_likes (review_id, user_id) VALUES (?, ?)");
    $insertStmt->execute([$review_id, $user_id]);

    // 3. 리뷰 테이블 좋아요 수 증가
    $updateStmt = $pdo->prepare("UPDATE reviews SET likes = likes + 1 WHERE id = ?");
    $updateStmt->execute([$review_id]);

    // 4. 증가된 좋아요 수 반환
    $countStmt = $pdo->prepare("SELECT likes FROM reviews WHERE id = ?");
    $countStmt->execute([$review_id]);
    $likes = $countStmt->fetchColumn();

    echo json_encode(["success" => true, "new_likes" => (int)$likes]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
