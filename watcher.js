const cb = require('./couchbase_conf.js');
const fs = require('fs-extra')
const csv = require('csv-parser')
const chokidar = require('chokidar');

// create a watch directory if not exist
if (!fs.existsSync('./watch')) {
    fs.mkdirSync('./watch')
    fs.mkdirSync('./watch/processed')
}

// monitor for csv file in 'watch' dir
chokidar.watch('watch/*.csv', {
    depth: 0,
    ignoreInitial: true
}).on('add', (path) => {
    console.log(`New file detected...loading ${path}`);
    getData(path, 'wind speed')
});

/// function to push data to DB
function push(data) {
    // this upates the whole document - it is also possible to update part of a document!
    cb.bucket.upsert(`${data.datetime}::${data.type}`, data, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
    })
}

//load data
function getData(file) {
    fs.createReadStream(file)
        .pipe(csv())
        .on('data', function (data) {
            let res = {}
            res.type = 'wind speed'
            res.datetime = data.datetime
            delete data.datetime
            for (key in data) {
                data[key] = data[key] ? Number(data[key]) : null;
            }
            res.data = data
            push(res) // push to db
        })
        .on('end', () => { //move file to processed folder
            fs.move(file, `watch/processed/${file.split("/")[1]}`)
                .then(() => console.log(`${file} loaded`))
                .catch(err => console.error(err))

        })
}
