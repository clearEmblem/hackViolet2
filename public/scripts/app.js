let btn = document.getElementById("button");
const icons = document.querySelectorAll("h2");
const record = document.querySelector(".container");
const wordList = ["key", "flashlight", "skeleton"];

btn.addEventListener("click", function (e) {
  console.log("works");
  /*
  const recordingIndicator = document.createElement("span");
  recordingIndicator.innerHTML = " 🔴";
  recordingIndicator.id = "recording-indicator";
  recordingIndicator.style.marginLeft = "10px";
  recordingIndicator.style.color = "red";
  recordingIndicator.style.fontSize = "1.2rem";

  // Append it next to the button
  record.appendChild(recordingIndicator);
    */
  icons.forEach((icon) => {
    icon.classList.add("fade-emoji");
    icon.classList.remove("show-emoji");
  });
  getImages();
  btn.remove();

  record.innerHTML =
    '<button type="button" class="btn btn-primary btn-lg" id="record">Record</button>';

  icons.forEach((icon, index) => {
    setTimeout(() => {
      icon.classList.add("show-emoji");
    }, index * 200);
  });
});

function getImages() {
  const array = [
    "🗝️",
    "🔦",
    "🌌",
    "🧳",
    "🌋",
    "👻",
    "🎪",
    "🦄",
    "🍭",
    "🐧",
    "🏔️",
    "🎸",
    "💔",
    "🌧️",
    "📞",
    "🎭",
    "🕯️",
    "🌊",
    "🤖",
    "🌌",
    "🕳️",
    "👽",
    "🔬",
    "🎈",
    "☕",
    "📖",
    "🌪️",
    "🧦",
    "🪞",
    "🚪",
    "🌵",
    "🐍",
    "💧",
    "🚤",
    "🌩️",
    "🏝️",
    "🎩",
    "🕰️",
    "🌀",
    "🧩",
    "🪐",
    "🌫️",
    "📸",
    "🎞️",
    "🚲",
    "🍂",
    "🪑",
    "🌌",
    "🕷️",
    "💎",
    "⚰️",
    "🎪",
    "🗡️",
    "🎭",
    "🌈",
    "🕊️",
    "📜",
    "🌱",
    "💌",
    "🏰",
    "🐊",
    "🍩",
    "🚀",
  ];
}

// const gifArray = [
//  "../images/med skeleton.gif",
//  "../images/key.gif",
//  "../images/flashlight.gif",
//];

let currentIndex = array.length;

while (currentIndex != 0) {
  let randomIndex = Math.floor(Math.random() * currentIndex);
  currentIndex--;

  [array[currentIndex], array[randomIndex]] = [
    array[randomIndex],
    array[currentIndex],
  ];

/* This is for the gifs method */
// icons[0].innerHTML = `<img src ="${gifArray[0]}" alt="Skeleton">`;
//icons[1].innerHTML = `<img src ="${gifArray[1]}" alt="Key">`;
// icons[2].innerHTML = `<img src ="${gifArray[2]}" alt="Flashlight">`;

/* This is used for the emojis method */

icons[0].innerText = array[0];
icons[1].innerText = array[1];
icons[2].innerText = array[2];
let emojiSting = array[0] + array[1] + array[2];
console.log(emojiSting);
}
Window.wordList = wordList;
