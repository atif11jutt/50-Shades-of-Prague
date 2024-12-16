(function ($) {
  $("[data-fancybox]").fancybox({
    transitionIn: "elastic",
    transitionOut: "elastic",
    speedIn: 600,
    speedOut: 200,
    buttons: ["slideShow", "fullScreen", "thumbs", "share", "zoom", "close"],
  });
  const audio = document.getElementById("backgroundAudio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const volumeBtn = document.getElementById("volumeBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  let hasInteracted = !1;
  function updatePlayPauseBtn() {
    if (audio.paused) {
      playPauseBtn.textContent = "▶";
      playPauseBtn.classList.remove("playing");
    } else {
      playPauseBtn.textContent = "⏸";
      playPauseBtn.classList.add("playing");
    }
  }
  function handleInteraction() {
    if (!hasInteracted) {
      audio
        .play()
        .then(() => {
          updatePlayPauseBtn();
          hasInteracted = !0;
          removeInteractivityListeners();
        })
        .catch((err) => {
          console.warn("Autoplay blocked: ", err.message);
        });
    }
  }
  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch((err) => console.warn("Play failed: ", err.message));
    } else {
      audio.pause();
    }
    updatePlayPauseBtn();
  });
  volumeBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    volumeBtn.textContent = audio.muted ? "🔈" : "🔊";
  });
  volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });
  function addInteractivityListeners() {
    document.addEventListener("click", handleInteraction);
    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener("mousemove", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
    document.addEventListener("scroll", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
  }
  function removeInteractivityListeners() {
    document.removeEventListener("click", handleInteraction);
    document.removeEventListener("mousedown", handleInteraction);
    document.removeEventListener("mousemove", handleInteraction);
    document.removeEventListener("touchstart", handleInteraction);
    document.removeEventListener("scroll", handleInteraction);
    document.removeEventListener("keydown", handleInteraction);
  }
  addInteractivityListeners();
  audio.addEventListener("ended", updatePlayPauseBtn);
  audio.addEventListener("play", updatePlayPauseBtn);
  audio.addEventListener("pause", updatePlayPauseBtn);


  var images = $('#rotate img'); // Select all images
    var index = 0;

    function showNextImage() {
        images.eq(index).fadeOut(300);
        index = (index + 1) % images.length; // Move to the next image, loop back if at the end
        images.eq(index).fadeIn(500); // Fade in the next image in 500ms
    }

    images.not(':first').hide(); // Hide all except the first image
    setInterval(showNextImage, 2000); // Call showNextImage every 2 seconds

})(jQuery);
