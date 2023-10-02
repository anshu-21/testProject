document.addEventListener("DOMContentLoaded", function () {
  const startRecordingButton = document.getElementById("startRecording");

  startRecordingButton.addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "request_recording" },
        (response) => {
          if (!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.log(chrome.runtime.lastError);
          }
        }
      );
    });
  });
});

function toggleButtons(activeButton) {
  const button1 = document.getElementById("button1");
  const button2 = document.getElementById("button2");

  if (activeButton === "button1") {
    button1.disabled = true;
    button2.disabled = false;
  } else {
    button1.disabled = false;
    button2.disabled = true;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const closeButton = document.getElementById("closeButton");

  closeButton.addEventListener("click", function () {
    window.close();
  });
});
