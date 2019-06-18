import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { Disc } from '../shared/models/disc.model';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import * as socketIo from 'socket.io-client';

const SERVER_URL = 'http://localhost:5001';

export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @HostListener('mousemove', ['$event'])
  handleMouseEvent(event) {
    // tell the browser we're handling this mouse event
    event.preventDefault();
    event.stopPropagation();

    let x = Math.floor((event.clientX - this.boardOffsetX) * this.scaleX);
    let y = event.clientY - this.boardOffsetY;

    if (this.humanPlay) {
      this.moveOpponent(x, y)
    }
  }

  public canvas: ElementRef<HTMLCanvasElement>;

  public puck: Disc = new Disc();
  public controller: Disc = new Disc();
  public controllerTwo: Disc = new Disc();
  public boardWidth: number;
  public boardHeight: number;
  public board: any;
  public socket: any;
  public boardContext: any;
  public robotScore: number;
  public opponentScore: number;
  public humanPlay: boolean;
  public boardOffsetX: number;
  public boardOffsetY: number;
  public scaleX: number;
  public scaleY: number;


  ngOnInit() {

    this.board = <HTMLCanvasElement>document.getElementById("canvas");
    this.boardContext = this.board.getContext('2d');

    // board
    this.boardWidth = 900;
    this.boardHeight = 480;
    const boardCenterX = Math.round(this.boardWidth / 2);
    const boardCenterY = Math.round(this.boardHeight / 2);

    var boardBound = this.board.getBoundingClientRect();
    this.boardOffsetX = boardBound.left;
    this.boardOffsetY = boardBound.top;

    this.scaleX = this.boardWidth / boardBound.width,    // relationship bitmap vs. element for X
      this.scaleY = this.boardWidth / boardBound.height;

    // Set width & height for canvas
    this.board.width = this.boardWidth;
    this.board.height = this.boardHeight;

    // Puck
    this.puck.startingPosX = boardCenterX;
    this.puck.startingPosY = boardCenterY;
    this.puck.x = this.puck.startingPosX;
    this.puck.y = this.puck.startingPosY;
    this.puck.radius = 15;
    this.puck.color = '#000000';

    // Add controller & adjust settings
    this.controller.color = '#2132CC';
    this.controller.radius = 20;
    this.controller.startingPosX = 125;
    this.controller.startingPosY = this.puck.startingPosY;
    this.controller.x = this.controller.startingPosX;
    this.controller.y = this.controller.startingPosY

    // Add controller two
    this.controllerTwo.color = '#2132CC';
    this.controllerTwo.radius = 20;
    this.controllerTwo.startingPosX = (this.boardWidth - 155);
    this.controllerTwo.startingPosY = this.puck.startingPosY;
    this.controllerTwo.x = this.controllerTwo.startingPosX;
    this.controllerTwo.y = this.controllerTwo.startingPosY

    // Init scores
    this.robotScore = 0;
    this.opponentScore = 0;

    this.humanPlay = true;

    this.onLoad();

    this.updateGame();

  }

  initSocket(): void {
    this.socket = socketIo(SERVER_URL, {
      transports: ['websocket']
    });
  }

  onMessage(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('state-change', (data: any) => observer.next(data));
    });
  }

  onEvent(event: any): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on(event, () => observer.next());
    })
  };

  onLoad(): void {
    // Load things
    this.initSocket();
    this.onEvent("connect")
      .subscribe(() => {
        console.log('Websockets enabled.');
      });


    // Set focus to canvas so keyboard events work
    this.board.focus()
  };

  humanToggle() {
    this.humanPlay = !this.humanPlay;
  }

  clearCanvas(): void {
    this.boardContext.clearRect(0, 0, this.boardWidth, this.boardHeight);

  };

  draw(obj: Disc): void {
    // this.boardContext.shadowColor = 'rgba(50, 50, 50, 0.25)';
    // this.boardContext.shadowOffsetX = 0;
    // this.boardContext.shadowOffsetY = 3;
    // boardContext.shadowBlur = 6;

    this.boardContext.beginPath();
    this.boardContext.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI, false);
    this.boardContext.fillStyle = obj.color;
    this.boardContext.fill();
  };

  // Run game functions
  updateGame() {

    this.clearCanvas()

    // Collect Scores
    this.socket.on("scores-change", (msg: any) => {
      this.robotScore = msg.robot_score;
      this.opponentScore = msg.opponent_score;
    });

    // Draw & contain puck
    this.socket.on("state-change", (msg: any) => {
      this.puck.x = msg.puck[0];
      this.puck.y = msg.puck[1];
      this.controller.x = msg.robot[0];
      this.controller.y = msg.robot[1];

      if (!this.humanPlay) {
        this.controllerTwo.x = msg.opponent[0];
        this.controllerTwo.y = msg.opponent[1];
      }

    });

    this.draw(this.puck);
    this.draw(this.controller);
    this.draw(this.controllerTwo);

    // Loop
    requestAnimationFrame(this.updateGame.bind(this));

  };

  // Mouse events
  moveOpponent(x: number, y: number) {
    this.controllerTwo.x = x;
    this.controllerTwo.y = y;
    this.draw(this.controllerTwo);
    this.setOpponentStatePosition()
  }

  setOpponentStatePosition() {
    let ENDPOINT = SERVER_URL + '/api/opponent-move';
    fetch(ENDPOINT,
      {
        body: JSON.stringify({
          x: this.controllerTwo.x,
          y: this.controllerTwo.y
        }),
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST',

      })
      .then(response => response.json());
  }

};

