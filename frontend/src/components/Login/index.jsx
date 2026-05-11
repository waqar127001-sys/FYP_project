import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false); // Track animation state

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrorVisible(false); // Hide any previous error animations
    setLoading(true);

    const { email, password } = data;

    try {
      if (!email || !password) {
        setError("Please fill all the fields");
        setErrorVisible(true); // Start animation for showing error
        setLoading(false);

        // Hide error after 4 seconds with animation
        setTimeout(() => {
          setErrorVisible(false); // Trigger fade-out animation
          setTimeout(() => setError(""), 500); // Remove error after animation ends
        }, 4000);

        return;
      }

      const url = `${process.env.REACT_APP_API_URL}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
		console.log("errorDAta",errorData);
        throw new Error(errorData.message || "Something went wrong");
      }

      const responseData = await response.json();
      console.log("Login Successful:", responseData);

      localStorage.setItem("token", responseData.token);
      localStorage.setItem("user", JSON.stringify(responseData.user));

      window.location.href = "/student/dashboard";
    } catch (error) {
      setError(error.message);
      setErrorVisible(true); // Show error animation

      // Hide error after 4 seconds with animation
      setTimeout(() => {
        setErrorVisible(false); // Trigger fade-out animation
        setTimeout(() => setError(""), 500); // Remove error after animation ends
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login_form_container}>
        <div className={styles.left}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Login to Your Account</h1>
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className={styles.input}
            />
            {/* Show error message with animations */}
            {error && (
              <div
                className={`${styles.error_msg} ${
                  errorVisible ? styles.slide_in : styles.slide_out
                }`}
              >
                {error}
              </div>
            )}
            <button type="submit" className={styles.green_btn} disabled={loading}>
              {loading ? <span className={styles.loader}></span> : "Login"}
            </button>
          </form>
        </div>
        <div className={styles.right}>
          <h1>New Here?</h1>
          <Link to="/student/signup">
            <button type="button" className={styles.white_btn}>
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
