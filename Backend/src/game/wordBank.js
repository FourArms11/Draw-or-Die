export const WORDS = [
    "airplane", "apple", "backpack", "banana", "baseball", "battery", "bicycle", "bird",
    "boat", "book", "bottle", "bridge", "butterfly", "cactus", "camera", "candle",
    "car", "castle", "cat", "chair", "clock", "cloud", "clown", "cookie",
    "cow", "cup", "dinosaur", "dog", "dolphin", "door", "dragon", "drum",
    "duck", "elephant", "eye", "fire", "fish", "flower", "fork", "ghost",
    "giraffe", "glasses", "guitar", "hammer", "hat", "helicopter", "horse", "house",
    "ice cream", "island", "key", "kite", "ladder", "leaf", "light bulb", "lighthouse",
    "lion", "moon", "mountain", "mushroom", "octopus", "orange", "owl", "paintbrush",
    "pants", "pencil", "penguin", "piano", "pig", "pirate", "pizza", "planet",
    "rabbit", "rainbow", "robot", "rocket", "sandwich", "scissors", "shark", "ship",
    "shoe", "skateboard", "snake", "snowman", "spider", "spoon", "star", "sun",
    "sword", "telephone", "tent", "tiger", "train", "tree", "turtle", "umbrella",
    "volcano", "watch", "whale", "windmill", "wizard", "zebra"
];

export function getRandomWord(usedWords = new Set()) {
    const available = WORDS.filter(w => !usedWords.has(w.toLowerCase()));
    const pool = available.length > 0 ? available : WORDS;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex].toLowerCase();
}

export function maskWord(word = "") {
    return word
        .split("")
        .map(char => {
            if (char === " ") return "  ";
            if (char === "-") return "-";
            return "_ ";
        })
        .join("")
        .trim();
}
