<?php
// 이미지 업로드 관리 클래스
class ImageUpload {
    private $upload_dir;
    private $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    private $max_size = 5242880; // 5MB

    public function __construct($upload_dir = 'uploads') {
        $this->upload_dir = $upload_dir;
        $this->ensureUploadDirectory();
    }

    // 업로드 디렉토리 생성
    private function ensureUploadDirectory() {
        $dirs = [
            $this->upload_dir,
            $this->upload_dir . '/reviews',
            $this->upload_dir . '/places',
            $this->upload_dir . '/users'
        ];

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    // 고유 파일명 생성
    private function generateUniqueFilename($original_name, $type = 'reviews') {
        $extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        $filename = $timestamp . '_' . $random . '.' . $extension;
        
        return $type . '/' . $filename;
    }

    // 파일 유효성 검사
    private function validateFile($file) {
        // 파일 크기 검사
        if ($file['size'] > $this->max_size) {
            throw new Exception('파일 크기가 너무 큽니다. (최대 5MB)');
        }

        // 파일 타입 검사
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowed_types)) {
            throw new Exception('지원하지 않는 파일 형식입니다.');
        }

        // 파일 내용 검사
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowed_mimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        if (!in_array($mime_type, $allowed_mimes)) {
            throw new Exception('유효하지 않은 이미지 파일입니다.');
        }

        return true;
    }

    // 이미지 업로드
    public function uploadImage($file, $type = 'reviews', $user_id = null) {
        try {
            // 파일 유효성 검사
            $this->validateFile($file);

            // 고유 파일명 생성
            $filename = $this->generateUniqueFilename($file['name'], $type);
            $filepath = $this->upload_dir . '/' . $filename;

            // 파일 이동
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                throw new Exception('파일 업로드에 실패했습니다.');
            }

            // 이미지 최적화 (선택사항)
            $this->optimizeImage($filepath);

            return [
                'success' => true,
                'filename' => $filename,
                'filepath' => $filepath,
                'url' => $this->getImageUrl($filename)
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    // 이미지 최적화
    private function optimizeImage($filepath) {
        $image_info = getimagesize($filepath);
        if (!$image_info) return;

        $width = $image_info[0];
        $height = $image_info[1];
        $type = $image_info[2];

        // 너무 큰 이미지는 리사이즈
        $max_width = 1920;
        $max_height = 1080;

        if ($width > $max_width || $height > $max_height) {
            $ratio = min($max_width / $width, $max_height / $height);
            $new_width = round($width * $ratio);
            $new_height = round($height * $ratio);

            $source = $this->createImageResource($filepath, $type);
            $destination = imagecreatetruecolor($new_width, $new_height);

            imagecopyresampled($destination, $source, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

            $this->saveImage($destination, $filepath, $type);

            imagedestroy($source);
            imagedestroy($destination);
        }
    }

    // 이미지 리소스 생성
    private function createImageResource($filepath, $type) {
        switch ($type) {
            case IMAGETYPE_JPEG:
                return imagecreatefromjpeg($filepath);
            case IMAGETYPE_PNG:
                return imagecreatefrompng($filepath);
            case IMAGETYPE_GIF:
                return imagecreatefromgif($filepath);
            case IMAGETYPE_WEBP:
                return imagecreatefromwebp($filepath);
            default:
                throw new Exception('지원하지 않는 이미지 형식입니다.');
        }
    }

    // 이미지 저장
    private function saveImage($image, $filepath, $type) {
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($image, $filepath, 85);
                break;
            case IMAGETYPE_PNG:
                imagepng($image, $filepath, 8);
                break;
            case IMAGETYPE_GIF:
                imagegif($image, $filepath);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($image, $filepath, 85);
                break;
        }
    }

    // 이미지 URL 생성
    public function getImageUrl($filename) {
        return rtrim($_ENV['IMAGE_BASE_URL'] ?? '', '/') . '/' . $filename;
    }

    // 파일 삭제
    public function deleteImage($filename) {
        $filepath = $this->upload_dir . '/' . $filename;
        if (file_exists($filepath)) {
            return unlink($filepath);
        }
        return false;
    }
} 