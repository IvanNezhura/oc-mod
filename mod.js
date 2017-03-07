var fs = require('fs');
var read = require('fs-readdir-recursive');

var log = console.log.bind(console);

// определить файлы для отслеживания todo remake this
var projectDir = '../isc.dev';
var modDir = '/system/storage/modification/';

var filesToWatch = [];


read(projectDir + modDir).forEach(function(item, i, arr){
    fs.watchFile(projectDir + '/' + item, { persistent: true, interval: 100 }, (curr, prev) => {
        log(curr + item);
});

    filesToWatch.push(projectDir + '/' + item);
});





// отслеживать

// обновлять модиикации
