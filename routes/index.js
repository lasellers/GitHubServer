const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mustache = require('mustache');

const userRoute = require('./user');

module.exports = () => {

    router.get('/', (request, response) => {
        if(!request.session.visitCount) {
            request.session.visitCount = 0;
        }
        request.session.visitCount += 1;
        console.log(`visits ${request.session.visitCount}`);

        fs.readFile(path.join(__dirname) + '/../views/pages/index.html', 'utf8', function (err, template) {
            if (err) {
                return console.log(err);
            }
            const output = mustache.render(template, {name: 'John', pageTitle: 'SpaceX', count: request.session.visitCount});
            response.send(output);
        })
    });

    router.use('/users', userRoute());

    return router;
};

// module.exports = router;
