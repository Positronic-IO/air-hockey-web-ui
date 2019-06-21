# Air Hockey Web UI

This is web frontend for Air Hockey. Server subscribes to Redis channels and listens to any messages for updates. If there are any, grab either location data or score data from Redis and push to Angular via Socket.io websockets.

There are two modes: training and playing. Training mode allows one to watch the training of their AI agents. Playing mode allows one to control the right mallet (since the left one is always the robot/computer).

### Install
Run `npm install`

### Build frontend
Run `ng build`.

### Starting webserver
Run `ng serve` for the development server (restarts on changes). To start the production server, run `bash start.sh`.

(Note: The prodution script allows one to start a Node.js server with custom garbage collector handling. From what I can tell through research and experience, this config helps the Socket.io server process all the messages without any hiccups or slow downs. I had found the server lagging during runs and I needed to restart it for it to render the correct positions. Feel free to change these.)

### Miscellaneous
If for some reason the game seemingly slows down, just refresh the page. 