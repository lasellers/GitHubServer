const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = () => {
    router.get('/:username', (request, response) => {
        const username = request.params.username;
        const pathString = path.join(__dirname) + '/../data/user.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    router.get('/', (request, response) => {
        response.send('Hello users');
    });

    router.get('/:username/followers', (request, response) => {
        const username = request.params.username;
        const pathString = path.join(__dirname) + '/../data/followers.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    router.get('/:username/following', (request, response) => {
        const username = request.params.username;
        const pathString = path.join(__dirname) + '/../data/following.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    router.get('/:username/gists', (request, response) => {
        const username = request.params.username;
        const pathString = path.join(__dirname) + '/../data/gists.' + username + '.json';
        fs.readFile(pathString, function (err, data) {
            if (err) {
                return response.json({error: err});
            }
            const json = JSON.parse(data);
            response.json(json);
        });
    });

    /* router.get('/gist/:id', (request, response) => {
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
