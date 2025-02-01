const playback = document.querySelector(".playback");
document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#record").then((recordButton) => {
    console.log("Record button found:", recordButton);
    recordButton.addEventListener("click", toggleMic);
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
