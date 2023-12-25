// DraftsSocket.ts
import { ISocket } from "../ISocket";
import { ISocketNameSpace } from "../ISocketNamespace";

export interface DraftsObserver {
	onDraftOrderChange(room: string, draftOrder: string[]): void;
	onDraftTimerEven(room: string, timerValue: number): void;
	onDraftTimerOdd(room: string, timerValue: number): void;
  }

export class DraftsSocket {
  private namespace: ISocketNameSpace;
  private timers: Record<string, { value: number; interval: NodeJS.Timeout }> = {}; // Room timers
  private draftObservers: DraftsObserver[] = []; // Observers for draft order

  constructor(namespace: ISocketNameSpace, observers: DraftsObserver[]) {
    this.namespace = namespace;
    this.draftObservers = observers;
  }

  // Notify observers about draft order changes
  private notifyObservers(room: string, draftOrder: string[]): void {
    this.draftObservers.forEach((observer) => {
      observer.onDraftOrderChange(room, draftOrder);
    });
  }

  public setupEventHandlers(): void {
    this.namespace.on("connection", (socket: ISocket) => {
      console.log("User connected to chat namespace");

      socket.on("joinRoom", (room: string) => {
        socket.join(room);

        // If the timer for the room doesn't exist, initialize it
        if (!this.timers[room]) {
          this.timers[room] = {
            value: 60, // Set an initial value, e.g., 60 seconds
            interval: this.startTimer(room), // Start the timer when a user joins
          };
        }

        // Emit the current timer value to the joining user
        socket.emit("timerUpdate", this.timers[room].value);

        // Broadcast to others in the room that a new user joined
        this.namespace.to(room).emit("userJoined", "A user joined the room");

        // Notify observers about draft order (initially, the order is based on joining time)
        const draftOrder = Object.keys(this.namespace.adapter.rooms[room]?.sockets || {});
        this.notifyObservers(room, draftOrder);
      });

      socket.on("sendMessage", (room: string, message: string) => {
        // Handle your message logic here

        // Example: Update the timer and broadcast the new value
        this.updateTimer(room);
        this.namespace.to(room).emit("timerUpdate", this.timers[room].value);

        // Notify observers about draft order changes
        const draftOrder = Object.keys(this.namespace.adapter.rooms[room]?.sockets || {});
        this.notifyObservers(room, draftOrder);
      });
    });
  }

  private startTimer(room: string): NodeJS.Timeout {
    // Start a timer interval for the room
    return setInterval(() => {
      this.updateTimer(room);
      this.namespace.to(room).emit("timerUpdate", this.timers[room].value);
    }, 1000); // Update every second
  }

  private updateTimer(room: string): void {
    // Update the timer logic as needed
    const timerValue = this.timers[room].value;

    if (timerValue > 0) {
      this.timers[room].value -= 1; // Decrease the timer by 1 second
      console.log(`Timer for room ${room}: ${timerValue} seconds`);

      // Notify observers about draft order changes
      const draftOrder = Object.keys(this.namespace.adapter.rooms[room]?.sockets || {});
      this.notifyObservers(room, draftOrder);

      // Check if the timer value is even or odd
      if (timerValue % 2 === 0) {
        // Timer is even, notify Observer 1
        this.draftObservers[0].onDraftTimerEven(room, timerValue);
      } else {
        // Timer is odd, notify Observer 2
        this.draftObservers[1].onDraftTimerOdd(room, timerValue);
      }
    } else {
      // Timer reached 0, you may want to handle this case
      clearInterval(this.timers[room].interval);
      console.log(`Timer for room ${room} reached 0`);
    }
  }
}