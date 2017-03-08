var watch = require('node-watch');
var read = require('fs-readdir-recursive');
var fs = require('fs');
var request = require('request');
const getQueryParam = require('get-query-param')

var log = console.log.bind(console);

// определить файлы для отслеживания todo remake this
var projectDir = '../isc.dev';
var modDir = '/system/storage/modification/';

var host = 'http://isc.dev';
var username = 'admin';
var password = 'admin';

function getModRefreshUrl(host, token) {
    return host + '/admin/index.php?route=extension/modification/refresh&token=' + token;
}

var filesToWatch = [];
read(projectDir + modDir).forEach(function(item, i, arr){
    fs.watchFile(projectDir + '/' + item, { persistent: true, interval: 100 }, (curr, prev) => {

        request.post(
            {
                url : host + '/admin/index.php?route=common/login',
                form : {
                    username : username,
                    password : password
                }
            },
            function(err,response,body){
                if  (err)
                    throw err;
                // todo check valid response
                log(response.headers);

                var token = getQueryParam('token', response.headers.location);
                var cookie = response.headers['set-cookie'];
                request.get(getModRefreshUrl(host, token), {
                    headers: {'Cookie': cookie }
                },function(err,response, body){
                    console.log(response.headers, body);
                });
            }
        );
});

    filesToWatch.push(projectDir + '/' + item);
});

if (filesToWatch.length === 0)
    log('No modifications found in ' + projectDir + modDir);
else
    log('start watching: ' + filesToWatch.length + ' files\n');

