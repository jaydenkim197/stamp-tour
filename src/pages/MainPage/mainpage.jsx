import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./mainpage.css";
import { useLanguage } from "../../i18n/LanguageContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const MainPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/session_check.php`, {
          withCredentials: true
        });
        if (res.data.loggedIn) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('세션 확인 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="mainpage-loading">
        <LoadingSpinner size="large" text={t('loading')} />
      </div>
    );
  }

  return (
    <div className="mainpage-modern">
      {/* 스탬프 이미지 - 우상단 구석 */}
      <div className="stamp-decoration">
        <img 
          src="/img/stamp_pin.png" 
          alt="Melbourne Tram Stamp" 
          className="stamp-image"
        />
      </div>
      
      <header className="main-header">
        <span className="main-logo">🚋</span>
        <span className="main-title">{t('mainTitle')}</span>
      </header>
      
      <div className="main-content">
        <div className="main-hero">
          <h1 className="hero-title">{t('mainSubtitle')}</h1>
          <p className="hero-description">{t('mainDescription')}</p>
          
          {user && (
            <div className="user-welcome">
              <p className="welcome-text">
                안녕하세요, <strong>{user.name}</strong>님!
              </p>
            </div>
          )}
        </div>

        <div className="features-grid">
          <div 
            className="feature-card"
            onClick={() => handleFeatureClick("/stations")}
          >
            <div className="feature-icon">🚏</div>
            <h3 className="feature-title">{t('exploreStations')}</h3>
            <p className="feature-description">
              멜버른 35번 트램 정류장과 주변 명소들을 탐색해보세요
            </p>
          </div>

          <div 
            className="feature-card"
            onClick={() => handleFeatureClick("/route-recommendation")}
          >
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">{t('aiRecommendation')}</h3>
            <p className="feature-description">
              AI가 당신의 취향에 맞는 맞춤형 여행 경로를 추천해드립니다
            </p>
          </div>

          <div 
            className="feature-card"
            onClick={() => handleFeatureClick("/ranking")}
          >
            <div className="feature-icon">🏆</div>
            <h3 className="feature-title">{t('stampRanking')}</h3>
            <p className="feature-description">
              스탬프를 수집하고 다른 사용자들과 경쟁해보세요
            </p>
          </div>

          <div 
            className="feature-card"
            onClick={() => handleFeatureClick("/latest-reviews")}
          >
            <div className="feature-icon">📰</div>
            <h3 className="feature-title">{t('latestReviews')}</h3>
            <p className="feature-description">
              최신 리뷰를 확인하고 다른 여행자들의 경험을 공유하세요
            </p>
          </div>
        </div>

        <div className="main-cta">
          <button 
            className="cta-button primary"
            onClick={() => handleFeatureClick("/stations")}
          >
            🚋 지금 시작하기
          </button>
          
          {!user && (
            <button 
              className="cta-button secondary"
              onClick={() => handleFeatureClick("/signup")}
            >
              회원가입하고 더 많은 기능 이용하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
