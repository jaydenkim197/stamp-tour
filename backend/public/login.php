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

session_start();

require_once __DIR__ . '/db_connect.php';

header("Content-Type: application/json; charset=utf-8");

try {
    // 요청 본문에서 JSON 데이터 읽기
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data["email"] ?? "";
    $password = $data["password"] ?? "";

    // 이메일 또는 비밀번호 비어있을 때
    if (empty($email) || empty($password)) {
        echo json_encode([
            "success" => false,
            "error" => "이메일과 비밀번호를 모두 입력해주세요."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 사용자 조회
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 비밀번호 검증
    if ($user && password_verify($password, $user["password"])) {
        // 세션에 사용자 정보 저장
        $_SESSION['user_id'] = $user["id"];
        $_SESSION['user_name'] = $user["name"];
        $_SESSION['user_email'] = $user["email"];

        echo json_encode([
            "success" => true,
            "user" => [
                "name" => $user["name"],
                "email" => $user["email"]
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "이메일 또는 비밀번호가 올바르지 않습니다."
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "서버 오류: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
