export default class CountdownTimer {
    private duration: number; // in seconds
    private intervalId: NodeJS.Timeout | null = null;

    constructor(minutes: number, seconds: number, private onUpdate: (time: string) => void, private onComplete?: () => void) {
      this.duration = minutes * 60 + seconds;
    }

    private formatTime(): string {
      const minutes = Math.floor(this.duration / 60);
      const seconds = this.duration % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    start() {
      if (this.intervalId) return; // Prevent multiple intervals

      this.onUpdate(this.formatTime());
      this.intervalId = setInterval(() => {
        if (this.duration <= 0) {
          this.stop();
          if (this.onComplete) this.onComplete();
        } else {
          this.duration -= 1;
          this.onUpdate(this.formatTime());
        }
      }, 1000);
    }

    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    reset(minutes: number, seconds: number) {
      this.stop();
      this.duration = minutes * 60 + seconds;
      this.onUpdate(this.formatTime());
    }
}
