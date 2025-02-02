/*
const playback = document.querySelector(".playback");
document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#record").then((recordButton) => {
    console.log("Record button found:", recordButton);
    recordButton.addEventListener("click", toggleMic);

    const recSymbol = document.createElement("span");
    recSymbol.textContent = "🔴";
    recSymbol.style.marginLeft = "10px";
    recSymbol.classList.add("rec-symbol");

    const containerDiv = document.querySelector(".container.text-center");
    //checks if rec symbol is there
    
    const existingSymbol = containerDiv.querySelector(".container.text-center");
    
    //const existingSymbol = containerDiv.querySelector(".rec-symbol");

    if (existingSymbol) {
      // If the symbol exists, remove it
      containerDiv.removeChild(existingSymbol);
    } else {
      // If the symbol doesn't exist, append it
      containerDiv.appendChild(recSymbol);
  }});
});
*/
 
//BOTH MIC AND SYMBOL WORK
const playback = document.querySelector(".playback");

document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#record").then((recordButton) => {
    console.log("Record button found:", recordButton);
    recordButton.addEventListener("click", () => {
      toggleMic(); // ✅ Keep mic recording function as it is

      const containerDiv = document.querySelector(".container.text-center");

      // Check if the red symbol already exists
      const existingSymbol = containerDiv.querySelector(".rec-symbol");

      if (existingSymbol) {
        // If the symbol exists, remove it
        containerDiv.removeChild(existingSymbol);
      } else {
        // Create the red symbol element
        const recSymbol = document.createElement("span");
        recSymbol.textContent = "🔴";  // Red circle emoji
        recSymbol.style.marginLeft = "10px";  // Add margin to the left of the symbol
        recSymbol.classList.add("rec-symbol");  // Add a class for easier selection

        // Append the symbol next to the record button
        containerDiv.appendChild(recSymbol);
      }
    });
  });
});

//the button works but not the mic
/*
document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#record").then((recordButton) => {
    console.log("Record button found:", recordButton);

    // Target the container div
    const containerDiv = document.querySelector(".container.text-center");

    recordButton.addEventListener("click", () => {
      toggleMic(); // Call your mic toggle function

      // Check if the red symbol already exists
      let existingSymbol = containerDiv.querySelector(".rec-symbol");

      if (existingSymbol) {
        // If the symbol exists, remove it
        containerDiv.removeChild(existingSymbol);
      } else {
        // Create the red symbol element
        const recSymbol = document.createElement("span");
        recSymbol.textContent = "🔴";  // Red circle emoji
        recSymbol.style.marginLeft = "10px";  // Add margin to the left of the symbol
        recSymbol.classList.add("rec-symbol");  // Add a class for easier selection

        // Append the symbol next to the record button
        containerDiv.appendChild(recSymbol);
      }
    });
  });
});
*/
/*
document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#record").then((recordButton) => {
    console.log("Record button found:", recordButton);

    // Target the container div
    const containerDiv = document.querySelector(".container.text-center");

    recordButton.addEventListener("click", () => {
      toggleMic(); // ✅ Make sure the mic recording function is called

      // Check if the red symbol already exists
      let existingSymbol = containerDiv.querySelector(".rec-symbol");

      if (existingSymbol) {
        // If the symbol exists, remove it
        containerDiv.removeChild(existingSymbol);
      } else {
        // Create the red symbol element
        const recSymbol = document.createElement("span");
        recSymbol.textContent = "🔴";  // Red circle emoji
        recSymbol.style.marginLeft = "10px";  // Add margin to the left of the symbol
        recSymbol.classList.add("rec-symbol");  // Add a class for easier selection

        // Append the symbol next to the record button
        containerDiv.appendChild(recSymbol);
      }
    });
  });
});
*/
function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

let canRecord = false;
let isRecording = false;
let recorder = null;
let chunks = [];

function recordSetup() {
  console.log("setup");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(setupStream)
      .catch((e) => {
        console.log(e);
      });
  }
}
recordSetup();

function setupStream(stream) {
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };
  recorder.onstop = (e) => {
    const blob = new Blob(chunks, { type: "audio/mpeg; codecs=opus" });
    chunks = [];
    const audioURL = window.URL.createObjectURL(blob);
    playback.src = audioURL;
    console.log(audioURL);
  };
  canRecord = true;
}

function toggleMic() {
  if (!canRecord) return;
  isRecording = !isRecording;

  if (isRecording) {
    recorder.start();
    console.log("recording");
  } else {
    recorder.stop();
    console.log("stopped recording");
  }
}
