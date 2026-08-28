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

require_once __DIR__ . '/db_connect.php';       // DB 연결

header('Content-Type: application/json');

// JSON 입력 받기
$data = json_decode(file_get_contents("php://input"), true);

// 필수 필드 체크
if (
    !isset($data['station_id']) || 
    !isset($data['name']) || 
    !isset($data['description']) || 
    !isset($data['image_url'])
) {
    echo json_encode(["error" => "모든 필드를 입력해주세요."]);
    exit;
}

$station_id = intval($data['station_id']);
$name = trim($data['name']);
$description = trim($data['description']);
$image_url = trim($data['image_url']);

try {
    $pdo = new PDO("mysql:host=localhost;dbname=melbourne_tram_guide;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $stmt = $pdo->prepare("INSERT INTO places (station_id, name, description, image_url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$station_id, $name, $description, $image_url]);

    $place_id = $pdo->lastInsertId();

    echo json_encode([
        "success" => true,
        "message" => "명소가 성공적으로 추가되었습니다.",
        "place_id" => $place_id
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
