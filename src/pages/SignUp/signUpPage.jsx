import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./signUpPage.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/signup.php`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage({ type: 'success', text: "🎉 회원가입 및 자동 로그인 완료!" });
        setFormData({ name: "", email: "", password: "" });

        setTimeout(() => {
          navigate("/my-page");
        }, 1000);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage({ type: 'error', text: "⚠️ 이미 등록된 이메일입니다." });
      } else {
        setMessage({ type: 'error', text: "🚨 회원가입 중 오류가 발생했습니다." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="signup-logo">🚋</div>
          <h1 className="signup-title">멜버른 트램 가이드</h1>
          <p className="signup-subtitle">회원가입하고 여행을 시작하세요</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✅' : '⚠️'}
            </span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label className="input-label">이름</label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">이메일</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">비밀번호</label>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={`signup-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                회원가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p>이미 계정이 있으신가요?</p>
          <button 
            onClick={() => navigate('/login')} 
            className="login-link-button"
            disabled={isLoading}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
