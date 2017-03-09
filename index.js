#!/usr/bin/env node

var read = require('fs-readdir-recursive');
var fs = require('fs');
var request = require('request');
const getQueryParam = require('get-query-param');
const readline = require('readline');

var projectDir = './';
var modDir = 'system/storage/modification/';

// helper
var log = console.log.bind(console);

function connectToAdminPanel (host, username, password, refreshModifications) {
    request.post(
        {
            url : host + '/admin/index.php?route=common/login',
            form : {
                username : username,
                password : password
            }
        },
        function(err,response){
            if  (err) {
                log('--------------------> Can not connect to ' + host + '<---------------------');
                throw err;
            }
            if (response.headers.location) {
                var token = getQueryParam('token', response.headers.location);
                var cookie = response.headers['set-cookie'];
                var refreshModUrl = host + '/admin/index.php?route=extension/modification/refresh&token=' + token;
            } else {
                throw Error('--------------------> Can not connect to admin panel on ' + host + '<---------------------');
            }

            if (refreshModifications) {
                request.get(refreshModUrl, {
                    headers: {'Cookie': cookie }
                });
            }
        }
    );
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.question('\nPlease, enter your local opencart application host, username and password for access to admin-panel, separated by spaces\n ' +
    '(like "http://my-oc-shop.dev my-user my-password"): ', (answer) => {
    var words = answer.split(' ');
    if (words.length != 3)
        throw Error('Your input is wrong!');

    var host = words[0].trim();
    var username = words[1].trim();
    var password = words[2].trim();

    var filesToWatch = [];
    read(projectDir + modDir).forEach(function(item, i, arr){
        fs.watchFile(projectDir + '/' + item, { persistent: true, interval: 10 }, (curr, prev) => {
            connectToAdminPanel(host, username, password, true);
    });

        filesToWatch.push(projectDir + '/' + item);
    });

    // check connect to admin panel
    connectToAdminPanel(host, username, password, false);

    // check files
    if (filesToWatch.length === 0)
        throw Error('No modifications found in ' + projectDir + modDir);
    else
        log('start watching: ' + filesToWatch.length + ' files\n');

});
