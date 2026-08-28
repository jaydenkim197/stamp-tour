<?php
// 35번 City Circle Tram 정류장 데이터 추가 스크립트

// 환경변수 설정 파일 로드
require_once __DIR__ . '/../includes/config.php';

// CLI에서 실행되는지 확인
if (php_sapi_name() === 'cli') {
    // CLI 모드에서는 HTTP 헤더 설정하지 않음
    echo "CLI 모드에서 실행 중...\n";
} else {
    // 웹 모드에서는 CORS 설정
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
    
    header("Content-Type: application/json");
}

require_once "db_connect.php";

// 35번 City Circle Tram 정류장 데이터
$cityCircleStations = [
    [
        'name' => 'Waterfront City / Docklands Dr',
        'code' => 'D11',
        'latitude' => -37.8167,
        'longitude' => 144.9500,
        'line' => '35',
        'description' => 'Docklands 지역의 시작점, City Circle Tram 순환 시작'
    ],
    [
        'name' => 'NewQuay Prom / Docklands Dr',
        'code' => 'D10',
        'latitude' => -37.8170,
        'longitude' => 144.9510,
        'line' => '35',
        'description' => 'NewQuay 지역, Docklands 상업지구'
    ],
    [
        'name' => 'Central Pier / Harbour Esp',
        'code' => 'D2',
        'latitude' => -37.8175,
        'longitude' => 144.9520,
        'line' => '35',
        'description' => '중앙 부두, Harbour Esplanade'
    ],
    [
        'name' => 'Docklands Stadium / Bourke St',
        'code' => 'D3',
        'latitude' => -37.8180,
        'longitude' => 144.9530,
        'line' => '35',
        'description' => 'Marvel Stadium 근처, Bourke Street'
    ],
    [
        'name' => 'Docklands Park / Harbour Esp',
        'code' => 'D4',
        'latitude' => -37.8185,
        'longitude' => 144.9540,
        'line' => '35',
        'description' => 'Docklands 공원, Harbour Esplanade'
    ],
    [
        'name' => 'South Wharf / Wurundjeri Way',
        'code' => 'D5',
        'latitude' => -37.8190,
        'longitude' => 144.9550,
        'line' => '35',
        'description' => 'South Wharf 지역, Wurundjeri Way'
    ],
    [
        'name' => 'Victoria Police Centre / Flinders St',
        'code' => 'D6',
        'latitude' => -37.8195,
        'longitude' => 144.9560,
        'line' => '35',
        'description' => 'Victoria Police Centre, Flinders Street'
    ],
    [
        'name' => 'Spencer St / Flinders St',
        'code' => '1',
        'latitude' => -37.8200,
        'longitude' => 144.9570,
        'line' => '35',
        'description' => 'Spencer Street와 Flinders Street 교차점'
    ],
    [
        'name' => 'Melbourne Aquarium / Flinders St',
        'code' => '2',
        'latitude' => -37.8205,
        'longitude' => 144.9580,
        'line' => '35',
        'description' => '멜버른 아쿠아리움, Flinders Street'
    ],
    [
        'name' => 'Market St / Flinders St',
        'code' => '3',
        'latitude' => -37.8210,
        'longitude' => 144.9590,
        'line' => '35',
        'description' => 'Market Street와 Flinders Street 교차점'
    ],
    [
        'name' => 'Elizabeth St / Flinders St',
        'code' => '4',
        'latitude' => -37.8215,
        'longitude' => 144.9600,
        'line' => '35',
        'description' => 'Elizabeth Street와 Flinders Street 교차점'
    ],
    [
        'name' => 'Swanston St / Flinders St',
        'code' => '5',
        'latitude' => -37.8220,
        'longitude' => 144.9610,
        'line' => '35',
        'description' => 'Swanston Street와 Flinders Street 교차점'
    ],
    [
        'name' => 'Russell St / Flinders St',
        'code' => '6',
        'latitude' => -37.8225,
        'longitude' => 144.9620,
        'line' => '35',
        'description' => 'Russell Street와 Flinders Street 교차점'
    ],
    [
        'name' => 'Spring St / Flinders St',
        'code' => '8',
        'latitude' => -37.8230,
        'longitude' => 144.9630,
        'line' => '35',
        'description' => 'Spring Street와 Flinders Street 교차점'
    ],
    [
        'name' => 'Bourke St / Spring St',
        'code' => '0',
        'latitude' => -37.8235,
        'longitude' => 144.9640,
        'line' => '35',
        'description' => 'Bourke Street와 Spring Street 교차점'
    ],
    [
        'name' => 'Albert St / Nicholson St',
        'code' => '10',
        'latitude' => -37.8240,
        'longitude' => 144.9650,
        'line' => '35',
        'description' => 'Albert Street와 Nicholson Street 교차점'
    ],
    [
        'name' => 'Nicholson St / Victoria Pde',
        'code' => '10',
        'latitude' => -37.8245,
        'longitude' => 144.9660,
        'line' => '35',
        'description' => 'Nicholson Street와 Victoria Parade 교차점'
    ],
    [
        'name' => 'Victoria St / La Trobe St',
        'code' => '9',
        'latitude' => -37.8250,
        'longitude' => 144.9670,
        'line' => '35',
        'description' => 'Victoria Street와 La Trobe Street 교차점'
    ],
    [
        'name' => 'Exhibition St / La Trobe St',
        'code' => '8',
        'latitude' => -37.8255,
        'longitude' => 144.9680,
        'line' => '35',
        'description' => 'Exhibition Street와 La Trobe Street 교차점'
    ],
    [
        'name' => 'Melbourne Central Station / La Trobe St',
        'code' => '5',
        'latitude' => -37.8260,
        'longitude' => 144.9690,
        'line' => '35',
        'description' => 'Melbourne Central Station, La Trobe Street'
    ]
];

try {
    // 기존 35번 트램 정류장 삭제 (중복 방지)
    $stmt = $pdo->prepare("DELETE FROM stations WHERE line = '35'");
    $stmt->execute();
    echo "기존 35번 트램 정류장 삭제 완료\n";
    
    // 새로운 정류장 데이터 삽입
    $stmt = $pdo->prepare("
        INSERT INTO stations (name, code, latitude, longitude, line, description) 
        VALUES (:name, :code, :latitude, :longitude, :line, :description)
    ");
    
    $insertedCount = 0;
    foreach ($cityCircleStations as $station) {
        $stmt->execute([
            ':name' => $station['name'],
            ':code' => $station['code'],
            ':latitude' => $station['latitude'],
            ':longitude' => $station['longitude'],
            ':line' => $station['line'],
            ':description' => $station['description']
        ]);
        $insertedCount++;
        echo "정류장 추가: {$station['name']}\n";
    }
    
    $result = [
        "success" => true,
        "message" => "35번 City Circle Tram 정류장 {$insertedCount}개가 성공적으로 추가되었습니다.",
        "stations_added" => $insertedCount
    ];
    
    if (php_sapi_name() === 'cli') {
        echo "\n✅ 성공: {$result['message']}\n";
        echo "추가된 정류장 수: {$result['stations_added']}개\n";
    } else {
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
    }
    
} catch (PDOException $e) {
    $error = "데이터베이스 오류: " . $e->getMessage();
    if (php_sapi_name() === 'cli') {
        echo "\n❌ 오류: {$error}\n";
    } else {
        http_response_code(500);
        echo json_encode(["error" => $error], JSON_UNESCAPED_UNICODE);
    }
}
?> 