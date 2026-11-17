import { useState, useRef, useEffect } from "react";

function ChatBox({ messages = [], onSendMessage, isDrawer = false, alreadyGuessed = false, disabled = false }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled) return;
    onSendMessage(text);
    setInput("");
  };

  const getPlaceholder = () => {
    if (disabled) return "Waiting for round...";
    if (isDrawer) return "Chat (you are drawing)...";
    if (alreadyGuessed) return "You guessed it! Chat with others...";
    return "Type your guess here...";
  };

  return (
    <section className="chat-container">
      <div className="chat-header">
        <h3>Room Chat & Guesses</h3>
      </div>

      <div className="chat-messages" role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet. Send a guess!</p>
        )}
        {messages.map((m, index) => {
          if (m.system) {
            return (
              <div key={index} className="chat-msg chat-msg-system">
                <span>{m.text}</span>
              </div>
            );
          }

          if (m.hidden) {
            return (
              <div key={index} className="chat-msg chat-msg-hidden">
                <span className="chat-author">{m.name}:</span>
                <span className="chat-text">{m.text}</span>
                <span className="chat-badge" title="Visible only to drawer and players who guessed">🔒</span>
              </div>
            );
          }

          return (
            <div key={index} className="chat-msg">
              <span className="chat-author">{m.name}:</span>
              <span className="chat-text">{m.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          maxLength={100}
          disabled={disabled}
        />
        <button type="submit" className="button button-primary chat-send-btn" disabled={disabled || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}

export default ChatBox;
