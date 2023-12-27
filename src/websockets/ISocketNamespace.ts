export interface ISocketNameSpace  {
    on(event: string, listener: (...args: any[]) => void): void;
    to(room: string): ISocketNameSpace;
    emit(event: string, ...args: any[]): void;
}