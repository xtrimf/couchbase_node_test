// couchbase configuration file
const couchbase = require('couchbase')
const cluster = new couchbase.Cluster('couchbase://localhost/')
cluster.authenticate('admin', 'adminadmin')
const bucket = cluster.openBucket('Winds')
const N1qlQuery = couchbase.N1qlQuery

module.exports = {
    bucket,
    N1qlQuery
}