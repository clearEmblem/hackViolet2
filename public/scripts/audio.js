const playback = document.querySelector(".playback");
let recorder;
let chunks = [];
let canRecord = false;
let isRecording = false;

document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#record").then((recordButton) => {
    console.log("Record button found:", recordButton);

    recordButton.addEventListener("click", () => {
      toggleMic(); // Keep mic recording function as it is

      const containerDiv = document.querySelector(".container.text-center");

      // Check if the red symbol already exists
      const existingSymbol = containerDiv.querySelector(".rec-symbol");

      if (existingSymbol) {
        // If the symbol exists, remove it and reset button text & style
        containerDiv.removeChild(existingSymbol);
        recordButton.textContent = "Record"; // Change text back to "Record"
        recordButton.classList.remove("recording-active"); // Remove recording styles
      } else {
        // Create the red symbol element
        const recSymbol = document.createElement("span");
        recSymbol.textContent = "🔴";  // Red circle emoji
        recSymbol.style.marginLeft = "10px";  // Add margin to the left of the symbol
        recSymbol.classList.add("rec-symbol");  // Add a class for easier selection

        // Append the symbol next to the record button
        containerDiv.appendChild(recSymbol);
        recordButton.textContent = "Recording..."; // Change text to "Recording..."
        recordButton.classList.add("recording-active"); //  Add recording styles
      }
    });
  });
});

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

function recordSetup() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => {
        chunks.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        saveAudioToLocalStorage(audioBlob);
        sendAudioToServer(audioBlob);
        chunks = [];
        const audioURL = window.URL.createObjectURL(audioBlob);
        playback.src = audioURL;
        console.log(audioURL);
      };
      canRecord = true;
    })
    .catch(err => console.error('Error accessing media devices.', err));
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

function saveAudioToLocalStorage(audioBlob) {
  const reader = new FileReader();
  reader.readAsDataURL(audioBlob);
  reader.onloadend = function () {
    const base64data = reader.result;
    localStorage.setItem('audioFile', base64data);
    console.log('Audio file saved to local storage');
  };
}

function getAudioFromLocalStorage() {
  const base64data = localStorage.getItem('audioFile');
  if (base64data) {
    const audio = new Audio(base64data);
    audio.controls = true;
    document.body.appendChild(audio);
    console.log('Audio file retrieved from local storage');
  } else {
    console.log('No audio file found in local storage');
  }
}

function sendAudioToServer(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.mp3');

  fetch('http://localhost:8001/upload', {
    method: 'POST',
    body: formData
  })
    .then(response => response.text())
    .then(data => {
      console.log('Transcript:', data);
      localStorage.setItem('transcript', data);
    })
    .catch(error => {
      console.error('Error sending audio to server:', error);
    });
}

// Initialize the recording setup
recordSetup();
