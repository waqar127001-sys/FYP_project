import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import dayjs from "dayjs";
import styles from "./styles.module.css";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/auth/Feedback/list")
      .then((res) => setFeedbacks(res.data))
      .catch((err) => console.error("Failed to load feedbacks", err));
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Student Feedbacks</h2>
      <div className={styles.grid}>
        {feedbacks.map((fb, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.name}>{fb.name}</h4>
              <span className={styles.date}>
                {dayjs(fb.date).format("MMM D, YYYY")}
              </span>
            </div>
            <div className={styles.rating}>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={18}
                  fill={index < fb.rating ? "#facc15" : "none"}
                />
              ))}
            </div>
            <p className={styles.comment}>"{fb.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;
