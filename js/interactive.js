/**
 * ==========================================================================
 * PANDU'S BIRTHDAY - INTERACTIVE UI LOGIC & CELEBRATION SCRIPTS
 * Cake blow candles, lyric synchronization, love letter, photo lightbox,
 * custom picture uploader, and grand finale fireworks.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const curtainOverlay = document.getElementById('curtain-overlay');
  const btnOpenExperience = document.getElementById('btn-open-experience');
  const btnWand = document.getElementById('btn-wand');
  const playHeroBtn = document.getElementById('play-hero-btn');
  const playWidgetBtn = document.getElementById('play-widget-btn');
  const btnReplayVerse = document.getElementById('btn-replay-verse');
  const floatingWidget = document.getElementById('floating-widget');

  // 1. SURPRISE CURTAIN ENTRANCE
  if (btnOpenExperience && curtainOverlay) {
    btnOpenExperience.addEventListener('click', () => {
      curtainOverlay.classList.add('fade-out');
      
      // Start Music
      if (window.romanticAudio) {
        window.romanticAudio.play();
      }

      // Grand celebration burst
      if (window.festiveEngine) {
        window.festiveEngine.triggerGrandFinale(4000);
      }
    });
  }

  // 2. AUDIO PLAYBACK CONTROLS
  if (playHeroBtn) {
    playHeroBtn.addEventListener('click', () => {
      if (window.romanticAudio) window.romanticAudio.togglePlay();
    });
  }

  if (playWidgetBtn) {
    playWidgetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.romanticAudio) window.romanticAudio.togglePlay();
    });
  }

  if (floatingWidget) {
    floatingWidget.addEventListener('click', () => {
      if (window.romanticAudio) window.romanticAudio.togglePlay();
    });
  }

  if (btnReplayVerse) {
    btnReplayVerse.addEventListener('click', () => {
      if (window.romanticAudio) {
        window.romanticAudio.replayVerse();
        if (window.festiveEngine) {
          window.festiveEngine.triggerGrandFinale(2500);
        }
      }
    });
  }

  // 3. SPARKLER WAND TOGGLE
  if (btnWand) {
    let wandActive = true;
    btnWand.addEventListener('click', () => {
      wandActive = !wandActive;
      btnWand.classList.toggle('active', wandActive);
      btnWand.innerHTML = wandActive ? '✨ Wand: ON' : '🪄 Wand: OFF';
      if (window.festiveEngine) {
        window.festiveEngine.setWandActive(wandActive);
      }
    });
  }

  // 4. LYRIC HIGHLIGHTER & LANGUAGE TOGGLE
  const lyricLines = document.querySelectorAll('.lyric-line');
  const langBtns = document.querySelectorAll('.lang-btn');

  const lyricsData = {
    hinglish: [
      { text: "Hmm Sadiyon Se Bhi Lambi Yeh", sub: "Longer than centuries..." },
      { text: "Mann Ki Amavasein Hain", sub: "Are these dark, moonless nights of the heart..." },
      { text: "Aur Tu Phuljhadiyon Wale Tyoharon Jaisi ✨", sub: "And you are just like festivals bursting with golden sparklers!" },
      { text: "Chanda Bhi Deewana Hai Tera 🌙", sub: "Even the moon is madly captivated by you..." },
      { text: "Jalti Hai Tujhse Saari Chhakoriyan 💖", sub: "All the chakori maidens burn with envy of your beauty!" }
    ],
    hindi: [
      { text: "हूँ सदियों से भी लम्बी ये", sub: "सदियों से भी लम्बी..." },
      { text: "मन की अमावसें हैं", sub: "मन की गहरी अमावसें..." },
      { text: "और तू फुलझड़ियों वाले त्योहारों जैसी ✨", sub: "रोशनी और पटाखों से भरपूर त्योहार जैसी!" },
      { text: "चंदा भी दीवाना है तेरा 🌙", sub: "चाँद भी तेरी खूबसूरती का कायल है..." },
      { text: "जलती है तुझसे सारी चकोरियां 💖", sub: "तुझसे जलती हैं सारी चकोरियां..." }
    ]
  };

  let currentLang = 'hinglish';

  function updateLyricsContent(lang) {
    currentLang = lang;
    const data = lyricsData[lang] || lyricsData.hinglish;
    lyricLines.forEach((el, index) => {
      if (data[index]) {
        const textSpan = el.querySelector('.main-lyric-text');
        const transSpan = el.querySelector('.translation');
        if (textSpan) textSpan.textContent = data[index].text;
        if (transSpan) transSpan.textContent = data[index].sub;
      }
    });
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      updateLyricsContent(lang);
    });
  });

  // Clicking on any lyric line triggers sparklers & highlights it
  lyricLines.forEach((line, index) => {
    line.addEventListener('click', () => {
      lyricLines.forEach(l => l.classList.remove('active'));
      line.classList.add('active');

      const rect = line.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;

      if (window.festiveEngine) {
        window.festiveEngine.explodeAt(clickX, clickY, index === 2 ? 'gold' : 'festive');
        window.festiveEngine.emitSparklerAt(clickX, clickY, 35);
      }
    });
  });

  // Real-time lyric progress synchronizer
  if (window.romanticAudio) {
    window.romanticAudio.onTimeUpdate((currentTime) => {
      const relTime = currentTime - 112; // Relative to verse start
      let activeIndex = 0;
      if (relTime < 3.5) activeIndex = 0;
      else if (relTime < 7) activeIndex = 1;
      else if (relTime < 13) activeIndex = 2; // "Aur tu phuljhadiyon..."
      else if (relTime < 18) activeIndex = 3; // "Chanda bhi deewana..."
      else activeIndex = 4; // "Jalti hai tujhse..."

      lyricLines.forEach((line, idx) => {
        if (idx === activeIndex) {
          if (!line.classList.contains('active')) {
            line.classList.add('active');
            // When reaching Phuljhadi line, burst gold sparklers!
            if (idx === 2 && window.festiveEngine) {
              window.festiveEngine.launchFirework(null, null, 'peony');
              window.festiveEngine.emitSparklerAt(window.innerWidth * 0.5, window.innerHeight * 0.35, 45);
            }
          }
        } else {
          line.classList.remove('active');
        }
      });
    });
  }

  // 5. CAKE BLOW CANDLES MINI-GAME
  const candles = document.querySelectorAll('.candle');
  const btnBlow = document.getElementById('btn-blow-candles');
  const wishUnlockedCard = document.getElementById('wish-unlocked-card');
  let blownCount = 0;

  function extinguishCandle(candle) {
    if (!candle.classList.contains('blown')) {
      candle.classList.add('blown');
      blownCount++;

      const rect = candle.getBoundingClientRect();
      if (window.festiveEngine) {
        window.festiveEngine.emitSparklerAt(rect.left + 7, rect.top, 25);
      }

      checkAllCandlesBlown();
    }
  }

  candles.forEach(candle => {
    candle.addEventListener('click', () => extinguishCandle(candle));
  });

  function checkAllCandlesBlown() {
    if (blownCount >= candles.length) {
      if (wishUnlockedCard) {
        wishUnlockedCard.style.display = 'block';
      }
      if (btnBlow) {
        btnBlow.innerHTML = '🎉 Wish Made & Granted!';
        btnBlow.disabled = true;
      }
      if (window.festiveEngine) {
        window.festiveEngine.triggerGrandFinale(5000);
      }
    }
  }

  if (btnBlow) {
    btnBlow.addEventListener('click', () => {
      candles.forEach(c => extinguishCandle(c));
    });
  }

  // 6. LOVE LETTER MODAL
  const envelopeCard = document.getElementById('envelope-card');
  const letterModal = document.getElementById('letter-modal');
  const closeModalBtn = document.getElementById('close-letter-modal');
  const letterBody = document.getElementById('letter-body-content');
  const btnEditLetter = document.getElementById('btn-edit-letter');

  const defaultLetter = `My Dearest Pandu,

From the very first day you entered my life, you turned every ordinary moment into a celebration filled with laughter and warmth.

Just like the song says:
"Sadiyon se bhi lambi yeh mann ki amavasein hain...
Aur tu phuljhadiyon wale tyoharon jaisi."

You are my brightest light, my constant smile, and my favorite reason to celebrate every single day. The world feels infinitely more magical, vibrant, and beautiful just because you are in it.

On this special day, I wish you endless happiness, boundless dreams that come true, and a year sparkling with as much sweetness, love, and wonder as you bring to everyone around you.

Happy Birthday, Pandu! You mean the absolute world to me. ❤️✨`;

  // Load saved letter if any
  const savedLetter = localStorage.getItem('pandu_love_letter');
  if (letterBody) {
    letterBody.textContent = savedLetter || defaultLetter;
  }

  if (envelopeCard && letterModal) {
    envelopeCard.addEventListener('click', () => {
      letterModal.classList.add('open');
      if (window.festiveEngine) {
        window.festiveEngine.emitSparklerAt(window.innerWidth * 0.5, window.innerHeight * 0.5, 30);
      }
    });
  }

  if (closeModalBtn && letterModal) {
    closeModalBtn.addEventListener('click', () => {
      letterModal.classList.remove('open');
    });
  }

  if (letterModal) {
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) letterModal.classList.remove('open');
    });
  }

  if (btnEditLetter && letterBody) {
    let isEditing = false;
    btnEditLetter.addEventListener('click', () => {
      if (!isEditing) {
        letterBody.contentEditable = "true";
        letterBody.focus();
        btnEditLetter.textContent = "💾 Save Letter";
        isEditing = true;
      } else {
        letterBody.contentEditable = "false";
        localStorage.setItem('pandu_love_letter', letterBody.textContent);
        btnEditLetter.textContent = "✏️ Edit Letter";
        isEditing = false;
        alert("Your letter for Pandu has been saved! 💖");
      }
    });
  }

  // 7. POLAROID LIGHTBOX
  const polaroids = document.querySelectorAll('.polaroid-card');
  const lightboxOverlay = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCap = document.getElementById('lightbox-caption');

  polaroids.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const cap = card.querySelector('.polaroid-caption');
      if (lightboxOverlay && lightboxImg && img) {
        lightboxImg.src = img.src;
        if (lightboxCap && cap) lightboxCap.textContent = cap.textContent;
        lightboxOverlay.classList.add('open');
      }
    });
  });

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', () => {
      lightboxOverlay.classList.remove('open');
    });
  }

  // 8. USER REAL PHOTO UPLOADER (Instantly replaces polaroids)
  const userPhotoPicker = document.getElementById('user-photo-picker');
  const photoUploadBanner = document.getElementById('photo-upload-banner');

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

      alert(`Uploaded ${files.length} photo(s) to Pandu's Memory Gallery! ✨`);
      if (window.festiveEngine) {
        window.festiveEngine.triggerGrandFinale(2000);
      }
    });
  }

  // 9. CLICKABLE WISH LANTERNS
  const wishCards = document.querySelectorAll('.wish-lantern-card');
  wishCards.forEach(card => {
    card.addEventListener('click', () => {
      const rect = card.getBoundingClientRect();
      if (window.festiveEngine) {
        window.festiveEngine.explodeAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 'festive');
        window.festiveEngine.emitSparklerAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
      }
    });
  });
});
