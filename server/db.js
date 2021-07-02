const Pool = require("pg").Pool;

const pool = new Pool({
    user:"uzjxrumygilnnh",
    password: "96e346c7c35e1d04beb4576d66277b5d20430d9f3dc4bafcc757d03c789e0d41",
    host: "ec2-54-243-92-68.compute-1.amazonaws.com",
    post: "5432",
    database: "daj1gdo8a4h96m",
    ssl: {
        rejectUnauthorized: false,
      }
});

module.exports = pool;