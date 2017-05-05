#!/usr/bin/env node
"use strict";

const tFunk = require("tfunk");
const readlineSync = require('readline-sync');
const read = require('fs-readdir-recursive');
const fs = require('fs');
const request = require('request');
const getQueryParam = require('get-query-param');


const projectDir = './';
const modDir = 'system/storage/modification/';

// check for exist modifications
const filesToWatch = getFilesToWatch(projectDir, modDir);
if (filesToWatch.length === 0)
    exitWithError('No modifications found in ' + projectDir + modDir);

//get+check OC info
const info = getAdminInfo();
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
    const host = readlineSync.question(tFunk("Please, enter your local opencart application full host ({green:http://my-oc-shop.dev}) : "));
    const username = readlineSync.question(tFunk("Please, enter username for access to admin-panel ({green:username}) : "));
    const password = readlineSync.question(tFunk("Please, enter password for access to admin-panel ({green:password}): "));

    return {host, username, password};
}

function getFilesToWatch(dir, modDir){
    let filesToWatch = [];

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
            if  (err || !response.headers.location)
                exitWithError(`Can not connect to ${host} or Can not connect to admin panel`);

            const token = getQueryParam('token', response.headers.location);
            const cookie = response.headers['set-cookie'];
            const refreshModUrl = `${host}/admin/index.php?route=extension/modification/refresh&token=${token}`;

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
