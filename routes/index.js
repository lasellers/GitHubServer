const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
// const {check, validationResult} = require('express-validator');

const userRoute = require('./user');

module.exports = () => {
    // eslint-disable-next-line no-undef
    const dirname = __dirname;

    router.get('/', (request, response) => {
        response.setHeader("Content-Type", "application/json");
        return response.json({error: 'No API'});
    });

    return router;
};
