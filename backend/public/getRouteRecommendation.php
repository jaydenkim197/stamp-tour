<?php
header('Content-Type: application/json; charset=utf-8');

// 환경변수 설정 파일 로드
require_once __DIR__ . '/../includes/config.php';

// CORS 허용 (보안 강화)
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

// OPTIONS 프리플라이트 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. 설문 데이터 파싱 (POST)
$input = json_decode(file_get_contents('php://input'), true);
$user_interest = $input['interest'] ?? '관광';
$user_time = $input['time'] ?? '오전';
$user_latitude = $input['latitude'] ?? null;
$user_longitude = $input['longitude'] ?? null;

// 2. Gemini API 호출 (환경변수 사용)
$api_key = GEMINI_API_KEY;
if (empty($api_key)) {
    http_response_code(500);
    echo json_encode(["error" => "Gemini API 키가 설정되지 않았습니다."]);
    exit();
}

$gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $api_key;

// 3. 사용자 위치 기반 맞춤형 프롬프트 생성
$location_info = '';
if ($user_latitude && $user_longitude) {
    $location_info = "사용자의 현재 위치: 위도 {$user_latitude}, 경도 {$user_longitude}";
} else {
    $location_info = "사용자의 현재 위치 정보가 없습니다.";
}

$prompt = "당신은 멜버른 시티 투어 전문 가이드입니다. 다음 정보를 바탕으로 맞춤형 트램 여행 경로를 생성해주세요:

{$location_info}
사용자 관심사: {$user_interest}
소요 시간: {$user_time}

다음 형식으로 JSON 응답을 생성해주세요:
{
  \"route\": [
    {
      \"name\": \"장소명\",
      \"type\": \"장소 유형\",
      \"description\": \"장소 설명\",
      \"estimated_time\": \"예상 소요시간(분)\",
      \"is_stampPlace\": 1 또는 0
    }
  ],
  \"summary\": {
    \"total_time\": \"총 소요시간(분)\",
    \"total_distance\": \"총 거리(km)\",
    \"stamp_count\": \"스탬프 획득 가능 개수\"
  },
  \"detailed_story\": \"전체 경로에 대한 상세한 스토리텔링 설명 (각 장소별 할 일, 이동 방법, 주의사항 포함)\"
}

멜버른의 실제 명소들을 사용하고, 35번 City Circle 트램 노선을 중심으로 경로를 구성해주세요. 각 장소는 실제 존재하는 곳이어야 합니다.";

$payload = [
    "contents" => [
        ["parts" => [["text" => $prompt]]]
    ]
];

$ch = curl_init($gemini_url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // 보안 강화
curl_setopt($ch, CURLOPT_TIMEOUT, 30); // 타임아웃 설정
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$route = [];
$summary = [
    'total_time' => 120,
    'total_distance' => 3.2,
    'stamp_count' => 2
];
$story = '';

if ($http_code === 200 && $response) {
    $data = json_decode($response, true);
    if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
        $ai_response = $data['candidates'][0]['content']['parts'][0]['text'];
        
        // AI 응답에서 JSON 파싱 시도
        $json_start = strpos($ai_response, '{');
        $json_end = strrpos($ai_response, '}');
        
        if ($json_start !== false && $json_end !== false) {
            $json_str = substr($ai_response, $json_start, $json_end - $json_start + 1);
            $parsed_data = json_decode($json_str, true);
            
            if ($parsed_data) {
                if (isset($parsed_data['route'])) {
                    $route = $parsed_data['route'];
                }
                if (isset($parsed_data['summary'])) {
                    $summary = $parsed_data['summary'];
                }
                if (isset($parsed_data['detailed_story'])) {
                    $story = $parsed_data['detailed_story'];
                }
            }
        }
        
        // JSON 파싱 실패 시 기본 설명 사용
        if (empty($route)) {
            $story = $ai_response;
        }
    } else {
        $story = 'AI 설명 생성에 실패했습니다.';
    }
} else {
    $story = "AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.";
}

// 4. 결과 반환
echo json_encode([
    'success' => true,
    'route' => $route,
    'summary' => $summary,
    'story' => $story
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT); 