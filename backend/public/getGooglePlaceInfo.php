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
// Google Place API 연동
require_once __DIR__ . '/../includes/cors.php';
setCorsHeaders();

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// Google Place API 키
$google_api_key = $_ENV['GOOGLE_PLACE_API_KEY'] ?? '';

if (empty($google_api_key)) {
    http_response_code(500);
    echo json_encode(['error' => 'Google Place API 키가 설정되지 않았습니다.']);
    exit;
}

$place_id = isset($_GET['place_id']) ? intval($_GET['place_id']) : 0;

if ($place_id === 0) {
    echo json_encode(["error" => "명소 ID가 필요합니다."]);
    exit;
}

try {
    // 1. 데이터베이스에서 명소 정보 가져오기
    $stmt = $pdo->prepare("SELECT * FROM places WHERE id = ?");
    $stmt->execute([$place_id]);
    $place = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$place) {
        echo json_encode(["error" => "해당 명소를 찾을 수 없습니다."]);
        exit;
    }

    // 2. Google Place API로 상세 정보 가져오기
    $google_place_info = null;
    $google_photos = [];
    $google_reviews = [];

    // Google Place API 호출 (Place Details)
    $place_name = urlencode($place['name']);
    $google_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={$place_name}&inputtype=textquery&fields=place_id,formatted_address,name,rating,user_ratings_total,opening_hours,price_level,types,photos&key={$google_api_key}";

    $ch = curl_init($google_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code === 200 && $response) {
        $google_data = json_decode($response, true);
        
        if ($google_data['status'] === 'OK' && !empty($google_data['candidates'])) {
            $google_place = $google_data['candidates'][0];
            $google_place_id = $google_place['place_id'];

            // Place Details API 호출 (더 자세한 정보)
            $details_url = "https://maps.googleapis.com/maps/api/place/details/json?place_id={$google_place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,opening_hours,price_level,types,photos,geometry&key={$google_api_key}";

            $ch = curl_init($details_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            $details_response = curl_exec($ch);
            $details_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($details_http_code === 200 && $details_response) {
                $details_data = json_decode($details_response, true);
                
                if ($details_data['status'] === 'OK') {
                    $google_place_info = $details_data['result'];
                    
                    // 사진 정보 처리
                    if (isset($google_place_info['photos'])) {
                        foreach ($google_place_info['photos'] as $photo) {
                            $photo_url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={$photo['photo_reference']}&key={$google_api_key}";
                            $google_photos[] = [
                                'url' => $photo_url,
                                'width' => $photo['width'] ?? 400,
                                'height' => $photo['height'] ?? 300
                            ];
                        }
                    }
                    
                    // 리뷰 정보 처리
                    if (isset($google_place_info['reviews'])) {
                        $google_reviews = array_slice($google_place_info['reviews'], 0, 5); // 최대 5개
                    }
                }
            }
        }
    }

    // 3. 결과 통합
    $response = [
        'place' => $place,
        'google_info' => $google_place_info,
        'google_photos' => $google_photos,
        'google_reviews' => $google_reviews
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB 오류: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "API 오류: " . $e->getMessage()]);
} 