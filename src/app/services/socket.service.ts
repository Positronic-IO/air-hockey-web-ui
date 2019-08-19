import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';

@Injectable()
export class SocketService {
    $events = this.socket.fromEvent<any>('event');
    $scores = this.socket.fromEvent<any>('scores');
    $state = this.socket.fromEvent<any>('state');
    
    constructor(private socket: Socket) {
    }

}
