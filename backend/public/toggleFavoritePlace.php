<?php
// melb_tram_api/public/toggleFavoritePlace.php
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

// POST 방식만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "POST 요청만 허용됩니다."]);
    exit();
}

// JSON 파싱
$data = json_decode(file_get_contents("php://input"));

$user_id = $data->user_id ?? null;
$place_id = $data->place_id ?? null;

// 유효성 검사
if (!$user_id || !$place_id) {
    http_response_code(400);
    echo json_encode(["error" => "user_id와 place_id를 모두 입력하세요."]);
    exit();
}

try {
    // 즐겨찾기 여부 확인
    $stmt = $pdo->prepare("SELECT * FROM user_places WHERE user_id = :user_id AND place_id = :place_id");
    $stmt->execute([
        ":user_id" => $user_id,
        ":place_id" => $place_id
    ]);

    if ($stmt->rowCount() > 0) {
        // 이미 즐겨찾기에 있음 → 삭제
        $deleteStmt = $pdo->prepare("DELETE FROM user_places WHERE user_id = :user_id AND place_id = :place_id");
        $deleteStmt->execute([
            ":user_id" => $user_id,
            ":place_id" => $place_id
        ]);
        echo json_encode(["status" => "removed"]);
    } else {
        // 없으면 추가
        $insertStmt = $pdo->prepare("INSERT INTO user_places (user_id, place_id) VALUES (:user_id, :place_id)");
        $insertStmt->execute([
            ":user_id" => $user_id,
            ":place_id" => $place_id
        ]);
        echo json_encode(["status" => "added"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB 오류: " . $e->getMessage()]);
}
?>
