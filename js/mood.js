// mood.js

const moodColors = {
  lightest: {
    dark: "rgba(16, 0, 76, 0.37)",
    light: "rgba(0, 255, 132, 0.3)",
  },
  lighter: {
    dark: "rgba(0, 94, 125, 0.41)",
    light: "rgba(0, 255, 13, 0.3)"
  },
  light: {
    dark: "rgba(0, 139, 118, 0.41)",
    light: "rgba(3, 49, 255, 0.3)"
  },
  heavy: {
    dark: "rgba(59, 5, 117, 0.41)",
    light: "rgba(230, 0, 255, 0.3)"
  },
  heavier: {
    dark: "rgba(127, 0, 66, 0.41)",
    light: "rgba(0, 225, 255, 0.3)"
  },
  heaviest: {
    dark: "rgba(0, 123, 127, 0.41)",
    light: "rgba(0, 255, 128, 0.3)"
  }

};

window.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("toggle-theme");
  const container = document.querySelector(".clock-container");
  const buttons = document.querySelectorAll("button");
  const iconSwap = () => {
    themeToggle.textContent = document.body.classList.contains("light-mode") ? "🌙 " : "🌞";
  };

  if (themeToggle) {
    function applyThemeStyles() {
      const isLight = document.body.classList.contains("light-mode");

      themeToggle.style.padding = "0.5rem 1.5rem";
      themeToggle.style.fontSize = "2rem";
      themeToggle.style.border = "none";
      themeToggle.style.borderRadius = "6px";
   
      themeToggle.style.cursor = "pointer";
      themeToggle.style.transition = "background-color 0.3s ease, color 0.3s ease";
      themeToggle.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";

      if (container) {
        const mood = localStorage.getItem("currentMood");
        if (mood && moodColors[mood]) {
          container.style.backgroundColor = isLight ? moodColors[mood].light : moodColors[mood].dark;
        } else {
          container.style.backgroundColor = isLight ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)";
        }
        container.style.boxShadow = "0 4px 30px rgba(0,0,0,0.1)";
        container.style.backdropFilter = "blur(8px)";
        container.style.border = "2px solid rgb(255, 255, 255)";
        container.style.borderRadius = "12px";
        container.style.fontFamily = "'Inter', 'Roboto', sans-serif";
      }

      buttons.forEach(btn => {
        btn.style.backgroundColor = isLight ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0)";
        btn.style.color = isLight ? "#fff" : "#fff";
        btn.style.border = "1px dotted white";
        btn.style.borderRadius = "6px";
        btn.style.padding = "0.5rem 1.2rem";
        btn.style.boxShadow = "0 2px 6px rgb(0, 0, 0)";
        btn.style.transition = "all 0.2s ease";
      });

      iconSwap();
    }

    applyThemeStyles();

    themeToggle.addEventListener("mouseenter", () => {
      themeToggle.style.backgroundColor = document.body.classList.contains("light-mode") ? "#ccc" : "#333";
    });

    themeToggle.addEventListener("mouseleave", () => {
      applyThemeStyles();
    });

    const observer = new MutationObserver(applyThemeStyles);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  const savedMood = localStorage.getItem("currentMood");
  if (container && savedMood && moodColors[savedMood]) {
    const isLight = document.body.classList.contains("light-mode");
    container.style.backgroundColor = isLight ? moodColors[savedMood].light : moodColors[savedMood].dark;
  }

  renderMoodHistory();
});

// The rest of your existing code remains unchanged


document.getElementById("mood-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const mood = document.querySelector("input[name='mood']:checked");
  const status = document.getElementById("mood-status");

  if (!mood) {
    status.textContent = "Please select a mood.";
    status.style.color = "#ff8888";
    return;
  }

  const data = new FormData();
  data.append("mood", mood.value);

  localStorage.setItem("currentMood", mood.value);
  logMoodLocally(mood.value);
  updateMoodAudio(mood.value);
  updateMoodVideo(mood.value);
  document.body.setAttribute("data-mood", mood.value);

  const container = document.querySelector(".clock-container");
  if (container && moodColors[mood.value]) {
    const isLight = document.body.classList.contains("light-mode");
    container.style.backgroundColor = isLight ? moodColors[mood.value].light : moodColors[mood.value].dark;
  }

  try {
    const response = await fetch("php/save-mood.php", {
      method: "POST",
      body: data
    });
    const result = await response.text();
    status.textContent = result;
    status.style.color = "#a0ffa0";
    renderMoodHistory();

    if (typeof currentAudio !== "undefined" && currentAudio) {
      const targetVolume = parseFloat(localStorage.getItem("volume") || "0.5");
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.volume = 0;

      currentAudio.play().then(() => {
        document.getElementById("toggle-audio").textContent = "⏸ Pause";
        let v = 0;
        const step = 0.05;
        const fadeIn = setInterval(() => {
          if (v < targetVolume) {
            v = Math.min(v + step, targetVolume);
            currentAudio.volume = v;
          } else {
            clearInterval(fadeIn);
          }
        }, 50);
      }).catch(err => console.warn("Audio auto-restart error:", err));
    }
  } catch (error) {
    status.textContent = "Failed to save mood.";
    status.style.color = "#ff8888";
  }
});

function logMoodLocally(mood) {
  const history = JSON.parse(localStorage.getItem("moodHistory") || "[]");
  history.push({ mood, timestamp: new Date().toISOString() });
  localStorage.setItem("moodHistory", JSON.stringify(history));
}

function renderMoodHistory() {
  const container = document.getElementById("mood-history");
  const toggle = document.getElementById("toggle-history");
  if (!container) return;

  if (toggle && !toggle.hasListenerAttached) {
    toggle.addEventListener("click", () => {
      container.style.display = container.style.display === "none" ? "block" : "none";
    });
    toggle.hasListenerAttached = true;
  }

  const history = JSON.parse(localStorage.getItem("moodHistory") || "[]");
  container.innerHTML = "<h3 style='margin-top: 10px;'>Mood History</h3>";

  const list = document.createElement("ul");
  list.style.maxHeight = "200px";
  list.style.overflowY = "auto";
  list.style.padding = "0.5rem 1rem";
  list.style.margin = "1rem auto";
  list.style.border = "1px solid rgba(255,255,255,0.1)";
  list.style.backgroundColor = "rgba(255,255,255,0.05)";
  list.style.borderRadius = "8px";
  list.style.fontSize = "0.9rem";
  list.style.listStyleType = "none";
  list.style.textAlign = "left";

  history.slice(-10).reverse().forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.mood.toUpperCase()} — ${new Date(entry.timestamp).toLocaleString()}`;
    list.appendChild(li);
  });

  container.appendChild(list);

}

