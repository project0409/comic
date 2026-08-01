import { Howl, Howler } from "howler";

type Track = { url: string; mood?: string };

class AudioEngine {
  private current?: Howl;
  private currentUrl?: string;
  private volume = 0.85;
  private muted = false;

  setMuted(m: boolean) {
    this.muted = m;
    Howler.mute(m);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.current?.volume(this.volume);
  }

  async crossfadeTo(track?: Track) {
    if (!track?.url) {
      this.current?.fade(this.current.volume(), 0, 240);
      setTimeout(() => this.current?.unload(), 260);
      this.current = undefined;
      this.currentUrl = undefined;
      return;
    }
    if (this.currentUrl === track.url) return;

    const next = new Howl({
      src: [track.url],
      loop: true,
      volume: 0
    });

    next.play();
    next.fade(0, this.volume, 450);

    const prev = this.current;
    prev?.fade(prev.volume(), 0, 450);
    setTimeout(() => prev?.unload(), 520);

    this.current = next;
    this.currentUrl = track.url;
  }
}

export const audioEngine = new AudioEngine();
