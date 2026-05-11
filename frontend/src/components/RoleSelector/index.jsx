import React, { useState } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";

export default function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleRedirect = (action) => {
    navigate(`/${selectedRole}/${action}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>👋 Welcome to the Project Portal</h1>
      <p className={styles.subtitle}>
        {selectedRole
          ? `Continue as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
          : "Please choose your role to continue"}
      </p>

      {!selectedRole ? (
        <div className={styles.roles}>
          <button onClick={() => handleRoleClick("admin")} className={styles.roleBtn}>
            🛡 Admin
          </button>
          <button onClick={() => handleRoleClick("supervisor")} className={styles.roleBtn}>
            🎓 Supervisor
          </button>
          <button onClick={() => handleRoleClick("student")} className={styles.roleBtn}>
            📚 Student
          </button>
        </div>
      ) : (
        <div className={styles.authOptions}>
          <button onClick={() => handleRedirect("login")} className={styles.authBtn}>
            👤 I already have an account (Login)
          </button>
          <button onClick={() => handleRedirect("signup")} className={styles.authBtn}>
            📝 I am new here (Sign Up)
          </button>
          <button onClick={() => setSelectedRole(null)} className={styles.backBtn}>
            🔙 Back
          </button>
        </div>
      )}
    </div>
  );
}
