// src/components/LatestReviewsPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LatestReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/getLatestReviews.php?page=${page}`)
      .then((res) => {
        if (res.data.error) {
          setError(res.data.error);
        } else {
          setReviews(res.data);
        }
      })
      .catch((err) => {
        console.error('리뷰 로딩 오류:', err);
        setError('서버와의 통신에 실패했습니다.');
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          gap: '20px'
        }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            ← 돌아가기
          </button>
          <h2 className="text-2xl font-bold">🆕 최신 리뷰들</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-gray-600">리뷰를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          gap: '20px'
        }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            ← 돌아가기
          </button>
          <h2 className="text-2xl font-bold">🆕 최신 리뷰들</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px',
        gap: '20px'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            minWidth: '120px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ← 돌아가기
        </button>
        <h2 className="text-2xl font-bold">🆕 최신 리뷰들</h2>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <p className="text-gray-600">아직 등록된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="bg-white p-4 shadow rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
              onClick={() => navigate(`/review/${review.id}`)}
            >
              {review.image_full_url && (
                <img
                  src={review.image_full_url}
                  alt="리뷰 이미지"
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <p><strong>장소:</strong> {review.place_name}</p>
              <p><strong>작성자:</strong> {review.username}</p>
              <p className="text-gray-700">{review.content}</p>
              <p className="text-sm text-gray-500">{review.created_at}</p>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ 페이지네이션 */}
      <div className="flex justify-center gap-4 mt-6">
        {page > 1 && (
          <button
            onClick={() => handlePageChange(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            이전
          </button>
        )}
        <button
          onClick={() => handlePageChange(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default LatestReviewsPage;
