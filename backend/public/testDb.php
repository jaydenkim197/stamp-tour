<?php
// testDb.php - 데이터베이스 연결 테스트
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . '/db_connect.php';

try {
    // 간단한 쿼리 실행
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "message" => "데이터베이스 연결 성공",
        "test" => $result['test']
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "error" => "데이터베이스 연결 실패: " . $e->getMessage()
    ]);
}
?> 