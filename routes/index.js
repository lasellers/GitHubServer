const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const {check, validationResult} = require('express-validator');

const userRoute = require('./user');

module.exports = () => {

    router.get('/', (request, response) => {
        if (!request.session.visitCount) {
            request.session.visitCount = 0;
        }
        request.session.visitCount += 1;
        console.log(`visits ${request.session.visitCount}`);

        const errors = request.session.feedback ? request.session.feedback.errors : false;
        request.session.feedback = {};

        fs.readFile(path.join(__dirname) + '/../views/pages/index.html', 'utf8', function (err, template) {
            if (err) {
                return console.log(err);
            }

            let errors = '';
            if (typeof locals !== 'undefined' && locals.errors) {
                let errorsArray = [];
                locals.errors.forEach((el) => {
                    errorsArray.push('<li>' + el.msg + '</li>');
                });
                errors = '<p class="alert alert-danger">' + errorsArray + '</p>';
            }
            const output = mustache.render(template, {
                name: 'John',
                pageTitle: 'SpaceX',
                count: request.session.visitCount,
                error: errors
            });
            response.send(output);
        })
    });

    router.post('/', [
        check('name')
            .trim()
            .isLength({min: 3})
            .escape()
            .withMessage('A name is required')
    ], (request, response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            request.session.feedback = {
                errors: errors.array()
            }
        }
        console.log(request.body);
        return response.send('Form posted');
    });

    router.use('/users', userRoute());

    return router;
};

// module.exports = router;
