<?php
// public/editReview.php

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

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['review_id'], $data['user_id'], $data['content'], $data['rating'])) {
    http_response_code(400);
    echo json_encode(["error" => "필수 항목이 누락되었습니다."]);
    exit();
}

$review_id = $data['review_id'];
$user_id = $data['user_id'];
$content = $data['content'];
$rating = $data['rating'];
$image_url = isset($data['image_url']) ? $data['image_url'] : null;

try {
    // 본인 리뷰인지 확인
    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE id = :review_id AND user_id = :user_id");
    $stmt->execute(['review_id' => $review_id, 'user_id' => $user_id]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(["error" => "해당 리뷰를 수정할 권한이 없습니다."]);
        exit();
    }

    // 수정 실행
    $stmt = $pdo->prepare("
        UPDATE reviews
        SET content = :content, rating = :rating, image_url = :image_url
        WHERE id = :review_id
    ");
    $stmt->execute([
        'content' => $content,
        'rating' => $rating,
        'image_url' => $image_url,
        'review_id' => $review_id
    ]);

    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB 오류: " . $e->getMessage()]);
}
?>
