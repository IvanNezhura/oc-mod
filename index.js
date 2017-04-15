#!/usr/bin/env node

var tFunk = require("tfunk");
var readlineSync = require('readline-sync');
var read = require('fs-readdir-recursive');
var fs = require('fs');
var request = require('request');
var getQueryParam = require('get-query-param');


var projectDir = './';
var modDir = 'system/storage/modification/';


// check for exist modifications
var filesToWatch = getFilesToWatch(projectDir, modDir);
if (filesToWatch.length === 0)
    exitWithError('No modifications found in ' + projectDir + modDir);

//get+check OC info
var info = getAdminInfo();
connectToAdminPanel(info.host, info.username, info.password, false);

// start watching
filesToWatch.forEach(function(item, i, arr){
    fs.watchFile(item, { persistent: true, interval: 10 }, (prev, curr) => {
        connectToAdminPanel(info.host, info.username, info.password, true);
    });
});

console.log(tFunk('{green:start watching: '+ filesToWatch.length + ' files}'));


// lib

function getAdminInfo(){
    var host = readlineSync.question(tFunk("Please, enter your local opencart application full host ({green:http://my-oc-shop.dev}) : "));
    var username = readlineSync.question(tFunk("Please, enter username for access to admin-panel ({green:username}) : "));
    var password = readlineSync.question(tFunk("Please, enter password for access to admin-panel ({green:password}): "));

    return {
        host : host,
        username : username,
        password : password
    };

}

function getFilesToWatch(dir, modDir){
    var filesToWatch = [];

    read(dir + modDir).forEach(function(item){
        filesToWatch.push(projectDir + item);
    });

    return filesToWatch;
}


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
            if  (err)
                exitWithError('Can not connect to ' + host);

            if (response.headers.location) {
                var token = getQueryParam('token', response.headers.location);
                var cookie = response.headers['set-cookie'];
                var refreshModUrl = host + '/admin/index.php?route=extension/modification/refresh&token=' + token;
            } else {
                exitWithError('Can not connect to admin panel on ' + host);
            }

            if (refreshModifications) {
                request.get(refreshModUrl, {
                    headers: {'Cookie': cookie }
                });
            }
        }
    );
}

function exitWithError(msg){
    console.log(tFunk("{red:" + msg +  '}\n'));
    process.exit();
}
