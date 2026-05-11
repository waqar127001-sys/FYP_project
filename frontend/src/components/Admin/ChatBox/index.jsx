// src/pages/AdminMessage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Message.css";
import { useParams } from "react-router-dom";

const AdminMessage = ({ activeUserId = null }) => {
  const [senderId, setSenderId]       = useState(null);
  const [receiverId, setReceiverId]   = useState(null);
  const [messages, setMessages]       = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage]   = useState("");

  const [sidebarUsers, setSidebarUsers] = useState([]); // students + supervisors
  const [allPeople, setAllPeople]       = useState([]); // easy lookup by _id

  const { chatId } = useParams(); // optional  /chat/:something_taskId_userId

  /*──────────────── 1.  Who am I? (logged‑in Admin) ────────────────*/
  useEffect(() => {
    const data = localStorage.getItem("adminData");
    if (data) {
      try {
        const admin = JSON.parse(data);
        setSenderId(admin._id);              // token payload uses _id
      } catch (e) {
        console.error("Failed to parse adminData", e);
      }
    }
  }, []);

  /*──────────────── 2.  Default receiver logic ─────────────────────*/
  useEffect(() => {
    if (activeUserId) setReceiverId(activeUserId);
    else if (chatId)  setReceiverId(chatId.split("_")[1]); // "..._userId"
  }, [activeUserId, chatId]);

  /*──────────────── 3.  Build sidebar: all students + supervisors ──*/
  useEffect(() => {
  const buildSidebar = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const studentsRes = await axios.get("http://localhost:8000/auth/users");
      const students = studentsRes.data.users || studentsRes.data;

      const supRes = await axios.get("http://localhost:8000/auth/supervisors");
      const supervisors = supRes.data.supervisors || supRes.data;

      setSidebarUsers([...students, ...supervisors]);
      setAllPeople([...students, ...supervisors]);
    } catch (err) {
      console.error("Sidebar build failed:", err);
    }
  };

  buildSidebar(); // Initial fetch

  const intervalId = setInterval(buildSidebar, 10000); // Refresh every 10 sec

  return () => clearInterval(intervalId); // Cleanup on unmount
}, []);


  /*──────────────── 4.  Load messages whenever receiver changes ────*/
 /* 4. Load messages whenever receiver changes ──*/
useEffect(() => {
  if (!receiverId || !senderId) return;

  const token = localStorage.getItem("adminToken");

  const loadMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/auth/messages/${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Load msgs error:", err);
    }
  };

  /* ─── initial fetch ─── */
  loadMessages();

  /* ─── ⏱️ poll every second ─── */
  const intervalId = setInterval(loadMessages, 1000);

  /* ─── cleanup when receiver changes or component unmounts ─── */
  return () => clearInterval(intervalId);

}, [receiverId, senderId]);


  /*──────────────── 5.  Send message ───────────────────────────────*/
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "http://localhost:8000/auth/messages/send",
        { senderId, receiverId, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");

      // quick refresh
      const res = await axios.get(
        `http://localhost:8000/auth/messages/${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  /*──────────────── JSX ────────────────────────────────────────────*/
  const userLookup = id => allPeople.find(p => p._id === id);

  return (
    <div className="message-wrapper">

      {/* ─────────── Sidebar ─────────── */}
      <div className="sidebar">
        <h2 className="sidebar-title">Team Chat</h2>

        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div className="user-list-scroll">
          {sidebarUsers
            .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(u => (
              <div
                key={u._id}
                className={`sidebar-user ${receiverId === u._id ? "active" : ""}`}
                onClick={() => setReceiverId(u._id)}
              >
                <div className="avatar-circle">
                  {u.name[0]}
                  <span className="role-tag">
                    {u.designation === "Student"
                      ? "St"
                      : u.designation === "Admin"
                      ? "A"
                      : "S"}
                    {/* {u.designation === "Student" ? "St" : "S"} */}
                  </span>
                </div>
                <div className="user-details">
                  <div className="user-name">{u.name}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ─────────── Chat Section ─────────── */}
      <div className="chat-section">
        {receiverId ? (
          <>
            {/* header */}
            <div className="chat-header">
              <div className="chat-user">
                <div className="avatar-circle">
                  {userLookup(receiverId)?.name?.[0]}
                  <span className="role-tag">
                    {userLookup(receiverId)?.designation === "Student" ? "St" : "S"}
                  </span>
                </div>
                <span className="username">{userLookup(receiverId)?.name}</span>
              </div>
            </div>

            {/* message list */}
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`message-bubble ${m.senderId === senderId ? "sent" : "received"}`}
                >
                  <p>{m.message}</p>
                  <span className="message-time">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>

            {/* input */}
            <div className="chat-input-box">
              <textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-empty">Select someone to start chatting 💬</div>
        )}
      </div>
    </div>
  );
};

export default AdminMessage;
