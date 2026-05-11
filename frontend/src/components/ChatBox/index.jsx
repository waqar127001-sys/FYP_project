import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Message.css";
import { useParams } from "react-router-dom";

const Message = ({ activeUserId = null }) => {
  // 🔸 receive prop here
  const [senderId, setSenderId] = useState(null);
  const { chatId } = useParams(); // e.g., "taskId_userId"
  const [receiverId, setReceiverId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  // 🔹 Set senderId from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setSenderId(parsedUser.id);
      } catch (error) {
        console.error("❌ Failed to parse user from localStorage", error);
      }
    }
  }, []);

  // 🔹 Set default receiverId from prop (if provided)
  useEffect(() => {
    if (activeUserId) {
      setReceiverId(activeUserId);
    } else if (chatId) {
      const [, userId] = chatId.split("_"); // extracting userId
      setReceiverId(userId);
    }
  }, [activeUserId]);

 useEffect(() => {
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const [usersRes, adminsRes, supervisorsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/auth/users`),
        axios.get(`${process.env.REACT_APP_API_URL}/auth/admins`),
        axios.get(`${process.env.REACT_APP_API_URL}/auth/supervisors`),
      ]);

      const allUsers = usersRes.data.users || usersRes.data;
      const allAdmins = adminsRes.data.admins || adminsRes.data;
      const allSupervisors = supervisorsRes.data.supervisors || supervisorsRes.data;



      const combinedUsers = [
        ...allUsers.map(u => ({ ...u, role: "User" })),
        ...allAdmins.map(a => ({ ...a, role: "Admin" })),
        ...allSupervisors.map(s => ({ ...s, role: "Supervisor" })),
      ];

      // console.log("combinedUSers>>>", combinedUsers);

      setAssignedUsers(combinedUsers);
    } catch (error) {
      console.error("❌ Failed to fetch users/admins/supervisors:", error);
    }
  };

  fetchAllUsers();
}, []);





  // 🔹 Fetch messages for current receiverId
 /* 🔹 Fetch messages for current receiverId ───────────────────────── */
useEffect(() => {
  if (!receiverId || !senderId) return;

  const token = localStorage.getItem("token");

  const loadMessages = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/messages/${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    }
  };

  loadMessages();                    // initial fetch
  const intervalId = setInterval(loadMessages, 1000);   // ← poll each second

  // cleanup when the receiver changes or component unmounts
  return () => clearInterval(intervalId);
}, [receiverId, senderId]);


  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const token = localStorage.getItem("token");

        await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/messages/send`,
          {
            senderId,
            receiverId,
            message: newMessage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh messages
        const response = await axios.get(
         `${process.env.REACT_APP_API_URL}/auth/messages/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessages(response.data.messages);
        setNewMessage("");
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    }
  };

  return (
    <div className="message-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Team Chat</h2>
        <div className="user-list-scroll">
          {assignedUsers.map((user) => (
            <div
              key={user._id}
              className={`sidebar-user ${
                receiverId === user._id ? "active" : ""
              }`}
              onClick={() => setReceiverId(user._id)}
            >
              <div className="avatar-circle">
                {user.name[0]}
                <span className="role-tag">
                  {user.designation === "Student"
                      ? "St"
                      : user.designation === "Admin"
                      ? "A"
                      : "S"}
                  {/* {user.designation === "Student" ? "St" : "S"} */}
                </span>
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        {receiverId ? (
          <>
            <div className="chat-header">
              <div className="chat-user">
                {assignedUsers.find((u) => u._id === receiverId) &&
                  (() => {
                    const user = assignedUsers.find(
                      (u) => u._id === receiverId
                    );
                    return (
                      <div className="sidebar-user">
                        <div className="avatar-circle">
                          {user.name[0]}
                          <span className="role-tag">
                            {user.designation === "Student" ? "St" : "S"}
                          </span>
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-bubble ${
                    msg.senderId === senderId ? "sent" : "received"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="chat-input-box">
              <textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            Select a team member to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
