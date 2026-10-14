/*
 * Backup of the previous homepage layout.
 * This component is intentionally not imported by App.jsx.
 */
function HomePageBackup({ user, notice, onCreate, onJoin }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">DRAW OR DIE</p>
          <h1>Draw something.<br /><em>Let them guess.</em></h1>
          <p className="hero-description">Create a room, invite your friends, and take turns drawing and guessing.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={onCreate}>Create game</button>
            <button className="button button-outline button-large" onClick={onJoin}>Join game</button>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
          {!user && <p className="login-hint">Log in first to start playing with your friends.</p>}
        </div>
        <div className="doodle-board" aria-label="Drawing game preview">
          <div className="drawing-preview">
            <span className="preview-sun" />
            <span className="preview-mountain preview-mountain-back" />
            <span className="preview-mountain preview-mountain-front" />
            <span className="preview-ground" />
            <span className="preview-house"><span className="preview-roof" /><span className="preview-door" /><span className="preview-window preview-window-left" /><span className="preview-window preview-window-right" /></span>
            <span className="preview-tree"><span className="preview-tree-top" /><span className="preview-tree-trunk" /></span>
            <span className="preview-note">a drawing<br /><strong>in progress</strong></span>
          </div>
        </div>
      </section>
      <section className="feature-row">
        <article><h2>Set the rules</h2><p>Choose rounds, time, and how many friends can join.</p></article>
        <article><h2>Draw together</h2><p>Use colors, brush sizes, and a real canvas that works with mouse or touch.</p></article>
        <article><h2>Beat the clock</h2><p>Guess quickly, score points, and make every second count.</p></article>
      </section>
    </>
  );
}

export default HomePageBackup;
