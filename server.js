require('dotenv').config();
const db = require('./config/db');
const express = require('./config/express');

const maxDbConnectionAttempts = process.env.MAX_DB_CONNECTION_ATTEMPTS ?? 5;
let remainingDbConnectionAttempts = maxDbConnectionAttempts;

const dbConnectionReattemptBackoffTimeSeconds = process.env.DB_CONNECTION_REATTEMPT_BACKOFF_TIME_SECONDS ?? 15

const app = express();
const port = process.env.PORT || 4941;

// Test connection to MySQL on start-up
async function testDbConnection() {
        await db.createPool();
        await db.getPool().getConnection();
}

function startServer() {
    testDbConnection()
    .then(() => app.listen(port, () => console.log(`Listening on port: ${port}`)))
    .catch(err => {
        console.log(`Unnable to connect to MySQL on attempt ${maxDbConnectionAttempts - remainingDbConnectionAttempts + 1}/${maxDbConnectionAttempts})`);
        console.log(`Error: ${err.message}`);
        remainingDbConnectionAttempts -= 1;
        if (remainingDbConnectionAttempts > 0) {
            console.log(`Retrying connection in ${dbConnectionReattemptBackoffTimeSeconds}s`)
            setTimeout(startServer, dbConnectionReattemptBackoffTimeSeconds * 1000);
        } else {
            console.log(`Could not establish a database connection after ${maxDbConnectionAttempts} attempts. Shutting down.`)
            process.exit(1)
        }
    })
}

startServer()



    
