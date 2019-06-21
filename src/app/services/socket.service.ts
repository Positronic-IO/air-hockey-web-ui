import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

import * as socketIo from 'socket.io-client';

@Injectable()
export class SocketService {
    private socket;

    public initSocket(): void {
        this.socket = socketIo(environment.socketURL);
    }

    public send(message: any): void {
        this.socket.emit('message', message);
    }

    public onMessage(channel: string): Observable<any> {
        return new Observable<any>(observer => {
            this.socket.on(channel, (data: any) => observer.next(data));
        });
    }

    public onEvent(event: any): Observable<any> {
        return new Observable<any>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
}
