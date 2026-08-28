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

header("Content-Type: application/json");

// ✅ 로그인 상태 확인
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(["success" => false, "message" => "로그인이 필요합니다."]);
  exit;
}

try {
  $data = json_decode(file_get_contents("php://input"));

  if (!isset($data->review_id, $data->content)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "필수 입력 누락"]);
    exit;
  }

  $review_id = $data->review_id;
  $user_id = $_SESSION['user_id']; // ✅ 세션에서 user_id 가져옴
  $content = trim($data->content);

  $stmt = $pdo->prepare("INSERT INTO comments (review_id, user_id, content) VALUES (?, ?, ?)");
  $stmt->execute([$review_id, $user_id, $content]);

  $comment_id = $pdo->lastInsertId();

  // 사용자 이름 가져오기
  $userStmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
  $userStmt->execute([$user_id]);
  $username = $userStmt->fetchColumn() ?: '익명';

  echo json_encode([
    "success" => true,
    "comment" => [
      "id" => (int)$comment_id,
      "user_id" => (int)$user_id,
      "username" => $username,
      "content" => $content,
      "created_at" => date("Y-m-d H:i:s")
    ]
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "DB 오류: " . $e->getMessage()]);
}
