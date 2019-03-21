const cb = require('./couchbase_conf.js');
const csv = require('csv-parser')
const fs = require('fs')
const cuid = require('cuid')

// function to push data to DB
function push(data) {
    cb.bucket.upsert(`${data.datetime}::${data.type}`, data, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
    })
}

//load data
function getData(file, type, e) {
    fs.createReadStream(file)
        .pipe(csv())
        .on('data', function (data) {
            let res = {}
            res.type = type
            res.datetime = data.datetime
            delete data.datetime
            for (key in data) {
                data[key] = data[key] ? Number(data[key]) : null;
            }
            res.data = data
            push(res) // push to db
        })
        .on('end', () => {
            console.log(`${type}: Done!`);
            if (e) {
                console.log('Creating Indexes...');
                //create indexes
                let query1 = cb.N1qlQuery.fromString("CREATE PRIMARY INDEX `wind-primary-index` ON `Winds` USING GSI");
                cb.bucket.query(query1, function (err, res) {
                    let query2 = cb.N1qlQuery.fromString("CREATE INDEX winds_index ON Winds(type,datetime,data.Jerusalem)");
                    cb.bucket.query(query2, function (err, res) {
                        console.log('Done!');
                        cb.bucket.disconnect()
                    });
                });
            }
        })
}

console.log('Loading data...');

getData('data/wind_speed.csv', 'wind speed')
getData('data/wind_direction.csv', 'wind direction', true)