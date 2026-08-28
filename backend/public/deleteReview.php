<?php
// melb_tram_api/public/deleteReview.php

$origin = "https://melb-stamp-tour.netlify.app";

if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}

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

// ✅ 세션 설정 및 시작
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);
session_start();

require_once "db_connect.php";

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "POST 요청만 허용됩니다."]);
    exit();
}

// ✅ 로그인 사용자 확인
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "로그인이 필요합니다."]);
    exit();
}

$user_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents("php://input"));
$review_id = $data->review_id ?? null;

if (!$review_id) {
    http_response_code(400);
    echo json_encode(["error" => "review_id가 필요합니다."]);
    exit();
}

try {
    // ✅ 내가 쓴 후기인지 확인
    $check = $pdo->prepare("SELECT * FROM reviews WHERE id = :review_id AND user_id = :user_id");
    $check->execute([
        ':review_id' => $review_id,
        ':user_id' => $user_id
    ]);

    if ($check->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(["error" => "본인 후기만 삭제할 수 있습니다."]);
        exit();
    }

    // ✅ 삭제
    $delete = $pdo->prepare("DELETE FROM reviews WHERE id = :review_id");
    $delete->execute([':review_id' => $review_id]);

    echo json_encode(["status" => "success", "message" => "후기가 삭제되었습니다."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB 오류: " . $e->getMessage()]);
}
