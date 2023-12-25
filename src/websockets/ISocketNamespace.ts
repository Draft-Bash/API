export interface ISocketNameSpace  {
	adapter: any;
    on(event: string, listener: (...args: any[]) => void): void;
    to(room: string): ISocketNameSpace;
    emit(event: string, ...args: any[]): void;
}