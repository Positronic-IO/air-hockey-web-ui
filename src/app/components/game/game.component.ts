import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { Disc } from '../../models/disc.model';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [SocketService]
})
export class GameComponent implements OnInit {

  constructor(private _socket: SocketService) { }

  canvas: ElementRef<HTMLCanvasElement>;
  puck: Disc = new Disc();
  controller: Disc = new Disc();
  controllerTwo: Disc = new Disc();
  boardWidth: number;
  boardHeight: number;
  board: any;
  boardContext: any;
  robotScore: number;
  opponentScore: number;
  humanPlay: boolean;
  boardOffsetX: number;
  boardOffsetY: number;
  scaleX: number;
  scaleY: number;
  robotCheckpoint: number;
  opponentCheckpoint: number;
  init: boolean;
  robotCumulativeScore: number = 0;
  opponentCumulativeScore: number = 0;


  @HostListener('mousemove', ['$event'])
  handleMouseEvent(event) {
    // Tell the browser we're handling this mouse event
    event.preventDefault();
    event.stopPropagation();

    const x = Math.floor((event.clientX - this.boardOffsetX) * this.scaleX);
    const y = Math.floor((event.clientY - this.boardOffsetY) * this.scaleY);

    if (this.humanPlay) {
      this.moveOpponent(x, y)
    }
  }

  ngOnInit() {

    // Board
    this.board = <HTMLCanvasElement>document.getElementById("canvas");
    this.boardContext = this.board.getContext('2d');

    this.boardWidth = 900;
    this.boardHeight = 480;
    const boardCenterX = Math.round(this.boardWidth / 2);
    const boardCenterY = Math.round(this.boardHeight / 2);

    const boardBound = this.board.getBoundingClientRect();
    this.boardOffsetX = boardBound.left;
    this.boardOffsetY = boardBound.top;

    this.scaleX = this.boardWidth / boardBound.width;    // relationship bitmap vs. element for X
    this.scaleY = this.boardHeight / boardBound.height;

    // Set width & height for canvas
    this.board.width = this.boardWidth;
    this.board.height = this.boardHeight;

    // Set focus to canvas so keyboard events work
    this.board.focus();

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

    // Init
    this.robotScore = 0;
    this.opponentScore = 0;
    this.init = true;

    // Default mode
    this.humanPlay = false;

    // Start socket subscriptions
    this.subscribeSocket();

    // Game loop
    this.updateGame();
  }

  subscribeSocket(): void {
    // Collect Scores
    this._socket.$scores.subscribe((msg: any) => {
      let prevRobotScore = this.robotScore;
      let prevOpponentScore = this.opponentScore;

      this.robotScore = msg.robot_score;
      this.opponentScore = msg.opponent_score;

      // Update cumulative scores for this session
      if ((this.robotScore % 10 == 0) && (this.robotScore > prevRobotScore)) {
        this.robotCumulativeScore++
      }
      if ((this.opponentScore % 10 == 0) && (this.opponentScore > prevOpponentScore)) {
        this.opponentCumulativeScore++
      }
    });

    // Draw & contain puck
    this._socket.$state.subscribe((msg: any) => {
      this.puck.x = msg.puck[0];
      this.puck.y = msg.puck[1];
      this.controller.x = msg.robot[0];
      this.controller.y = msg.robot[1];

      if (!this.humanPlay) {
        this.controllerTwo.x = msg.opponent[0];
        this.controllerTwo.y = msg.opponent[1];
      }

    });


  };

  humanToggle(): void {
    this.humanPlay = !this.humanPlay;
  }

  clearCanvas(): void {
    this.boardContext.clearRect(0, 0, this.boardWidth, this.boardHeight);

  };

  draw(obj: Disc): void {
    this.boardContext.beginPath();
    this.boardContext.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI, false);
    this.boardContext.fillStyle = obj.color;
    this.boardContext.fill();
  };

  // Run game functions
  updateGame(): void {
    // Clear table
    this.clearCanvas()

    // Draw objects
    this.draw(this.puck);
    this.draw(this.controller);
    this.draw(this.controllerTwo);

    // Loop
    requestAnimationFrame(this.updateGame.bind(this));
  };

  // Mouse events
  moveOpponent(x: number, y: number): void {
    this.controllerTwo.x = x;
    this.controllerTwo.y = y;
    this.draw(this.controllerTwo);
    this.setOpponentStatePosition()
  }

  // Set human opponen position
  setOpponentStatePosition(): void {
    let endpoint = `${ConfigService.apiUrl}/api/opponent`;
    fetch(endpoint,
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

