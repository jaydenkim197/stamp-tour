import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/session_check.php`, {
      withCredentials: true
    })
    .then((res) => {
      if (res.data.loggedIn) {
        setUser(res.data.user);
      }
    })
    .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/logout.php`, {}, {
        withCredentials: true
      });
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🚋 {t('mainTitle')}
        </Link>

        <div className="navbar-right">
          <LanguageSwitcher />
          
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className="hamburger"></span>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 - 전체 화면 오버레이 */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMenu}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>메뉴</h3>
              <button className="close-menu-btn" onClick={toggleMenu}>✕</button>
            </div>
            
            <div className="mobile-menu-links">
              <Link to="/stations" className="mobile-link" onClick={toggleMenu}>
                📍 {t('stations')}
              </Link>
              <Link to="/route-recommendation" className="mobile-link" onClick={toggleMenu}>
                🤖 {t('aiRecommendation')}
              </Link>
              <Link to="/ranking" className="mobile-link" onClick={toggleMenu}>
                🏆 {t('stampRanking')}
              </Link>
              <Link to="/latest-reviews" className="mobile-link" onClick={toggleMenu}>
                📰 {t('latestReviews')}
              </Link>
            </div>
            
            <div className="mobile-menu-auth">
              {user ? (
                <>
                  <Link to="/my-page" className="mobile-link" onClick={toggleMenu}>
                    👤 {t('myPage')}
                  </Link>
                  <button onClick={() => { handleLogout(); toggleMenu(); }} className="mobile-link logout-btn">
                    🚪 {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-link" onClick={toggleMenu}>
                    🔑 {t('login')}
                  </Link>
                  <Link to="/signup" className="mobile-link signup-link" onClick={toggleMenu}>
                    ✨ {t('signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
