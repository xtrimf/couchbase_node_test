const cb = require('./couchbase_conf.js');

console.log('Quering DB...');
//create indexes
let query1 = `select results.datetime
from 
(SELECT t1.datetime , t1.data.Jerusalem as speed, avg(t2.data.Jerusalem) as avg
FROM Winds t1 join Winds t2
ON t2.datetime between DATE_ADD_STR( t1.datetime ,-5, 'day') and t1.datetime
WHERE t1.type="wind speed" and t2.type='wind speed' 
and t2.data.Jerusalem IS NOT NULL
group by t1.datetime,t1.data.Jerusalem) as results
where results.speed > results.avg`;
cb.bucket.query(cb.N1qlQuery.fromString(query1), function (err, res) {
    if (err) console.log(err);
    console.log(res);
    cb.bucket.disconnect()
});