require('dotenv').config()

let SETTINGS = {
   directConnection: process.env.LOCAL,
   replicaSet: process.env.DB_CLUSTER,
   auth: {
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD
   },
   authSource: process.env.DB_AUTHSOURCE,
   dbName: process.env.DB_NAME,
   // all query get from all from primary replica set
   readPreference: "primary",
   // data will get from mayority all node
   readConcern: { level: "majority" }, writeConcern: { w: "majority" },
}

let URL = 'mongodb://'

if (process.env.LOCAL === "true")
   URL += `${process.env.DB_HOST_PUBLIC}:${process.env.DB_PORT}/${process.env.DB_NAME}`
else
   URL += `${process.env.DB_HOST_1}:${process.env.DB_PORT}, ${process.env.DB_HOST_2}:${process.env.DB_PORT},${process.env.DB_HOST_3}:${process.env.DB_PORT}/${process.env.DB_NAME}`


exports.CONFIG = { URL, SETTINGS }