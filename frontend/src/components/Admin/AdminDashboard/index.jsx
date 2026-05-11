import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("parsed:", parsed);
      setAdmin(parsed);
      if (parsed.admin) {
        setAdmin(parsed.admin);    // ← pull out the nested admin object
      }
    }
  }, []);

  if (!admin) {
    return (
      <div className={styles.dashboardContainer}>
        <p className={styles.title}>Loading admin data...</p>
      </div>
    );
  }

 return (
  <div className={styles.dashboardContainer}>
    <h1 className={styles.title}>Admin Dashboard</h1>
    <div className={styles.card}>
      <div className={styles.initialsAvatar}>
        {admin.name
          ?.split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()}
      </div>
      <h2 className={styles.name}>{admin.name}</h2>
      <p className={styles.email}>{admin.email}</p>
      <span className={styles.roleTag}>{admin.role || 'Admin'}</span>
    </div>
  </div>
);

};

export default AdminDashboard;
