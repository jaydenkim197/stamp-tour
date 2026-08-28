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
// CORS 설정 적용
require_once __DIR__ . '/../includes/cors.php';
setCorsHeaders();

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

$placeId = isset($_GET['place_id']) ? intval($_GET['place_id']) : 0;

if ($placeId === 0) {
    echo json_encode(["error" => "명소 ID가 필요합니다."]);
    exit;
}

try {
    // 1. 기본 명소 정보 조회
    $stmt = $pdo->prepare("SELECT * FROM places WHERE id = ?");
    $stmt->execute([$placeId]);
    $place = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$place) {
        echo json_encode(["error" => "해당 명소를 찾을 수 없습니다."]);
        exit;
    }

    // 2. 평균 평점 조회
    $stmt = $pdo->prepare("SELECT ROUND(AVG(rating),1) as avg_rating, COUNT(*) as review_count FROM reviews WHERE place_id = ?");
    $stmt->execute([$placeId]);
    $ratingData = $stmt->fetch(PDO::FETCH_ASSOC);

    // 3. 최신 리뷰 3개 조회
    $stmt = $pdo->prepare("
        SELECT r.id, r.content, r.rating, r.image_url, r.created_at, u.name 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.place_id = ?
        ORDER BY r.created_at DESC
        LIMIT 3
    ");
    $stmt->execute([$placeId]);
    $recentReviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. 결과 통합
    $response = [
        "place" => $place,
        "is_stampPlace" => intval($place['is_stampPlace']), // ✅ 최상단에 따로 추가
        "rating" => $ratingData,
        "recent_reviews" => $recentReviews
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB 오류: " . $e->getMessage()]);
}
