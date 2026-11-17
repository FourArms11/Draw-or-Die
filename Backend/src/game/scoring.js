export function calculateGuesserScore(timeRemaining, totalTime) {
    if (totalTime <= 0) return 50;
    const ratio = Math.max(0, Math.min(1, timeRemaining / totalTime));
    return 50 + Math.round(100 * ratio);
}

export function calculateDrawerScore() {
    return 35;
}

export function rankPlayers(playersArray) {
    return [...playersArray].sort((a, b) => b.score - a.score);
}
