import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Clicked Submit"); // ✅ Test: Is this showing?
  
    if (rating === 0 || comment.trim() === '') {
      alert("Missing rating or comment");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/Feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Anonymous User",
          rating,
          comment
        })
      });
  
      console.log("Response status:", response.status);
  
      if (response.ok) {
        console.log("Feedback submitted!");
        fetchReviews();
        setRating(0);
        setComment('');
      } else {
        console.log("Server rejected the request");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };
  
  

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/Feedback/list`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
  
  useEffect(() => {
    fetchReviews();
  }, []);
  

  return (
    <div className={styles.feedbackContainer}>
  <div className={styles.form}>
    <h2 className={styles.heading}>Give Your Feedback</h2>
    <form onSubmit={handleSubmit}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= (hoveredStar || rating) ? styles.filled : ''}`}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your feedback here..."
        className={styles.textarea}
      ></textarea>

      <button type="submit" className={styles.submitBtn}>Submit</button>
    </form>
  </div>

  <div className={styles.reviewList}>
    <h3 className={styles.subHeading}>Recent Reviews</h3>
    {reviews.length === 0 ? (
      <p className={styles.noReviews}>No reviews yet.</p>
    ) : (
      reviews.map((review, index) => (
        <div key={index} className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <strong>{review.name}</strong>
            <span className={styles.date}>{review.date}</span>
          </div>
          <div className={styles.reviewStars}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
          <p className={styles.reviewText}>{review.comment}</p>
        </div>
      ))
    )}
  </div>
</div>

  );
};

export default Feedback;
