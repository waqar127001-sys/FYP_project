import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AllUserGroups.css";

const AllUserGroups = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [usersRes, teamsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/auth/users`),
          axios.get(`${process.env.REACT_APP_API_URL}/auth/teams`),
        ]);

        const usersMap = {};
        usersRes.data.forEach((user) => {
          usersMap[user._id] = user;
        });

        const formattedUsers = usersRes.data.map((user) => {
          // Get all teams where this user is a member
          const userTeams = teamsRes.data.teams.filter((team) =>
            team.members.some(
              (member) => member === user._id || member._id === user._id
            )
          );

          // Unique Group Subjects
          const groupSubjects = [...new Set(userTeams.map((t) => t.subject))].join(", ") || "—";

          // Unique Supervisor Names
          const supervisorNames = [...new Set(userTeams.map((t) => t.supervisorName))].join(", ") || "—";

          // Unique Group Member IDs
          const memberIds = [
            ...new Set(
              userTeams.flatMap((team) =>
                team.members.map((member) =>
                  typeof member === "object" ? member._id : member
                )
              )
            ),
          ];

          const groupMembers = memberIds
            .map((id) => usersMap[id]?.name || "Unknown")
            .join(", ") || "—";

          return {
            name: user.name,
            email: user.email,
            role: user.designation || "—",
            groupSubject: groupSubjects,
            supervisor: supervisorNames,
            groupMembers,
          };
        });

        setUsers(usersRes.data);
        setTeams(teamsRes.data.teams);
        setUserData(formattedUsers);
      } catch (error) {
        console.error("Error fetching user or team data:", error);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="userGroupWrapper">
      <h2 className="sectionTitle">All Users and Their Groups</h2>
      <div className="tableScrollWrapper">
        <table className="styledUserGroupTable">
          <thead>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Group Subject</th>
              <th>Supervisor</th>
              <th>Group Members</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.groupSubject}</td>
                <td>{user.supervisor}</td>
                <td>{user.groupMembers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUserGroups;
