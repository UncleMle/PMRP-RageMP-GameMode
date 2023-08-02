const express = require('express');
const CONFIG = require('../CoreSystem/chatformatconf').CONFIG;
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = 8081;
const morgan = require('morgan');
require('../CoreSystem/coreApi');
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.listen(port);

let routes = [
    { path: '/login', location: './routes/login' },
    { path: '/characters', location: './routes/characters' },
    { path: '/authtoken', location: './middleWare/tokenAuth' },
    { path: '/punishments', location: './routes/playerPunishments' },
    { path: '/staffteam', location: './routes/staffteam' },
    { path: '/vehicles', location: './routes/vehicles' },
    { path: '/banplayer', location: './routes/banPlayer' },
    { path: '/adminauth', location: './routes/adminAuth' },
    { path: '/searchplayer', location: './routes/playerSearch' },
    { path: '/profile', location: './routes/playerProfiles' }
]

routes.forEach(route => {
    app.use(route.path, require(route.location));
});


mp.log(`${CONFIG.consoleMagenta}[Endpoints]${CONFIG.consoleWhite} All endpoints have been started successfully server is listening on port ${port} with a total of ${routes.length} routes`);
