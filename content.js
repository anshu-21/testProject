console.log("Hi from content.js");

let recorder = null;

async function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);
  const videoChunks = [];
  const audioChunks = [];

  console.log("videoChunks:", videoChunks);

  recorder.start(1000);

  await fetch("https://chrome-extenion.onrender.com/api/video/start", {
    method: "POST",
  });

  recorder.onstop = async () => {
    stream.getTracks().forEach(async (track) => {
      if (track.readyState === "live") {
        track.stop();

        const response = await fetch(
          "https://chrome-extenion.onrender.com/api/video/upload",
          {
            method: "POST",
          }
        );
        const data = await response.json();

        console.log("data sent:", data);
      }
    });
  };

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      if (event.data.type === "video/webm;codecs=vp8") {
        videoChunks.push(event.data);
        console.log("event data:", event.data);
      } else if (event.data.type === "audio/webm") {
        audioChunks.push(event.data);
      } else {
        console.log("not match");
      }
    }
    console.log("video chunks:", videoChunks);
    const recordedBlob = event.data;

    sendChunkToBackend(recordedBlob);
  };
}

async function sendChunkToBackend(blob) {
  const formData = new FormData();
  formData.append("file", blob, "capture.webm");

  try {
    const response = await fetch(
      "https://chrome-extenion.onrender.com/api/video/save",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();

    console.log("data sent to backend:", data);
  } catch (error) {
    console.error("Error while sending chunks:", error);
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    sendResponse(`processed: ${message.action}`);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: {
          width: 9999999999,
          height: 9999999999,
        },
      });
      await onAccessApproved(stream);
    } catch (error) {
      console.error("Error requesting access and recording:", error);
    }
  }

  if (message.action === "stopvideo") {
    sendResponse(`processed: ${message.action}`);
    if (!recorder) return console.log("no recorder");
    recorder.stop();

    try {
      const response = await fetch(
        "https://chrome-extenion.onrender.com/api/video/upload",
        {
          method: "POST",
        }
      );
      const data = await response.json();

      console.log("Chunk sent successfully:", data);
    } catch (error) {
      console.error("Error while uploading chunks:", error);
    }
  }
});
