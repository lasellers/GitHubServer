'use strict';
/*
./node_modules/.bin/protractor test/conf.js --suite public
*/

describe('Public', function () {

    beforeEach(function () {
        goPublicHome();
    });

    it('title of '+browser.params.homeUrl, function () {
//        expect(element(by.tagName("title")).isPresent()).toBeTruthy();
        browser.getTitle().then(function (titleName) {
            expect(titleName).toEqual("The Clear Perspective on Healthcare Cyber Risk - Clearwater");
        });
    });
});
