const API_BASE = "http://localhost:5000";

const $ = (id) => document.getElementById(id);

function addLog(message) {
  const item = document.createElement("p");

  const time = new Date().toLocaleTimeString([], {
    hour12: false
  });

  item.textContent = `[${time}] ${message}`;

  $("logBox").prepend(item);

  while ($("logBox").children.length > 6) {
    $("logBox").lastElementChild.remove();
  }
}

function updateValue(id, value) {
  $(id).textContent = value;
}

async function refreshStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`);

    if (!response.ok) {
      throw new Error("Status unavailable");
    }

    const data = await response.json();

    updateValue("cpu", `${Math.round(Number(data.cpu) || 0)}%`);
    updateValue("ram", `${Math.round(Number(data.ram) || 0)}%`);
    updateValue("battery", `${Math.round(Number(data.battery) || 0)}%`);
    updateValue("network", data.network || "CONNECTED");

    $("connection").textContent = "SYSTEM ONLINE";
    $("backendStatus").textContent = "CONNECTED";

  } catch {
    $("connection").textContent = "BACKEND OFFLINE";
    $("backendStatus").textContent = "OFFLINE";
  }
}

async function sendCommand(command = $("commandInput").value) {
  const text = command.trim();

  if (!text) {
    return;
  }

  $("commandInput").value = "";
  $("reply").textContent = "IRIS is processing...";

  addLog(`COMMAND: ${text}`);

  try {
    const response = await fetch(`${API_BASE}/command`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text
      })
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = await response.json();

    $("reply").textContent = data.reply || "Command completed.";

    addLog("RESPONSE RECEIVED");

  } catch {
    $("reply").textContent =
      "Backend unavailable. Start your Python server on port 5000.";

    addLog("BACKEND CONNECTION FAILED");
  }
}

$("sendButton").addEventListener("click", () => {
  sendCommand();
});

$("commandInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendCommand();
  }
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => {
    sendCommand(button.dataset.command);
  });
});

document.querySelectorAll(".nav").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    $("pageTitle").textContent = button.dataset.title;

    addLog(`NAVIGATION: ${button.dataset.title}`);
  });
});

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    $("voiceStatus").textContent = "LISTENING FOR COMMAND...";
    $("micButton").style.boxShadow = "0 0 35px #ff2450";
  };

  recognition.onend = () => {
    $("voiceStatus").textContent = "VOICE CHANNEL STANDBY";
    $("micButton").style.boxShadow = "";
  };

  recognition.onerror = () => {
    $("voiceStatus").textContent = "VOICE INPUT ERROR";
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;

    $("commandInput").value = text;

    sendCommand(text);
  };

  $("micButton").addEventListener("click", () => {
    recognition.start();
  });

} else {
  $("micButton").addEventListener("click", () => {
    $("voiceStatus").textContent =
      "BROWSER SPEECH RECOGNITION NOT SUPPORTED";
  });
}

function updateClock() {
  $("clock").textContent = new Date().toLocaleTimeString([], {
    hour12: false
  });
}

updateClock();
setInterval(updateClock, 1000);

refreshStatus();
setInterval(refreshStatus, 5000);
