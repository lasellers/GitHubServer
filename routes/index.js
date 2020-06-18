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
        response.setHeader("Content-Type", "text/html");

        if (!request.session.visitCount) {
            request.session.visitCount = 0;
        }
        request.session.visitCount += 1;
        // console.log(`visits ${request.session.visitCount}`);

        // const errors = request.session.feedback ? request.session.feedback.errors : false;
        request.session.feedback = {};

        const pathString = path.join(dirname) + '/../views/pages/index.html';
        fs.readFile(pathString, 'utf8', function (err, template) {
            if (err) {
                return console.log(err);
            }

            let errors = '';
            if (typeof locals !== 'undefined' && locals.errors) {
                const errorsArray = [];
                locals.errors.forEach((el) => {
                    errorsArray.push('<li>' + el.msg + '</li>');
                });
                errors = '<p class="alert alert-danger">' + errorsArray + '</p>';
            }
            const output = mustache.render(template, {
                name: 'John',
                pageTitle: 'SpaceX',
                count: request.session.visitCount,
                error: errors,
            });
            response.send(output);
        });
    });

    router.use('/users', userRoute());

    return router;
};
