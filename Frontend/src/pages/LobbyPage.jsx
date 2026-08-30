import { useState } from "react";
import "./LobbyPage.css";

const LobbyPage = ({ username, onLogout }) => {
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");

  const handleCreate = () => {
    setStatus("Creating a new room...");
  };

  const handleJoin = () => {
    if (!roomCode.trim()) {
      setStatus("Enter a room code first.");
      return;
    }

    setStatus(`Joining room ${roomCode.trim().toUpperCase()}...`);
  };

  return (
    <div className="lobby-page">
      <header className="lobby-header">
        <div className="brand-badge">
          <img src="/logo.png" alt="Draw or Die logo" className="brand-logo" />
        </div>

        <div className="user-chip">Player: {username}</div>
      </header>

      <main className="lobby-card">
        <h2>GAME LOBBY</h2>

        <div className="lobby-actions">
          <button type="button" className="primary-btn" onClick={handleCreate}>
            CREATE GAME
          </button>

          <div className="room-form">
            <input
              type="text"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Room code"
            />
            <button type="button" className="secondary-btn" onClick={handleJoin}>
              JOIN GAME
            </button>
          </div>
        </div>

        {status ? <p className="lobby-status">{status}</p> : null}
      </main>

      <button type="button" className="logout-btn" onClick={onLogout}>
        LOG OUT
      </button>
    </div>
  );
};

export default LobbyPage;
