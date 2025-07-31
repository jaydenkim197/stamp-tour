import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './stamp_page.css';

const StampPage = () => {
  const { place_id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('스탬프 확인 중...');
  const [stampType, setStampType] = useState('new'); // 'new', 'exists', 'error'

  useEffect(() => {
    const checkAndAddStamp = async () => {
      try {
        // ✅ 먼저 세션 확인
        const session = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/session_check.php` , {
          withCredentials: true
        });

        if (!session.data.loggedIn) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }

        // ✅ 스탬프 확인/등록 요청 (user_id는 보내지 않음!)
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/stamp_check.php` ,
          { place_id },
          { withCredentials: true }
        );

        if (res.data.status === 'new') {
          setMessage('🎉 스탬프를 획득하셨습니다!');
          setStampType('new');
          setTimeout(() => {
            navigate(`/place/${place_id}`);
          }, 5000);
        } else if (res.data.status === 'exists') {
          setMessage('✅ 이미 스탬프를 획득하셨습니다!');
          setStampType('exists');
          setTimeout(() => {
            navigate(`/place/${place_id}`);
          }, 5000);
        } else {
          setMessage('⚠️ 오류가 발생했습니다. 다시 시도해주세요.');
          setStampType('error');
        }
      } catch (error) {
        setMessage('❌ 서버 오류입니다.');
        setStampType('error');
        console.error(error);
      }
    };

    if (place_id) {
      checkAndAddStamp();
    }
  }, [place_id, navigate]);

  return (
    <div className="stamp-page">
      <div className="stamp-container">
        <div className="stamp-card">
          <div className="stamp-design">
            <div className="stamp-circle">
              <div className="stamp-content">
                <div className="kangaroo-tram">
                  <div className="kangaroo"></div>
                  <div className="tram"></div>
                </div>
                <div className="stamp-text">
                  <span className="stamp-top">VISITED BY TRAM</span>
                  <span className="stamp-bottom">AUSTRALIA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stamp-message">
            <h1 className="stamp-title">🏅 스탬프 획득</h1>
            <p className={`stamp-status ${stampType}`}>{message}</p>
          </div>
          
          <div className="stamp-actions">
            <button
              onClick={() => navigate(`/place/${place_id}`)}
              className="stamp-button"
            >
              바로 돌아가기
            </button>
            <button
              onClick={() => navigate('/stamp-ranking')}
              className="stamp-button secondary"
            >
              스탬프 랭킹 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StampPage;
