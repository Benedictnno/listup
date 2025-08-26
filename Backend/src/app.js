const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const routes = require('./routes');
const error = require('./middleware/error');

require('./config/passport'); // init strategies

const app = express();
app.use(cors(
    {
        origin: ['http://localhost:3000', 'https://listup-three.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
         credentials: true, 
    }
));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(passport.initialize());

app.use('/api', routes);

app.use(error.notFound);
app.use(error.handler);

module.exports = app;
