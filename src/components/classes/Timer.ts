export default class CountdownTimer {
    private duration: number; // in seconds
	private remainingTime: number; // in seconds
    private intervalId: NodeJS.Timeout | null = null;

    constructor(minutes: number, seconds: number, private onUpdate: (time: string, progress: number) => void, private onComplete?: () => void) {
		this.duration = minutes * 60 + seconds;
		this.remainingTime = this.duration;
    }

    private formatTime(): string {
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    public isRunning(): boolean {
        return Boolean(this.intervalId);
    }

    start() {
      if (this.intervalId) return; // Prevent multiple intervals

	  const progress = this.remainingTime / this.duration;
      this.onUpdate(this.formatTime(), progress);

      this.intervalId = setInterval(() => {
        if (this.remainingTime <= 0) {
          this.stop();
          if (this.onComplete) this.onComplete();
        } else {
          this.remainingTime -= 1;
		  const progress = this.remainingTime / this.duration; // Calculate progress
		  this.onUpdate(this.formatTime(), progress); // Update time and progress
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
	  this.remainingTime = this.duration;
      this.onUpdate(this.formatTime(), 1);
    }
}
