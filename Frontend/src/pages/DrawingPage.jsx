import DrawingBoard from "../components/DrawingBoard";
import ChatBox from "../components/chat/ChatBox";

function DrawingPage({
  roomState,
  socket,
  currentWord,
  hint,
  timer,
  onLeaveRoom,
  messages = [],
  onSendMessage,
  roundEndInfo,
  gameOverInfo,
  onBackToLobby,
}) {
  const currentSocketId = socket?.id;
  const isDrawer = roomState?.drawerId && roomState.drawerId === currentSocketId;
  const currentDrawerPlayer = roomState?.players?.find((p) => p.id === roomState.drawerId);
  const me = roomState?.players?.find((p) => p.id === currentSocketId);
  const alreadyGuessed = !!me?.guessed;

  const getWordDisplay = () => {
    if (isDrawer && currentWord) {
      return (
        <div className="word-banner drawer-word-banner">
          <span className="word-label">YOUR WORD TO DRAW:</span>
          <strong className="secret-word">{currentWord}</strong>
        </div>
      );
    }
    if (hint) {
      return (
        <div className="word-banner guesser-word-banner">
          <span className="word-label">WORD HINT:</span>
          <strong className="masked-word">{hint}</strong>
        </div>
      );
    }
    return (
      <div className="word-banner">
        <span className="word-label">STATUS:</span>
        <strong>{roomState?.status === "WAITING" ? "Waiting for players" : "Preparing next turn..."}</strong>
      </div>
    );
  };

  return (
    <main className="drawing-page-layout">
      {/* Top Game Bar */}
      <header className="game-topbar">
        <div className="topbar-left">
          <button type="button" className="back-link" onClick={onLeaveRoom}>
            ← Leave Room
          </button>
          <div className="game-room-tag">
            Room: <strong>{roomState?.code || "---"}</strong>
          </div>
          <div className="game-round-tag">
            Round <strong>{roomState?.round || 1}</strong> of <strong>{roomState?.maxRounds || 3}</strong>
          </div>
        </div>

        <div className="topbar-center">{getWordDisplay()}</div>

        <div className="topbar-right">
          <div className={`game-timer-badge ${timer <= 10 && timer > 0 ? "timer-urgent" : ""}`}>
            <span className="timer-icon">⏱</span>
            <span className="timer-value">{timer !== null && timer !== undefined ? `${timer}s` : "--"}</span>
          </div>
        </div>
      </header>

      {/* Main 3-Column Game Grid */}
      <div className="game-main-grid">
        {/* Left: Player Leaderboard */}
        <aside className="game-players-sidebar">
          <div className="sidebar-header">
            <h3>Players ({roomState?.players?.length || 0})</h3>
          </div>
          <ul className="game-players-list">
            {(roomState?.players || [])
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((player) => {
                const isThisPlayerDrawer = player.id === roomState?.drawerId;
                const isMe = player.id === currentSocketId;

                return (
                  <li
                    key={player.id}
                    className={`game-player-item ${isThisPlayerDrawer ? "player-is-drawer" : ""} ${
                      player.guessed ? "player-has-guessed" : ""
                    } ${isMe ? "player-is-me" : ""}`}
                  >
                    <div className="player-avatar-small">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="player-meta">
                      <span className="player-name">
                        {player.name} {isMe ? "(You)" : ""}
                      </span>
                      <div className="player-badges">
                        {player.isHost && <span className="badge badge-host">Host</span>}
                        {isThisPlayerDrawer && <span className="badge badge-drawer">🖌️ Drawing</span>}
                        {player.guessed && <span className="badge badge-guessed">✓ Guessed</span>}
                      </div>
                    </div>
                    <div className="player-score">{player.score} pts</div>
                  </li>
                );
              })}
          </ul>
        </aside>

        {/* Center: Drawing Canvas */}
        <section className="game-canvas-area">
          <DrawingBoard isDrawer={isDrawer} drawerName={currentDrawerPlayer?.name || "Drawer"} />
        </section>

        {/* Right: Chat & Guesses */}
        <aside className="game-chat-sidebar">
          <ChatBox
            messages={messages}
            onSendMessage={onSendMessage}
            isDrawer={isDrawer}
            alreadyGuessed={alreadyGuessed}
            disabled={roomState?.status === "ROUND_END" || roomState?.status === "GAME_OVER"}
          />
        </aside>
      </div>

      {/* Round End Modal Overlay */}
      {roundEndInfo && (
        <div className="game-modal-overlay">
          <div className="game-modal-card">
            <p className="eyebrow">ROUND OVER</p>
            <h2>{roundEndInfo.reason || "Time's up!"}</h2>
            <p className="modal-word-reveal">
              The secret word was: <strong>{roundEndInfo.word}</strong>
            </p>
            <p className="modal-next-turn">Next turn starting soon...</p>
          </div>
        </div>
      )}

      {/* Game Over Modal Overlay */}
      {gameOverInfo && (
        <div className="game-modal-overlay">
          <div className="game-modal-card game-over-card">
            <p className="eyebrow">MATCH FINISHED</p>
            <h2>Game Over!</h2>
            <p className="game-over-reason">{gameOverInfo.reason}</p>

            <div className="final-podium">
              {gameOverInfo.leaderboard?.map((p, index) => (
                <div key={p.id || index} className={`podium-row ${index === 0 ? "podium-winner" : ""}`}>
                  <span className="podium-rank">#{index + 1}</span>
                  <span className="podium-name">{p.name} {p.id === currentSocketId ? "(You)" : ""}</span>
                  <span className="podium-score"><strong>{p.score}</strong> pts</span>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button button-primary button-large"
                onClick={onBackToLobby}
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DrawingPage;
