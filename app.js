const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const PORT = process.env.PORT || 6080;

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Acw12897!",
  database: "employees_DB",
});

connection.connect((err) => {
  if (err) {
    throw err.stack;
  }
  console.log("connected as id " + connection.threadId);
});

const departments = []
const roles = []
const employees = []

