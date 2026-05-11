import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Message.css";
import { useParams } from "react-router-dom";

const SupervisorMessage = ({ activeUserId = null }) => {
  const [senderId, setSenderId] = useState(null);
  const { chatId } = useParams(); // e.g., "taskId_userId"
  const [receiverId, setReceiverId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [conversationList, setConversationList] = useState([]); // NEW
  const [allUsers, setAllUsers] = useState([]);

  /* ░░░ 1. Who is the logged‑in supervisor? ░░░ */
  useEffect(() => {
    const supData = localStorage.getItem("supervisorData"); // NEW
    if (supData) {
      try {
        const parsed = JSON.parse(supData);
        setSenderId(parsed._id); // stored as _id
      } catch (err) {
        console.error("Failed to parse supervisorData:", err);
      }
    }
  }, []);

  /* ░░░ 2. Default receiver logic (prop or URL) ░░░ */
  useEffect(() => {
    if (activeUserId) setReceiverId(activeUserId);
    else if (chatId) {
      const [, userId] = chatId.split("_");
      setReceiverId(userId);
    }
  }, [activeUserId, chatId]);

  /* ░░░ 3. Build supervisor’s side‑bar list ░░░ */
  useEffect(() => {
    const fetchSidebarPeople = async () => {
      try {
        const supData = localStorage.getItem("supervisorData");
        const token = localStorage.getItem("token");

        if (!supData) return alert("Login again please.");
        const sup = JSON.parse(supData);
        if (!sup?._id) return alert("Invalid supervisor data.");

        const supervisorId = sup._id;
        console.log("supervisorId>>", supervisorId);

        // ✅ 1. Get all admins
        const adminsRes = await axios.get("http://localhost:8000/auth/admins");
        const admins = adminsRes.data.admins || adminsRes.data;

        // ✅ 2. Get assigned projects
        const assignedProjectsRes = await axios.get(
          "http://localhost:8000/auth/assigned-projects"
        );
        const assignedProjects = assignedProjectsRes.data;

        // console.log("assignedProjects>>>", assignedProjects);

        // ✅ 3. Filter projects where supervisorId === current supervisor's _id
        const myProjects = assignedProjects.filter(
          (p) => p.supervisorId && p.supervisorId._id === supervisorId
        );

        // console.log("myProjects>>", myProjects);

        // ✅ 4. Collect teamIds from those projects
        const projectTeamIds = [
          ...new Set(myProjects.map((p) => p.groupId?._id)),
        ];

        // console.log("projectTeamIds>>",projectTeamIds);

        // ✅ 5. Fetch all teams
        const teamsRes = await axios.get("http://localhost:8000/auth/teams");
        const allTeams = teamsRes.data.teams || teamsRes.data;

        // ✅ 6. Filter only those teams from assigned projects
        const matchedTeams = allTeams.filter((team) =>
          projectTeamIds.includes(team._id)
        );
        console.log("matchedTeams", matchedTeams);

        // ✅ 7. Collect all student IDs from matched teams
        const studentIdsInTeams = [
          ...new Set(
            matchedTeams.flatMap(
              (team) => team.members?.map((member) => member._id) || []
            )
          ),
        ];

        console.log("studentIdsInTeams>>>>", studentIdsInTeams);

        // ✅ 8. Fetch all students
        const usersRes = await axios.get("http://localhost:8000/auth/users");
        const students = usersRes.data.users || usersRes.data;

        // ✅ 9. Filter only those students who are in team groupMembers
        const relatedStudents = students.filter((s) =>
          studentIdsInTeams.includes(s._id)
        );

        console.log("relatedStudents>>>>", relatedStudents);

        // ✅ 10. Fetch message senders
        const chatSendersRes = await axios.get(
          `http://localhost:8000/auth/chat-senders/${supervisorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const chatUserIds = chatSendersRes.data.senders || [];

        // ✅ 11. Fetch assigned task users
        const taskRes = await axios.get(
          `http://localhost:8000/auth/assigned-tasks?userId=${supervisorId}`
        );
        const taskUserIds = taskRes.data.map((t) => t.user_id);

        // ✅ 12. Combine all unique IDs that should show in the sidebar
        const sidebarUserIds = [
          ...new Set([
            ...chatUserIds,
            ...taskUserIds,
            ...studentIdsInTeams,
            ...admins.map((a) => a._id),
          ]),
        ];

        // ✅ 13. Combine all user objects: students + admins
        const everyone = [...relatedStudents, ...admins];
        setAllUsers(everyone);

        // ✅ 14. Filter and show only those in sidebar
        const sidebarPeople = everyone.filter((u) =>
          sidebarUserIds.includes(u._id)
        );
        setConversationList(sidebarPeople);

        // ✅ 15. Set default receiver if not set
        if (!receiverId && sidebarPeople.length > 0) {
          setReceiverId(sidebarPeople[0]._id);
        }
      } catch (err) {
        console.error("❌ Failed to build supervisor sidebar:", err);
      }
    };

    fetchSidebarPeople();
    const intervalId = setInterval(fetchSidebarPeople, 5000);
    return () => clearInterval(intervalId);
  }, [receiverId]);

  /* ░░░ 4. Fetch messages whenever receiver changes ░░░ */
  useEffect(() => {
    if (!receiverId || !senderId) return;

    const token = localStorage.getItem("token");

    const fetchMsgs = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/auth/messages/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Fetching msgs failed:", err);
      }
    };

    fetchMsgs(); // initial load
    const intervalId = setInterval(fetchMsgs, 1000); // ← poll every second

    return () => clearInterval(intervalId); // cleanup on unmount / receiver change
  }, [receiverId, senderId]);

  /* ░░░ 5. Send message ░░░ */
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/auth/messages/send",
        { senderId, receiverId, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      /* reload */
      const res = await axios.get(
        `http://localhost:8000/auth/messages/${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  /* ░░░ JSX ░░░ */
  return (
    <div className="message-wrapper">
      {/* ░░ Sidebar ░░ */}
      <div className="sidebar">
        <h2 className="sidebar-title">Team Chat</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="user-list-scroll">
          {conversationList
            .filter((u) =>
              u.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((u) => (
              <div
                key={u._id}
                className={`sidebar-user ${
                  receiverId === u._id ? "active" : ""
                }`}
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
                  </span>
                </div>
                <div className="user-details">
                  <div className="user-name">{u.name}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ░░ Chat Section ░░ */}
      <div className="chat-section">
        {receiverId ? (
          <>
            <div className="chat-header">
              <div className="chat-user">
                <div className="avatar-circle">
                  {allUsers.find((u) => u._id === receiverId)?.name?.[0]}
                  <span className="role-tag">
                    {(() => {
                      const role = allUsers.find(
                        (u) => u._id === receiverId
                      )?.designation;
                      return role === "Student"
                        ? "St"
                        : role === "Admin"
                        ? "A"
                        : "S";
                    })()}
                  </span>
                </div>
                <span className="username">
                  {allUsers.find((u) => u._id === receiverId)?.name}
                </span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`message-bubble ${
                    m.senderId === senderId ? "sent" : "received"
                  }`}
                >
                  <p>{m.message}</p>
                  <span className="message-time">
                    {new Date(m.timestamp).toLocaleTimeString([], {
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
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-empty">Select a person to start chatting 💬</div>
        )}
      </div>
    </div>
  );
};

export default SupervisorMessage;
