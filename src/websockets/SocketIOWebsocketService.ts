import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ISocketService } from "./ISocketService";
import { ISocketNameSpace } from "./ISocketNamespace";

export class SocketIOSocketService implements ISocketService {

    private readonly _io: SocketIOServer;

    constructor(httpServer: HttpServer) {
        this._io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["Authorization", "Content-Type"],
                credentials: true,
            },
        });
    }
    
    createNamespace(namespace: string): ISocketNameSpace {
        const socketIONamespace: ISocketNameSpace = this._io.of(namespace) as unknown as ISocketNameSpace;
        return socketIONamespace
    }
}