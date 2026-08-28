<?php
// melb_tram_api/public/postReview.php
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

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "로그인이 필요합니다."]);
    exit;
}

try {
    if (!isset($_POST['place_id'], $_POST['content'], $_POST['rating'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "필수 항목 누락"]);
        exit;
    }

    $place_id = $_POST['place_id'];
    $user_id = $_SESSION['user_id'];
    $content = trim($_POST['content']);
    $rating = intval($_POST['rating']);

    // ✅ 이미지 업로드 처리
    $image_url = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . '/uploads/reviews/'; // ✅ public 폴더 안
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

        $filename = uniqid() . "_" . basename($_FILES['image']['name']);
        $target = $upload_dir . $filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
            $image_url = "/uploads/reviews/" . $filename; // ✅ 이 경로는 브라우저에서 접근 가능
        }
    }

    $stmt = $pdo->prepare("INSERT INTO reviews (place_id, user_id, content, rating, image_url) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$place_id, $user_id, $content, $rating, $image_url]);

    echo json_encode(["success" => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB 오류: " . $e->getMessage()]);
}
