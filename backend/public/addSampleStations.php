<?php
// addSampleStations.php - 테스트용 샘플 정류장 데이터 추가
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

try {
    // 기존 데이터 삭제 (선택사항)
    $pdo->exec("DELETE FROM stations");
    
    // 샘플 정류장 데이터 추가
    $sampleStations = [
        // 노선 35 (빨간색) - 가로 방향
        ['Flinders Street Station', '멜버른 중심역', -37.8183, 144.9671, '35'],
        ['Southern Cross Station', '남부 교차역', -37.8183, 144.9531, '35'],
        ['Marvel Stadium', '마블 스타디움', -37.8163, 144.9481, '35'],
        ['Docklands', '독랜드', -37.8143, 144.9431, '35'],
        
        // 노선 96 (파란색) - 세로 방향
        ['Melbourne Central', '멜버른 센트럴', -37.8103, 144.9631, '96'],
        ['Parliament', '의회', -37.8113, 144.9731, '96'],
        ['Flagstaff Gardens', '플래그스태프 가든', -37.8093, 144.9631, '96'],
        ['Carlton Gardens', '칼튼 가든', -37.8073, 144.9631, '96'],
        
        // 노선 86 (주황색) - 가로 방향
        ['Bourke Street Mall', '버크 스트리트 몰', -37.8136, 144.9631, '86'],
        ['Collins Street', '콜린스 스트리트', -37.8136, 144.9731, '86'],
        ['Swanston Street', '스완스턴 스트리트', -37.8136, 144.9531, '86'],
        ['Elizabeth Street', '엘리자베스 스트리트', -37.8136, 144.9581, '86'],
        
        // 기타 노선 (회색)
        ['Queen Victoria Market', '퀸 빅토리아 마켓', -37.8076, 144.9568, 'default'],
        ['Royal Exhibition Building', '로얄 엑시비션 빌딩', -37.8047, 144.9717, 'default'],
        ['Melbourne Cricket Ground', '멜버른 크리켓 그라운드', -37.8199, 144.9834, 'default'],
        ['St Kilda Beach', '세인트 킬다 비치', -37.8683, 144.9806, 'default']
    ];
    
    $stmt = $pdo->prepare("INSERT INTO stations (name, description, latitude, longitude, line) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($sampleStations as $station) {
        $stmt->execute($station);
    }
    
    echo json_encode([
        "success" => true,
        "message" => "샘플 정류장 데이터가 추가되었습니다.",
        "count" => count($sampleStations)
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "error" => "데이터베이스 오류: " . $e->getMessage()
    ]);
}
?> 