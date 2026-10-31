/**
 * ==========================================================================
 * PANDU'S BIRTHDAY - LIGHTWEIGHT AUDIO & GALLERY SCRIPT
 * Uses the user's manual song from assets/song.mp3 with autoplay & controls
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Use the manual song added in assets/song.mp3
  const audio = new Audio('assets/song.mp3');
  audio.preload = 'auto';
  audio.loop = true;

  let isPlaying = false;
  const navPlayBtn = document.getElementById('nav-play-btn');

  function playSong() {
    const promise = audio.play();
    if (promise !== undefined) {
      promise.then(() => {
        setPlaybackState(true);
      }).catch(err => {
        console.log('Autoplay deferred until user interaction', err);
        setPlaybackState(false);
      });
    }
  }

  function pauseSong() {
    audio.pause();
    setPlaybackState(false);
  }

  function togglePlay() {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }

  function setPlaybackState(playing) {
    isPlaying = playing;
    if (navPlayBtn) {
      navPlayBtn.innerHTML = playing ? '⏸ Pause Song' : '▶ Play Song';
      if (playing) navPlayBtn.classList.add('playing');
      else navPlayBtn.classList.remove('playing');
    }
  }

  // Attempt autoplay immediately
  playSong();

  // If browser blocks unmuted audio before user interaction,
  // trigger on the very first touch/click/scroll anywhere on the page
  const unlockAudioOnInteraction = () => {
    if (!isPlaying) {
      playSong();
    }
  };

  ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, unlockAudioOnInteraction, { once: true, passive: true });
  });

  if (navPlayBtn) navPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // --- POLAROID LIGHTBOX & IMAGE UPLOADER ---
  const polaroids = document.querySelectorAll('.polaroid-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  polaroids.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const caption = card.querySelector('.polaroid-caption');
      if (lightboxModal && lightboxImg && img) {
        lightboxImg.src = img.src;
        if (lightboxCaption && caption) lightboxCaption.textContent = caption.textContent;
        lightboxModal.classList.add('open');
      }
    });
  });

  if (lightboxModal) {
    lightboxModal.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
    });
  }

  // Upload real custom images
  const photoUploadBanner = document.getElementById('photo-upload-banner');
  const userPhotoPicker = document.getElementById('user-photo-picker');

  if (photoUploadBanner && userPhotoPicker) {
    photoUploadBanner.addEventListener('click', () => {
      userPhotoPicker.click();
    });

    userPhotoPicker.addEventListener('change', (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const polaroidImages = document.querySelectorAll('.polaroid-image-frame img');
      Array.from(files).forEach((file, idx) => {
        if (idx < polaroidImages.length) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            polaroidImages[idx].src = loadEvent.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
      alert(`Added ${files.length} custom photo(s) to Pandu's gallery! ✨`);
    });
  }
});
