import DrawingBoard from "../components/DrawingBoard";

function DrawingPage({ onBack }) {
  return (
    <section className="drawing-page">
      <div className="drawing-page-intro">
        <button className="button button-ghost" type="button" onClick={onBack}>
          ← Back to home
        </button>
        <p className="eyebrow">GAME ROOM PREVIEW</p>
        <h1>Ready to draw?</h1>
        <p>
          This is the starter canvas for the future game room. Multiplayer
          drawing, rooms, timers, and guessing will be connected here later.
        </p>
      </div>
      <DrawingBoard />
    </section>
  );
}

export default DrawingPage;
