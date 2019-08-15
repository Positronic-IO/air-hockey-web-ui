const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors')
const socketio = require('socket.io');
const port = 8888

const Redis = require('redis');
const redis = Redis.createClient();
const positionSub = Redis.createClient();
const scoreSub = Redis.createClient();
const checkpointSub = Redis.createClient();


const path = require('path');

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('dist'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Human moving controller
app.post('/api/opponent', (req, res) => {
    bot = req.body;
    redis.set('new-opponent-location', JSON.stringify(bot));
    res.status(200).send({});
});

const server = app.listen(port, () => console.log(`Listening on port http://localhost:${port}`));

// ############## Socket.io stuff ##############
const io = socketio.listen(server);

io.on('connection', (socket) => {
    console.log('Client Connected');
});

// Update positions
positionSub.subscribe("position-update");
positionSub.on("message", (channel, message) => {

    redis.get("components", (err, resp) => {
        const data = JSON.parse(resp);
        const state = {
            "puck": data.puck.location,
            "robot": data.robot.location,
            "opponent": data.opponent.location,
        };

        // console.log(state)
        io.emit("state", state)
    });
});

// Update Scores
scoreSub.subscribe("score-update");
scoreSub.on("message", (channel, message) => {

    redis.get("scores", (err, resp) => {
        io.emit("scores", JSON.parse(resp));
    });

});

// Update Checkpoint
checkpointSub.subscribe("save-checkpoint");
checkpointSub.on("message", (channel, message) => {
    io.emit("save", message);
});