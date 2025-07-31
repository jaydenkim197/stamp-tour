import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './stamp_ranking.css';

const StampRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/get_stamp_ranking.php`)
      .then((res) => {
        if (res.data.success) {
          setRanking(res.data.ranking);
        } else {
          setError(res.data.message || '데이터를 불러오지 못했습니다.');
        }
      })
      .catch((err) => {
        console.error('스탬프 랭킹 로딩 오류:', err);
        setError('서버와의 통신에 실패했습니다.');
      })
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#667eea';
  };

  if (loading) {
    return (
      <div className="ranking-container">
        <div className="ranking-card">
          <div className="ranking-header">
            <div className="ranking-logo">🏆</div>
            <h1 className="ranking-title">스탬프 순위</h1>
            <p className="ranking-subtitle">멜버른 트램 투어 스탬프 수집왕을 확인해보세요</p>
          </div>
          
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>순위를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-container">
        <div className="ranking-card">
          <div className="ranking-header">
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
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              ← 돌아가기
            </button>
            
            <div className="ranking-logo">🏆</div>
            <h1 className="ranking-title">스탬프 순위</h1>
            <p className="ranking-subtitle">멜버른 트램 투어 스탬프 수집왕을 확인해보세요</p>
          </div>
          
          <div className="error-container">
            <span className="error-icon">⚠️</span>
            <p className="error-text">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-card">
        <div className="ranking-header">
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
              justifyContent: 'center',
              marginBottom: '20px'
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
          
          <div className="ranking-logo">🏆</div>
          <h1 className="ranking-title">스탬프 순위</h1>
          <p className="ranking-subtitle">멜버른 트램 투어 스탬프 수집왕을 확인해보세요</p>
        </div>

        {ranking.length === 0 ? (
          <div className="empty-container">
            <span className="empty-icon">📊</span>
            <p className="empty-text">아직 스탬프가 없습니다</p>
            <p className="empty-subtext">멜버른을 탐험하며 스탬프를 모아보세요!</p>
          </div>
        ) : (
          <div className="ranking-list">
            {ranking.map((user, index) => {
              const rank = index + 1;
              return (
                <div key={user.user_id} className="ranking-item">
                  <div className="rank-info">
                    <div 
                      className="rank-number"
                      style={{ color: getRankColor(rank) }}
                    >
                      {getRankIcon(rank)}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="stamp-count">
                        {user.stamp_count}개의 스탬프 수집
                      </div>
                    </div>
                  </div>
                  <div className="rank-badge">
                    {user.stamp_count}개
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StampRanking;
