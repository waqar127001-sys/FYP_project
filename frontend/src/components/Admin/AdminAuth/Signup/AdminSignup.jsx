import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const AdminSignup = () => {
  const [admin, setAdmin] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/admin_signup`, admin);
      alert("Admin Registered Successfully!");
      navigate('/admin/login');
    } catch (error) {
      alert("Signup Failed: " + error.response?.data?.message || error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.heading}>Admin Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            className={styles.input}
            value={admin.name}
            onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
            required
          />
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
          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
