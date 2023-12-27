// DraftsSocket.ts
import { ISocket } from "../ISocket";
import { ISocketNameSpace } from "../ISocketNamespace";
import { DraftObserverBase } from "./DraftObserverBase";

export class DraftsSocket {

  private _namespace: ISocketNameSpace;
  private _observers: DraftObserverBase[] = [];

  constructor(namespace: ISocketNameSpace) {
    this._namespace = namespace;
  }

  public addObserver(observer: DraftObserverBase): void {
    this._observers.push(observer);
    observer.setDraftsSocket(this);
  }

  public setupEventHandlers(): void {
    this._namespace.on("connection", (socket: ISocket) => {
      console.log("User connected to chat namespace");
  
      socket.on("joinRoom", (room: string) => {
        socket.join(room);
  
        this._observers.forEach((observer) => {
          observer.setRoom(room);
          observer.setSocket(socket);
        });
  
        this.notifyObservers(1, room);

        socket.on("disconnect", () => {
          this._observers = [];
        });
      });
    });
  }

  // Method to notify observers
  public notifyObservers(turn: number, room: string): void {
    this._observers.forEach((observer) => {
      observer.update(turn, room);
    });
  }
}