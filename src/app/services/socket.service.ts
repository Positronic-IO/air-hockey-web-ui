import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Socket } from 'ngx-socket-io';
import { merge } from 'rxjs';
import { element } from 'protractor';

@Injectable()
export class SocketService {
    $events = this.socket.fromEvent<any>('event');
    $scores = this.socket.fromEvent<any>('scores');
    $state = this.socket.fromEvent<any>('state');
    $save = this.socket.fromEvent<any>('save');
    
    constructor(private socket: Socket) {
    }

}
