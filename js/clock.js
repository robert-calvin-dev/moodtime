const clockElement = document.getElementById("clock");
const formatSelect = document.getElementById("time-format");

let timeFormat = localStorage.getItem("timeFormat") || "24";
formatSelect.value = timeFormat;

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  let displayTime;

  if (timeFormat === "12") {
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    displayTime = `${hours}:${minutes}:${seconds} ${ampm}`;
  } else {
    displayTime = `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
  }

  clockElement.textContent = displayTime;
}

formatSelect.addEventListener("change", (e) => {
  timeFormat = e.target.value;
  localStorage.setItem("timeFormat", timeFormat);
  updateClock();
});

setInterval(updateClock, 1000);
updateClock();