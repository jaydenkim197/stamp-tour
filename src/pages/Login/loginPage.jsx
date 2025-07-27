import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./loginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/login.php`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      console.log("📦 응답 데이터:", response.data);

      if (response.data && response.data.success === true) {
        setUser(response.data.user);
        setErrorMsg("");
        alert(`환영합니다, ${response.data.user.name}님!`);
        navigate("/");
      } else {
        setErrorMsg(response.data.error || "로그인에 실패했습니다.");
      }

    } catch (err) {
      console.error('❗로그인 요청 실패:', err);
      if (err.response?.data?.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg("로그인 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🚋</div>
          <h1 className="login-title">멜버른 트램 가이드</h1>
          <p className="login-subtitle">로그인하고 여행을 시작하세요</p>
        </div>

        {errorMsg && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">이메일</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">비밀번호</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>또는</span>
        </div>

        <button 
          onClick={handleRegister} 
          className="register-button"
          disabled={isLoading}
        >
          회원가입하기
        </button>

        {user && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <strong>{user.name}</strong> 님, 로그인되었습니다!
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
