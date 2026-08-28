<?php
// melb_tram_api/public/uploadImage.php
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

require_once __DIR__ . '/db_connect.php';

header("Content-Type: application/json");

$uploadDir = "../uploads/";

// 업로드 폴더 없으면 생성
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "POST 요청만 허용됩니다."]);
    exit();
}

// 파일 유무 확인
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "이미지 파일이 필요하거나 업로드에 실패했습니다."]);
    exit();
}

$image = $_FILES['image'];

// 📌 실제 MIME 타입을 파일 내용 기반으로 검사
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $image['tmp_name']);
finfo_close($finfo);

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($mime, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["error" => "지원되지 않는 이미지 형식입니다."]);
    exit();
}

// 파일명 안전하게 생성
$ext = pathinfo($image['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . $ext;
$targetPath = $uploadDir . $filename;

// 파일 저장
if (move_uploaded_file($image['tmp_name'], $targetPath)) {
    $url = "http://localhost/melb_tram_api/uploads/" . $filename;
    echo json_encode(["status" => "success", "url" => $url]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "파일 업로드 실패"]);
}
?>
