# Air Hockey Web UI

This is web frontend for Air Hockey. Server subscribes to Redis channels and listens to any messages for updates. If there are any, grab either location data or score data from Redis and push to Angular via Socket.io websockets.

There are two modes: training and playing. Training mode allows one to watch the training of their AI agents. Playing mode allows one to control the right mallet (since the left one is always the robot/computer).

### Starting application
Run `bash start.sh`.

### Miscellaneous
If for some reason the game seemingly slows down, just refresh the page. 