const bodyParser = require('body-parser');
const express = require('express');
const app = express();
var cors = require('cors')
const socketio = require('socket.io');
const port = 5001

const redis = require('redis');
const redisClient = redis.createClient();
const sub = redis.createClient(), pub = redis.createClient();

let path = require('path');

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('dist'))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/api/opponent-move', (req, res) => {

    bot = req.body;

    redisClient.set('new-opponent-location', JSON.stringify(bot));

    res.status(200).send({});
});

var server = app.listen(port, () => console.log('Listening on port http://localhost:' + port));

// ############## Socket.io stuff ##############
var io = socketio.listen(server);

io.on('connection', function (socket) {
    console.log('Client Connected');
});

sub.on("message", function (channel, message) {

    let scoresRes = redisClient.get("scores", (err, scoresState) => {
        io.emit("scores-change", JSON.parse(scoresState));
    });

    let puckRes = redisClient.get("puck", (err, puckState) => {
        let puck = JSON.parse(puckState).location;

        let robotRes = redisClient.get("robot", (err, robotState) => {
            let robot = JSON.parse(robotState).location;

            let opponentRes = redisClient.get("opponent", (err, opponentState) => {
                let opponent = JSON.parse(opponentState).location;

                let state = {
                    "puck": puck,
                    "robot": robot,
                    "opponent": opponent,
                };
                // console.log(state)
                io.emit("state-change", state)
            });
        });
    });

});

sub.subscribe("update");