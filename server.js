const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const mustache = require('mustache');
const {promisify} = require("util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const cookieSession = require('cookie-session');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');

const routes = require('./routes');

const app = express();

const port = 3001;

app.set('trust proxy', 1);

app.use(cookieSession({
    name: 'session',
    keys: ['abcdefghijk12345', '12345abcdefghj']
}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, './static')));

app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, './views'));

app.use('/', routes());

app.use((request, response, next) => {
    return next(createError(404, 'Not found'));
});
app.use((err, request, response, next) => {
    response.locals.message = err.message;
    const status = err.status || 500;
    response.locals.status = status;
    response.status(status);
    response.render('err');
});

router.post('/', [
    check('name')
        .trim()
        .isLength({min: 3})
        .escape()
        .withMessage('A name is required')
], (request, response) => {
    console.log(request.body);
    return response.send('Form posted');
});
app.listen(port, () => {
    console.log(`Server listing on ${port}`);
});
