import DrawingBoard from "../components/DrawingBoard";

function DrawingPage({ onBack, settings, notice }) {
  return (
    <main className="drawing-page">
      <div className="drawing-page-intro">
        <button className="back-link" onClick={onBack}>← Back to home</button>
        <div className="board-title-row">
          <div><p className="eyebrow">LOCAL BOARD PREVIEW</p><h1>Make your mark.</h1></div>
          <div className="round-settings"><strong>{settings?.rounds || 3}</strong> rounds</div>
        </div>
        {notice && <p className="board-notice">{notice}</p>}
      </div>
      <DrawingBoard />
    </main>
  );
}

export default DrawingPage;
