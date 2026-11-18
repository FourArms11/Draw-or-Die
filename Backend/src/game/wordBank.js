export const EASY_WORDS = [
    "apple", "house", "car", "sun", "moon", "book", "chair", "tree", "pizza", "ball",
    "star", "phone", "flower", "cloud", "clock", "banana", "ice cream", "table",
    "pencil", "bicycle",
];

export const MEDIUM_WORDS = [
    "airplane", "rainbow", "telescope", "waterfall", "lighthouse", "basketball",
    "toothbrush", "helicopter", "snowman", "guitar", "castle", "volcano", "umbrella",
    "sandwich", "camera", "robot", "camping", "bridge", "suitcase", "swimming pool",
];

export const DIFFICULT_WORDS = [
    "archaeologist", "astronaut", "microscope", "parachute", "chandelier", "pyramid",
    "scarecrow", "aquarium", "submarine", "thermometer", "roller coaster", "windmill",
    "stethoscope", "fossil", "hurricane", "blacksmith", "labyrinth", "binoculars",
    "skyscraper", "hourglass",
];

export const FUNNY_WORDS = [
    "potato", "pickle", "chicken nugget", "banana peel", "toilet paper", "disco ball",
    "clown", "spaghetti", "burrito", "jelly sandwich", "bubble wrap", "broken pencil",
    "invisible wall", "slipper", "birthday cake",
];

export const TECHNOLOGY_WORDS = [
    "laptop", "keyboard", "mouse", "smartphone", "headphones", "internet", "drone",
    "bluetooth", "wi-fi", "printer", "satellite", "joystick", "webcam", "microchip",
    "television",
];

export const LEGACY_WORDS = [
    "backpack", "baseball", "battery", "bird", "boat", "bottle", "butterfly", "cactus",
    "candle", "cat", "cookie", "cow", "cup", "dinosaur", "dog", "dolphin", "door",
    "dragon", "drum", "duck", "elephant", "eye", "fire", "fish", "fork", "ghost",
    "giraffe", "glasses", "hammer", "hat", "horse", "island", "key", "kite", "ladder",
    "leaf", "light bulb", "lion", "mountain", "mushroom", "octopus", "orange", "owl",
    "paintbrush", "pants", "penguin", "piano", "pig", "pirate", "planet", "rabbit",
    "rocket", "scissors", "shark", "ship", "shoe", "skateboard", "snake", "spider",
    "spoon", "sword", "telephone", "tent", "tiger", "train", "turtle", "watch",
    "whale", "wizard", "zebra",
];

export const WORDS = [
    ...EASY_WORDS,
    ...MEDIUM_WORDS,
    ...DIFFICULT_WORDS,
    ...FUNNY_WORDS,
    ...TECHNOLOGY_WORDS,
    ...LEGACY_WORDS,
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
