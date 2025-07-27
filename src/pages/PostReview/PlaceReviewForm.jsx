import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './placeReviewForm.css';

const PlaceReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 세션 로그인 확인
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/session_check.php`, {
      withCredentials: true
    })
    .then(res => {
      if (!res.data.loggedIn) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    })
    .catch(() => {
      alert('세션 확인 실패');
      navigate('/login');
    });
  }, [navigate]);

  // ✅ 명소 정보 불러오기
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/getPlaceDetails.php?place_id=${id}`)
      .then(res => {
        const placeData = res.data.place;
        placeData.is_stamp = res.data.is_stampPlace;
        setPlace(placeData);
      })
      .catch(err => console.error('명소 정보 로딩 실패:', err));
  }, [id]);

  // ✅ 후기 등록
  const handleSubmit = () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('place_id', id);
    formData.append('content', content);
    formData.append('rating', rating);
    if (image) formData.append('image', image);

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/postReview.php`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    .then(() => {
      if (place?.is_stamp == 1) {
        navigate(`/stamp/${id}`);
      } else {
        navigate(`/place/${id}`);
      }
    })
    .catch(err => {
      console.error('후기 등록 실패:', err);
      alert('후기 등록 중 오류가 발생했습니다.');
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  if (!place) return (
    <div className="review-loading">
      <div className="loading-spinner"></div>
      <p>명소 정보를 불러오는 중...</p>
    </div>
  );

  return (
    <div className="review-container">
      <div className="review-card">
        <div className="review-header">
          <div className="review-logo">✍️</div>
          <h1 className="review-title">{place.name} 후기 작성</h1>
          <p className="review-subtitle">이 명소에 대한 솔직한 후기를 남겨주세요</p>
        </div>

        <div className="review-form">
          <div className="input-group">
            <label className="input-label">후기 내용</label>
            <textarea
              className="review-textarea"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 명소에 대한 솔직한 후기를 남겨주세요"
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">평점</label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`rating-star ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  disabled={isLoading}
                >
                  ⭐
                </button>
              ))}
              <span className="rating-text">{rating}점</span>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">사진 첨부 (선택사항)</label>
            <div className="image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                disabled={isLoading}
              />
              <div className="image-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="미리보기" className="preview-image" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">사진을 선택하세요</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="review-actions">
            <button 
              onClick={() => navigate(`/place/${id}`)} 
              className="cancel-button"
              disabled={isLoading}
            >
              취소
            </button>
            <button 
              onClick={handleSubmit} 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  등록 중...
                </>
              ) : (
                '후기 등록'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceReviewForm;
