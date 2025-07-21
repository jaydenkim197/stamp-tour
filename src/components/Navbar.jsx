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
          
          <div className="navbar-menu">
            <Link to="/stations" className="navbar-link">
              {t('stations')}
            </Link>
            <Link to="/route-recommendation" className="navbar-link">
              {t('aiRecommendation')}
            </Link>
            <Link to="/ranking" className="navbar-link">
              {t('stampRanking')}
            </Link>
            <Link to="/latest-reviews" className="navbar-link">
              {t('latestReviews')}
            </Link>
          </div>

          <div className="navbar-auth">
            {user ? (
              <div className="user-menu">
                <Link to="/my-page" className="navbar-link">
                  {t('myPage')}
                </Link>
                <button onClick={handleLogout} className="navbar-link logout-btn">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="navbar-link">
                  {t('login')}
                </Link>
                <Link to="/signup" className="navbar-link signup-btn">
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className="hamburger"></span>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/stations" className="mobile-link" onClick={toggleMenu}>
          {t('stations')}
        </Link>
        <Link to="/route-recommendation" className="mobile-link" onClick={toggleMenu}>
          {t('aiRecommendation')}
        </Link>
        <Link to="/ranking" className="mobile-link" onClick={toggleMenu}>
          {t('stampRanking')}
        </Link>
        <Link to="/latest-reviews" className="mobile-link" onClick={toggleMenu}>
          {t('latestReviews')}
        </Link>
        {user ? (
          <>
            <Link to="/my-page" className="mobile-link" onClick={toggleMenu}>
              {t('myPage')}
            </Link>
            <button onClick={() => { handleLogout(); toggleMenu(); }} className="mobile-link logout-btn">
              {t('logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-link" onClick={toggleMenu}>
              {t('login')}
            </Link>
            <Link to="/signup" className="mobile-link" onClick={toggleMenu}>
              {t('signup')}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
