export interface ISocket {
    join(room: string): void;
    emit(event: string, ...args: any[]): void;
    on(event: string, listener: (...args: any[]) => void): void;
  }