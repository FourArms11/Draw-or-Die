let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(frequency, startTime, duration, volume, type = "sine") {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endTime = startTime + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime + 0.02);
}

export function playGuessSuccess() {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(523.25, now, 0.14, 0.12, "triangle");
  playTone(659.25, now + 0.1, 0.2, 0.14, "triangle");
  playTone(783.99, now + 0.2, 0.28, 0.16, "triangle");
}

export function playTimerTick() {
  const context = getAudioContext();
  if (!context) return;

  playTone(880, context.currentTime, 0.08, 0.06, "square");
}

export function playChatMessage() {
  const context = getAudioContext();
  if (!context) return;

  playTone(392, context.currentTime, 0.1, 0.045, "sine");
}
