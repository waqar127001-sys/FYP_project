import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiLock2Line, RiMailLine, RiLoginBoxLine } from "react-icons/ri";
import styles from "./styles.module.css";

const SupervisorLogin = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = ({ target }) => {
    setData({ ...data, [target.name]: target.value });
  };

  const validate = () => {
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      setError("Enter a valid email address.");
      return false;
    }
    if (!data.password || data.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/supervisor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
     
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Login failed");

     // ✅ Now you can safely access result.token
     localStorage.setItem("token", result.token);
     localStorage.setItem("supervisorData", JSON.stringify(result.user));
 
      navigate("/supervisor/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.container}>
        <div className={styles.icon}>
          <RiLoginBoxLine size={50} />
        </div>
        <h2 className={styles.title}>Login</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <RiMailLine className={styles.iconInput} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <RiLock2Line className={styles.iconInput} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={data.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? <span className={styles.loader}></span> : "Login"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default SupervisorLogin;
