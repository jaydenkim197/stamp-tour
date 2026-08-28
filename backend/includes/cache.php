<?php
// 캐싱 시스템
class Cache {
    private $pdo;
    private $cache_time = 3600; // 기본 1시간

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // 캐시 설정
    public function set($key, $value, $time = null) {
        $time = $time ?: $this->cache_time;
        $expires_at = date('Y-m-d H:i:s', time() + $time);
        
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO cache (cache_key, cache_value, expires_at) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                cache_value = VALUES(cache_value), 
                expires_at = VALUES(expires_at)
            ");
            $stmt->execute([$key, json_encode($value), $expires_at]);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    // 캐시 가져오기
    public function get($key) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT cache_value 
                FROM cache 
                WHERE cache_key = ? AND expires_at > NOW()
            ");
            $stmt->execute([$key]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return json_decode($result['cache_value'], true);
            }
            return null;
        } catch (PDOException $e) {
            return null;
        }
    }

    // 캐시 삭제
    public function delete($key) {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM cache WHERE cache_key = ?");
            $stmt->execute([$key]);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    // 만료된 캐시 정리
    public function cleanup() {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM cache WHERE expires_at <= NOW()");
            $stmt->execute();
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    // 캐시 키 생성
    public static function generateKey($prefix, $params = []) {
        $key = $prefix;
        if (!empty($params)) {
            $key .= '_' . md5(serialize($params));
        }
        return $key;
    }
} 