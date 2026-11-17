// Soothing, light ambient music generator using Web Audio API
// Procedurally plays gentle, relaxing lo-fi / chill ambient chords and soft chimes

let audioCtx = null;
let masterGain = null;
let delayNode = null;
let feedbackGain = null;
let filterNode = null;
let isPlaying = false;
let loopTimer = null;
let chimeTimer = null;
let chordStep = 0;
let userVolume = 0.35;

// Gentle, warm chord progressions (Fmaj7 -> Dm9 -> Bbmaj7 -> C9sus)
const CHORD_PROGRESSIONS = [
  // Fmaj7 (F3, A3, C4, E4)
  [174.61, 220.00, 261.63, 329.63],
  // Dm9 (D3, F3, A3, C4, E4)
  [146.83, 174.61, 220.00, 261.63, 329.63],
  // Bbmaj7 (Bb2, F3, Bb3, D4, F4)
  [116.54, 174.61, 233.08, 293.66, 349.23],
  // C9sus (C3, G3, C4, D4, E4)
  [130.81, 196.00, 261.63, 293.66, 329.63],
];

// Soothing pentatonic melody notes for gentle ambient chimes
const CHIME_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    // Master gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(userVolume, audioCtx.currentTime);

    // Warm low-pass filter (muffles harsh highs for cozy lo-fi feel)
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(680, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(1.0, audioCtx.currentTime);

    // Subtle ambient delay/echo
    delayNode = audioCtx.createDelay();
    delayNode.delayTime.setValueAtTime(0.42, audioCtx.currentTime);

    feedbackGain = audioCtx.createGain();
    feedbackGain.gain.setValueAtTime(0.25, audioCtx.currentTime);

    // Connect delay loop
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    feedbackGain.connect(masterGain);

    // Filter to master & delay
    filterNode.connect(masterGain);
    filterNode.connect(delayNode);

    masterGain.connect(audioCtx.destination);
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playPadNote(freq, duration = 4.2) {
  if (!audioCtx || !isPlaying) return;

  const now = audioCtx.currentTime;

  // Dual detuned oscillators for lush chorus warmth
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  osc1.type = "sine";
  osc2.type = "triangle";

  osc1.frequency.setValueAtTime(freq, now);
  osc2.frequency.setValueAtTime(freq * 1.002, now); // subtle detune

  // Soft attack and long gentle release
  noteGain.gain.setValueAtTime(0.0001, now);
  noteGain.gain.linearRampToValueAtTime(0.045, now + 1.2);
  noteGain.gain.exponentialRampToValueAtTime(0.02, now + duration * 0.7);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc1.connect(noteGain);
  osc2.connect(noteGain);
  noteGain.connect(filterNode);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration + 0.1);
  osc2.stop(now + duration + 0.1);
}

function playSoftChime() {
  if (!audioCtx || !isPlaying) return;

  const now = audioCtx.currentTime;
  const randomFreq = CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)];

  const osc = audioCtx.createOscillator();
  const chimeGain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(randomFreq, now);

  // Soft bell chime envelope
  chimeGain.gain.setValueAtTime(0.0001, now);
  chimeGain.gain.linearRampToValueAtTime(0.028, now + 0.04);
  chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

  osc.connect(chimeGain);
  chimeGain.connect(delayNode);
  chimeGain.connect(filterNode);

  osc.start(now);
  osc.stop(now + 2.5);
}

function playNextChord() {
  if (!isPlaying) return;

  const chord = CHORD_PROGRESSIONS[chordStep % CHORD_PROGRESSIONS.length];
  chordStep++;

  chord.forEach((freq, index) => {
    // Stagger note entries slightly for natural humanized strum
    setTimeout(() => {
      if (isPlaying) {
        playPadNote(freq, 4.4);
      }
    }, index * 80);
  });
}

export function startChillMusic() {
  if (isPlaying) return true;

  try {
    initAudioContext();
    isPlaying = true;

    if (masterGain && audioCtx) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(userVolume, audioCtx.currentTime + 1.5);
    }

    // Play first chord immediately
    playNextChord();

    // Advance chords every 4 seconds
    clearInterval(loopTimer);
    loopTimer = setInterval(playNextChord, 4000);

    // Play soothing random chimes every 2-5 seconds
    clearInterval(chimeTimer);
    const scheduleNextChime = () => {
      if (!isPlaying) return;
      playSoftChime();
      const nextDelay = 2200 + Math.random() * 3200;
      chimeTimer = setTimeout(scheduleNextChime, nextDelay);
    };
    scheduleNextChime();

    return true;
  } catch (error) {
    console.warn("Could not start ambient audio:", error);
    isPlaying = false;
    return false;
  }
}

export function stopChillMusic() {
  if (!isPlaying) return;
  isPlaying = false;

  clearInterval(loopTimer);
  clearTimeout(chimeTimer);

  if (masterGain && audioCtx) {
    try {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    } catch {
      // Ignore
    }
  }
}

export function toggleChillMusic() {
  if (isPlaying) {
    stopChillMusic();
    return false;
  } else {
    return startChillMusic();
  }
}

export function setChillMusicVolume(volume) {
  userVolume = Math.max(0, Math.min(1, volume));
  if (masterGain && audioCtx && isPlaying) {
    masterGain.gain.linearRampToValueAtTime(userVolume, audioCtx.currentTime + 0.1);
  }
}

export function isChillMusicPlaying() {
  return isPlaying;
}
