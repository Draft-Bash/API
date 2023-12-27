// DraftObserverBase.ts
import { ISocket } from "../ISocket";
import { DraftsSocket } from "./DraftsSocket";

export abstract class DraftObserverBase {

  private socket: ISocket | undefined;
  private room: string | undefined;
  private draftsSocket: DraftsSocket | undefined;

  public getSocket(): ISocket | undefined {
    return this.socket;
  }

  public setSocket(socket: ISocket): void {
    this.socket = socket;
  }

  public getRoom(): string | undefined {
    return this.room;
  }

  public setRoom(room: string): void {
    this.room = room;
  }

  public setDraftsSocket(draftsSocket: DraftsSocket): void {
    this.draftsSocket = draftsSocket;
  }

  // Method to notify other observers
  protected notifyObservers(turn: number, room: string): void {
    if (this.draftsSocket) {
      this.draftsSocket.notifyObservers(turn, room);
    }
  }

  abstract update(turn: number, room: string): void;
}