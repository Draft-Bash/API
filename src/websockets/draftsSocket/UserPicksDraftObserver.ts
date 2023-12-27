// UserPicksDraftObserver.ts
import { DraftObserverBase } from "./DraftObserverBase";
import { ISocket } from "../ISocket";

export class UserPicksDraftObserver extends DraftObserverBase {
  private timer: number = 30;
  private timerInterval: NodeJS.Timeout | null = null;

  update(turn: number, room: string): void {
    console.log(`Hello ${room}, Timer: ${this.timer} seconds`);

    // Access the socket and emit events to the client
    const socket = this.getSocket();
    if (socket) {
      // Emit the updated timer state to the client
      socket.emit("timer", this.timer);
    }

    // Automatically start the timer when the update method is called
    this.startTimer();
  }

  // Method to start the timer
  private startTimer(): void {
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        // Decrement the timer duration
        this.timer--;

        // Log the time as it ticks down
        console.log(`Timer ticking down: ${this.timer} seconds`);

        // Emit timer event to the client
        const socket = this.getSocket();
        if (socket) {
          socket.emit("timer", this.timer);
        }

        // Stop the timer when it reaches 0
        if (this.timer <= 0) {
          this.resetTimer();
        }
      }, 1000); // Interval set to 1 second
    }
  }

  // Method to reset the timer
  private resetTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.timer = 30; // Reset the timer duration
    }
  }
}