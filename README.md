/*
    readFile(path.join(__dirname) + '/views/pages/index.html')
        // .then((response) => response.text())
        .then((response) => response.valueOf())
        .then((template) => {
            console.log(template);
            var output = Mustache.render(template, {name: 'John', pageTitle: 'SpaceX'});
            console.log(output);
            document.getElementById('body').innerHTML = output;
        })

 */
/*
app.get('/', (request, response) => {
    fs.readFile(path.join(__dirname) + '/views/pages/index.html', 'utf8', function (err, template) {
        if (err) {
            return console.log(err);
        }
        const output = mustache.render(template, {name: 'John', pageTitle: 'SpaceX'});
        response.send(output);
    })
    // response.render('pages/index', { name: 'John'});
});

app.get('/user/:username', (request, response) => {
    response.send('Hello user ' + request.param.username);
});
app.get('/user/:username/followers', (request, response) => {
    response.send('Hello followers of  ' + request.param.username);
});
app.get('/user/:username/followings', (request, response) => {
    response.send('Hello followings of  ' + request.param.username);
});
app.get('/user/:username/gists', (request, response) => {
    response.send('Hello gists of  ' + request.param.username);
});
app.get('/user/:username/gist', (request, response) => {
    response.send('Hello gist of  ' + request.param.username);
});

app.get('/hello', (request, response) => {
    response.send('Hello');
});
app.get('/pic', (request, response) => {
    response.sendFile(path.join(__dirname, './static/test.jpg'));
});
app.get('/json', (request, response) => {
    response.json({name: 'John', pageTitle: 'SpaceX'});
});
*/
