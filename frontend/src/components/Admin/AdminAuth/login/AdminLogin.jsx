import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const AdminLogin = () => {
  const [admin, setAdmin] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/admin_login`, admin);

    console.log(res);
    // Store both token and admin data
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminData", JSON.stringify(res.data.admin)); // assuming backend returns admin object

  
navigate('/admin/dashboard');

  } catch (error) {
    alert("Login Failed: " + (error.response?.data?.message || error.message));
  }
};


  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <h2 className={styles.heading}>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={admin.email}
            onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={admin.password}
            onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
            required
          />
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
