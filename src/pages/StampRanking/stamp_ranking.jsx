import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './stamp_ranking.css';

const StampRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/get_stamp_ranking.php`)
      .then((res) => {
        if (res.data.success) {
          setRanking(res.data.ranking);
        } else {
          setError('데이터를 불러오지 못했습니다.');
        }
      })
      .catch(() => setError('서버와의 통신에 실패했습니다.'))
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

  return (
    <div className="ranking-container">
      <div className="ranking-card">
        <div className="ranking-header">
          <div className="ranking-logo">🏆</div>
          <h1 className="ranking-title">스탬프 순위</h1>
          <p className="ranking-subtitle">멜버른 트램 투어 스탬프 수집왕을 확인해보세요</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>순위를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error}</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon">📭</div>
            <p className="empty-text">아직 스탬프를 받은 유저가 없습니다.</p>
            <p className="empty-subtext">첫 번째 스탬프를 수집해보세요!</p>
          </div>
        ) : (
          <div className="ranking-list">
            {ranking.map((user, index) => (
              <div 
                key={user.user_id} 
                className="ranking-item"
                style={{ 
                  borderLeft: `4px solid ${getRankColor(index + 1)}` 
                }}
              >
                <div className="rank-info">
                  <span className="rank-number" style={{ color: getRankColor(index + 1) }}>
                    {getRankIcon(index + 1)}
                  </span>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="stamp-count">{user.stamp_count}개 스탬프</span>
                  </div>
                </div>
                <div className="rank-badge">
                  {index + 1}위
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StampRanking;
