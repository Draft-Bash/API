import { Server as HttpServer  } from "http";
import { ISocketNameSpace } from "./ISocketNamespace";

export interface ISocketService {
    createNamespace(namespace: string): ISocketNameSpace;
}