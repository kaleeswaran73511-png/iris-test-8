// ==========================================
// IRIS AI FRONTEND API CONNECTION
// ==========================================

const API_BASE = "http://localhost:5000";

// DOM helper
const $ = (id) => document.getElementById(id);


// ==========================================
// SEND COMMAND TO PYTHON BACKEND
// ==========================================

async function sendCommandToBackend(text) {
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
      throw new Error("Backend request failed");
    }

    const data = await response.json();

    return {
      success: true,
      reply: data.reply || "No response received.",
      status: data.status || "success"
    };

  } catch (error) {
    console.error("IRIS API ERROR:", error);

    return {
      success: false,
      reply: "Backend is offline. Please start the Python server.",
      status: "error"
    };
  }
}


// ==========================================
// GET SYSTEM STATUS
// ==========================================

async function getSystemStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`);

    if (!response.ok) {
      throw new Error("Unable to fetch system status");
    }

    const data = await response.json();

    return {
      success: true,
      cpu: data.cpu ?? 0,
      ram: data.ram ?? 0,
      battery: data.battery ?? 0,
      network: data.network ?? "Unknown"
    };

  } catch (error) {
    console.error("STATUS API ERROR:", error);

    return {
      success: false,
      cpu: 0,
      ram: 0,
      battery: 0,
      network: "Offline"
    };
  }
}


// ==========================================
// CHECK BACKEND HEALTH
// ==========================================

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);

    if (!response.ok) {
      return false;
    }

    return true;

  } catch (error) {
    return false;
  }
}


// ==========================================
// UPDATE SYSTEM STATUS UI
// ==========================================

async function updateSystemStatus() {
  const status = await getSystemStatus();

  if (!status.success) {
    if ($("connection")) {
      $("connection").textContent = "BACKEND OFFLINE";
    }

    if ($("backendStatus")) {
      $("backendStatus").textContent = "OFFLINE";
    }

    return;
  }

  if ($("cpu")) {
    $("cpu").textContent = `${Math.round(status.cpu)}%`;
  }

  if ($("ram")) {
    $("ram").textContent = `${Math.round(status.ram)}%`;
  }

  if ($("battery")) {
    $("battery").textContent = `${Math.round(status.battery)}%`;
  }

  if ($("network")) {
    $("network").textContent = status.network;
  }

  if ($("connection")) {
    $("connection").textContent = "SYSTEM ONLINE";
  }

  if ($("backendStatus")) {
    $("backendStatus").textContent = "CONNECTED";
  }
}


// ==========================================
// AUTO REFRESH STATUS
// ==========================================

setInterval(updateSystemStatus, 5000);

updateSystemStatus();


// ==========================================
// EXPORT API FUNCTIONS
// ==========================================

window.IRIS_API = {
  sendCommandToBackend,
  getSystemStatus,
  checkBackendHealth,
  updateSystemStatus
};
