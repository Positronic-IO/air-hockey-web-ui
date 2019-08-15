import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SocketService } from './services/socket.service';
import { ConfigService } from './services/config.service';

const config: SocketIoConfig = { url: ConfigService.apiUrl, options: {} };

@NgModule({
  imports: [
    BrowserAnimationsModule,
    HttpModule,
    RouterModule,
    AppRoutingModule,
    CommonModule,
    MatButtonModule,
    SocketIoModule.forRoot(config)
  ],
  declarations: [
    AppComponent,
    GameComponent,
    SidebarComponent
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
