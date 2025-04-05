// audio.js

const audioMap = {
 calm: "assets/audio/calm_forest.mp3",
 anxious: "assets/audio/soft_rain_anxious.mp3",
 sad: "assets/audio/mournful_piano.mp3",
 focused: "assets/audio/cafe_lofi_loop.mp3",
 euphoric: "assets/audio/celestial_synths.mp3",
};

const videoMap = {
 calm: "assets/video/calm.mp4",
 anxious: "assets/video/anxious.mp4",
 sad: "assets/video/sad.mp4",
 focused: "assets/video/focused.mp4",
 euphoric: "assets/video/euphoric.mp4",
};

let currentAudio = null;
let fadeInterval = null;

const muteBtn = document.getElementById("mute-toggle");
const volumeSlider = document.getElementById("volume-control");
const toggleAudioBtn = document.getElementById("toggle-audio");

const backgroundVideo = document.createElement("video");
backgroundVideo.id = "background-video";
backgroundVideo.autoplay = true;
backgroundVideo.loop = true;
backgroundVideo.muted = true;
backgroundVideo.playsInline = true;
backgroundVideo.style.position = "fixed";
backgroundVideo.style.top = "0";
backgroundVideo.style.left = "0";
backgroundVideo.style.width = "100%";
backgroundVideo.style.height = "100%";
backgroundVideo.style.objectFit = "cover";
backgroundVideo.style.zIndex = "-2";
backgroundVideo.style.opacity = "1";
backgroundVideo.style.transition = "opacity 1s ease";
document.body.prepend(backgroundVideo);

const fadeVideo = document.createElement("video");
fadeVideo.autoplay = true;
fadeVideo.loop = true;
fadeVideo.muted = true;
fadeVideo.playsInline = true;
fadeVideo.style.position = "fixed";
fadeVideo.style.top = "0";
fadeVideo.style.left = "0";
fadeVideo.style.width = "100%";
fadeVideo.style.height = "100%";
fadeVideo.style.objectFit = "cover";
fadeVideo.style.zIndex = "-1";
fadeVideo.style.opacity = "0";
fadeVideo.style.transition = "opacity 1s ease";
document.body.prepend(fadeVideo);

function updateMuteButtonText(isMuted) {
 muteBtn.textContent = isMuted ? "🔇 Unmute" : "🔊 Mute";
}

function crossfadeToNewAudio(newSrc) {
 if (fadeInterval) clearInterval(fadeInterval);

 if (currentAudio) {
   const oldAudio = currentAudio;
   const fadeOutStep = 0.05;
   fadeInterval = setInterval(() => {
     if (oldAudio.volume > fadeOutStep) {
       oldAudio.volume -= fadeOutStep;
     } else {
       oldAudio.pause();
       clearInterval(fadeInterval);
     }
   }, 50);
 }

 currentAudio = new Audio(newSrc);
 currentAudio.loop = true;
 const initialVolume = parseFloat(localStorage.getItem("volume") || 0.5);
 const isMuted = localStorage.getItem("muted") === "true";

 currentAudio.volume = 0;
 currentAudio.muted = isMuted;
 updateMuteButtonText(isMuted);
 toggleAudioBtn.textContent = "▶️ Play";
 toggleAudioBtn.disabled = false;
}

function updateMoodAudio(mood) {
 if (!audioMap[mood]) return;
 localStorage.setItem("currentMood", mood);
 crossfadeToNewAudio(audioMap[mood]);
}

function updateMoodVideo(mood) {
 if (!videoMap[mood]) return;
 fadeVideo.src = videoMap[mood];
 fadeVideo.style.opacity = "1";
 fadeVideo.oncanplay = () => {
   fadeVideo.play();
   setTimeout(() => {
     backgroundVideo.src = videoMap[mood];
     backgroundVideo.load();
     backgroundVideo.play();
     fadeVideo.style.opacity = "0";
   }, 1000);
 };
 fadeVideo.load();
}

muteBtn.addEventListener("click", () => {
 if (!currentAudio) return;
 const newMuteState = !currentAudio.muted;
 currentAudio.muted = newMuteState;
 localStorage.setItem("muted", newMuteState);
 updateMuteButtonText(newMuteState);
});

volumeSlider.addEventListener("input", () => {
 const vol = parseFloat(volumeSlider.value);
 localStorage.setItem("volume", vol);
 if (currentAudio && !currentAudio.paused) currentAudio.volume = vol;
});

toggleAudioBtn.addEventListener("click", () => {
 if (!currentAudio) return;
 const targetVolume = parseFloat(localStorage.getItem("volume") || 0.5);

 if (currentAudio.paused) {
   currentAudio.volume = 0;
   currentAudio.play()
     .then(() => {
       toggleAudioBtn.textContent = "⏸ Pause";
       fadeInterval = setInterval(() => {
         if (currentAudio.volume + 0.05 < targetVolume) {
           currentAudio.volume += 0.05;
         } else {
           currentAudio.volume = targetVolume;
           clearInterval(fadeInterval);
         }
       }, 50);
     })
     .catch(err => console.warn("Audio play error:", err));
 } else {
   currentAudio.pause();
   toggleAudioBtn.textContent = "▶️ Play";
 }
});

window.addEventListener("DOMContentLoaded", () => {
 volumeSlider.value = localStorage.getItem("volume") || 0.5;
 toggleAudioBtn.disabled = true;
 const savedMood = localStorage.getItem("currentMood");
 if (savedMood && audioMap[savedMood]) {
   updateMoodAudio(savedMood);
   updateMoodVideo(savedMood);
   document.body.setAttribute("data-mood", savedMood);
 }
 if (localStorage.getItem("theme") === "light") {
   document.body.classList.add("light-mode");
 }
});

document.getElementById("toggle-theme").addEventListener("click", () => {
 document.body.classList.toggle("light-mode");
 localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
});




