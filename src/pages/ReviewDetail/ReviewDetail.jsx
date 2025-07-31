import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReviewDetail.css';

const ReviewDetail = () => {
  const { id } = useParams(); // review_id
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null); // ✅ 로그인 사용자 ID
  const [loading, setLoading] = useState(true);

  // ✅ 로그인 사용자 확인
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/session_check.php`,  {
      withCredentials: true
    })
    .then(res => {
      if (res.data.loggedIn) {
        setCurrentUserId(res.data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, commentsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/getReviewById.php?review_id=${id}`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/getComments.php?review_id=${id}`)
        ]);
        
        setReview(reviewRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/postComment.php`, {
      review_id: id,
      content: newComment
    }, {
      withCredentials: true
    })
    .then(res => {
      if (res.data.success) {
        setComments(prev => [...prev, res.data.comment]);
        setNewComment('');
      } else {
        alert(res.data.message || '댓글 등록 실패');
      }
    })
    .catch(err => {
      console.error('댓글 등록 오류:', err);
      alert('댓글 등록 중 오류가 발생했습니다.');
    });
  };

  const handleDeleteComment = (commentId) => {
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/deleteComment.php`, {
      comment_id: commentId
    }, {
      withCredentials: true
    })
    .then(res => {
      if (res.data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        alert(res.data.message || '삭제 실패');
      }
    })
    .catch(err => {
      console.error('댓글 삭제 오류:', err);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    });
  };

  if (loading) {
    return (
      <div className="review-detail-loading">
        <div className="loading-spinner"></div>
        <p>후기 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="review-detail-error">
        <h2>❌ 후기를 찾을 수 없습니다</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="review-detail-page">
      <div className="review-detail-container">
        <div className="review-detail-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← 뒤로 가기
          </button>
          <h1 className="review-detail-title">📝 후기 상세</h1>
        </div>

        <div className="review-detail-card">
          <div className="review-detail-info">
            <div className="review-author">
              <span className="author-name">{review.username || '익명'}</span>
              <span className="review-date">{review.created_at}</span>
            </div>
            <div className="review-rating">
              {'⭐'.repeat(review.rating)}
              <span className="rating-text">{review.rating}점</span>
            </div>
          </div>
          
          <div className="review-content">
            {review.content}
          </div>
          
          {review.image_full_url && (
            <div className="review-image-container">
              <img
                src={review.image_full_url}
                alt="후기 이미지"
                className="review-image"
              />
            </div>
          )}
        </div>

        <div className="comments-section">
          <h2 className="comments-title">💬 댓글</h2>
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">아직 댓글이 없습니다.</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-content">
                    <span className="comment-author">{comment.username || '익명'}</span>
                    <span className="comment-text">{comment.content}</span>
                  </div>
                  {comment.user_id === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="delete-comment-btn"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="comment-form">
            <input
              type="text"
              placeholder="댓글을 입력하세요"
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <button
              onClick={handleSubmitComment}
              className="comment-submit-btn"
              disabled={!newComment.trim()}
            >
              댓글 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
