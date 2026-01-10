// src/audio/party-music.js
// Lightweight WebAudio loop for派對模式，沒有外部音源也可用

class PartyMusic {
  constructor() {
    this.ctx = null;
    this.gain = null;
    this.oscillators = [];
    this.playing = false;
  }

  ensureContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  start() {
    if (this.playing) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.06;
    this.gain.connect(this.ctx.destination);

    const freqs = [220, 277, 330]; // A, C#, E
    this.oscillators = freqs.map((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? "sawtooth" : "triangle";
      osc.frequency.value = f;
      osc.connect(this.gain);
      osc.start();
      return osc;
    });

    this.playing = true;
  }

  stop() {
    if (!this.playing) return;
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // ignore
      }
    });
    this.oscillators = [];
    if (this.gain) {
      this.gain.disconnect();
      this.gain = null;
    }
    this.playing = false;
  }

  toggle() {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }
}

export const partyMusic = new PartyMusic();
