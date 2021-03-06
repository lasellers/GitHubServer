const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = () => {
    // eslint-disable-next-line no-undef
    const dirname = __dirname;

    router.get('/', (request, response) => {
        response.setHeader("Content-Type", "application/json");
        return response.json({error: 'No API'});
    });

    router.get('/:username', (request, response) => {
        response.setHeader("Content-Type", "application/json");
        const username = request.params.username;
        const pathString = path.join(dirname) + '/../data/user.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    router.get('/:username/followers', (request, response) => {
        response.setHeader("Content-Type", "application/json");
        const username = request.params.username;
        const pathString = path.join(dirname) + '/../data/followers.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    router.get('/:username/following', (request, response) => {
        response.setHeader("Content-Type", "application/json");
        const username = request.params.username;
        const pathString = path.join(dirname) + '/../data/following.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    router.get('/:username/gists', (request, response) => {
        response.setHeader("Content-Type", "application/json");
        const username = request.params.username;
        const pathString = path.join(dirname) + '/../data/gists.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    /* router.get('/gist/:id', (request, response) => {
        response.setHeader("Content-Type", "application/json");
            const id = request.params.id;
            fs.readFile(path.join(__dirname) + '/../data/gist.' + id + '.txt', function (err, data) {
                if (err) {
                    return response.json({error: err});
                }
                const text = data.toString();
                response.json(text);
            })
        }); */

    return router;
};
