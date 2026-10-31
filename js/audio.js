/**
 * ==========================================================================
 * PANDU'S BIRTHDAY - AUDIO SYSTEM (KESARIYA BACKGROUND & LYRIC SYNC)
 * Supports YouTube IFrame API (starting at 1:52 / 112s), local MP3 upload,
 * and a soothing Web Audio API synthesized romantic melody fallback.
 * ==========================================================================
 */

class RomanticAudioManager {
  constructor() {
    this.ytPlayer = null;
    this.ytPlayerReady = false;
    this.audioElement = new Audio();
    this.audioSourceType = 'youtube'; // 'youtube', 'local', 'synth'
    this.isPlaying = false;
    this.isMuted = false;
    this.verseStartTime = 112; // 1:52 in seconds

    // Web Audio Synthesizer Fallback
    this.audioCtx = null;
    this.synthInterval = null;

    // Callbacks
    this.onStateChangeCallbacks = [];
    this.onTimeUpdateCallbacks = [];

    this.init();
  }

  init() {
    this.setupYouTubeAPI();
    this.setupLocalAudio();
    this.setupCustomAudioUpload();
    this.startTimeTracker();
  }

  setupYouTubeAPI() {
    // If YouTube IFrame API is already loaded
    if (window.YT && window.YT.Player) {
      this.createYTPlayer();
    } else {
      // Load the IFrame Player API code asynchronously
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.createYTPlayer();
      };
    }
  }

  createYTPlayer() {
    try {
      this.ytPlayer = new window.YT.Player('yt-player-container', {
        height: '1',
        width: '1',
        videoId: 'BddP6PYo2gs',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          start: this.verseStartTime,
          loop: 1
        },
        events: {
          onReady: (event) => {
            this.ytPlayerReady = true;
            this.ytPlayer.setVolume(85);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              this.setPlayingState(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              this.setPlayingState(false);
            }
          },
          onError: () => {
            // If YouTube is blocked or fails, seamlessly fall back to synth
            console.log('YouTube blocked/offline, using synthesized ambient melody');
            this.audioSourceType = 'synth';
          }
        }
      });
    } catch (e) {
      console.warn('YouTube init failed, fallback available', e);
    }
  }

  setupLocalAudio() {
    // Check if user has placed assets/song.mp3
    this.audioElement.src = 'assets/song.mp3';
    this.audioElement.loop = true;
    this.audioElement.addEventListener('playing', () => this.setPlayingState(true));
    this.audioElement.addEventListener('pause', () => this.setPlayingState(false));
    this.audioElement.addEventListener('ended', () => this.setPlayingState(false));
  }

  setupCustomAudioUpload() {
    const uploadInput = document.getElementById('custom-audio-input');
    if (!uploadInput) return;

    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileURL = URL.createObjectURL(file);
        this.pause();
        this.audioElement.src = fileURL;
        this.audioSourceType = 'local';
        this.audioElement.currentTime = 0;
        this.play();
        
        const label = document.querySelector('.custom-file-label');
        if (label) {
          label.textContent = `Playing: ${file.name.substring(0, 18)}...`;
        }
      }
    });
  }

  play() {
    if (this.audioSourceType === 'local') {
      this.audioElement.play().catch(e => console.log('Audio autoplay prevented', e));
      this.setPlayingState(true);
    } else if (this.audioSourceType === 'youtube' && this.ytPlayer && this.ytPlayerReady) {
      try {
        this.ytPlayer.seekTo(this.verseStartTime, true);
        this.ytPlayer.playVideo();
        this.setPlayingState(true);
      } catch (e) {
        this.playSynthMelody();
      }
    } else {
      // Fallback Synth Melody
      this.playSynthMelody();
    }
  }

  pause() {
    if (this.audioSourceType === 'local') {
      this.audioElement.pause();
    } else if (this.ytPlayer && this.ytPlayerReady) {
      try {
        this.ytPlayer.pauseVideo();
      } catch (e) {}
    }
    this.stopSynthMelody();
    this.setPlayingState(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  replayVerse() {
    if (this.audioSourceType === 'youtube' && this.ytPlayer && this.ytPlayerReady) {
      this.ytPlayer.seekTo(this.verseStartTime, true);
      this.ytPlayer.playVideo();
    } else if (this.audioSourceType === 'local') {
      this.audioElement.currentTime = 0;
      this.audioElement.play();
    } else {
      this.playSynthMelody();
    }
    this.setPlayingState(true);
  }

  setPlayingState(playing) {
    this.isPlaying = playing;
    this.updateUI();
    for (const cb of this.onStateChangeCallbacks) {
      cb(playing);
    }
  }

  updateUI() {
    const playHeroBtn = document.getElementById('play-hero-btn');
    const playWidgetBtn = document.getElementById('play-widget-btn');
    const discIcon = document.querySelector('.disc-icon');
    const visualizer = document.querySelector('.audio-visualizer-bars');

    const iconHtml = this.isPlaying 
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' 
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

    if (playHeroBtn) playHeroBtn.innerHTML = iconHtml;
    if (playWidgetBtn) playWidgetBtn.innerHTML = iconHtml;

    if (discIcon) {
      if (this.isPlaying) discIcon.classList.remove('paused');
      else discIcon.classList.add('paused');
    }

    if (visualizer) {
      if (this.isPlaying) visualizer.classList.add('playing');
      else visualizer.classList.remove('playing');
    }
  }

  /**
   * Soothing Web Audio Synthesizer (Ambient romantic arpeggio)
   */
  playSynthMelody() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.audioSourceType = 'synth';
      this.setPlayingState(true);

      const notes = [
        261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99 // C Major romantic scale
      ];
      let step = 0;

      if (this.synthInterval) clearInterval(this.synthInterval);

      this.synthInterval = setInterval(() => {
        if (!this.isPlaying) return;
        const freq = notes[step % notes.length];
        this.playChimeNote(freq);
        step = (step + 1) % notes.length;
      }, 550);

    } catch (e) {
      console.warn('Web Audio synth not supported', e);
    }
  }

  playChimeNote(frequency) {
    if (!this.audioCtx || !this.isPlaying) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 1.25);
  }

  stopSynthMelody() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  /**
   * Track playback time for synchronizing lyrics progression
   */
  startTimeTracker() {
    let internalOffset = 0;
    setInterval(() => {
      if (!this.isPlaying) return;

      let currentTime = 0;
      if (this.audioSourceType === 'youtube' && this.ytPlayer && this.ytPlayerReady && typeof this.ytPlayer.getCurrentTime === 'function') {
        currentTime = this.ytPlayer.getCurrentTime();
      } else if (this.audioSourceType === 'local') {
        currentTime = this.audioElement.currentTime + this.verseStartTime;
      } else {
        internalOffset += 0.5;
        currentTime = this.verseStartTime + (internalOffset % 30);
      }

      for (const cb of this.onTimeUpdateCallbacks) {
        cb(currentTime);
      }
    }, 450);
  }

  onTimeUpdate(callback) {
    this.onTimeUpdateCallbacks.push(callback);
  }
}

// Global Audio Instance
let romanticAudio = null;
window.addEventListener('DOMContentLoaded', () => {
  romanticAudio = new RomanticAudioManager();
  window.romanticAudio = romanticAudio;
});
