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
  if (err) throw err.stack;
  console.log("connected as id " + connection.threadId);
});

const sqlStatement =
  "SELECT employee.id, employee.first_name, employee.last_name, role.title AS position, role.salary AS salary, department.name AS department, CONCAT(manager.first_name,' ', manager.last_name) AS manager FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id LEFT JOIN role ON role.id = employee.role_id LEFT JOIN department ON department.id = role.department_id";

function start() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "options",
        choices: [
          "View all Employees",
          "Add an Employee",
          "Add a Role",
          "Add a Department",
          "Update an Employee Role",
          "Update a Manager",
          "Delete an Employee",
          "Delete a Department",
          "Delete a Role",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      if (answers.options === "View all Employees") {
        viewEmployees();
      }      
      if (answers.options === "Add an Employee") {
        addEmployee();
      }
      if (answers.options === "Add a Role") {
        addRole();
      }
      if (answers.options === "Add a Department") {
        addDepartment();
      }
      if (answers.options === "Update an Employee Role") {
        updateEmployeeRole();
      }
      if (answers.options === "Update a Manager") {
        updateManager();
      }
      if (answers.options === "Delete an Employee") {
        deleteEmployee();
      }
      if (answers.options === "Delete a Department") {
        deleteDepartment();
      }
      if (answers.options === "Delete a Role") {
        deleteRole();
      }
      if (answers.options === "Exit") {
        connection.end();
      }
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
}
//----VIEW ALL EMPLOYEES----//
function viewEmployees() {
  const cb = (err, res) => {
    if (err) throw err;
    console.table(res);
    console.log("--------------------");
    return start();
  };
  return connection.query(sqlStatement, cb);
}
//----ADD EMPLOYEE----//
function addEmployee() {
  const queryRole = `SELECT id, title FROM role`;
  const queryEmployees = `SELECT id, first_name, last_name FROM employee`;
  const insertEmployee = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;

  const employeeList = [];

  connection.query(queryRole, (err, res) => {
    if (err) throw err;
    const roleArray = res.map((row) => `${row.id} ${row.title}`);

    connection.query(queryEmployees, (err, res) => {
      if (err) throw err;
      const managerArray = res.map(
        (row) => `${row.id} ${row.first_name} ${row.last_name}`
      );

      managerArray.push("null");
      return inquirer
        .prompt([
          {
            name: "first",
            type: "input",
            message: "What is the employee's first name?",
          },
          {
            name: "last",
            type: "input",
            message: "What is the employee's last name?",
          },
          {
            name: "role",
            type: "rawlist",
            choices: roleArray,
            message: "What is the employee's role?",
          },
          {
            name: "manager",
            type: "rawlist",
            choices: managerArray,
            message: "Who is the manager of the employee?",
          },
        ])
        .then((answer) => {
          const roleID = answer.role.split(" ");
          const managerID = answer.manager.split(" ");

          employeeList.push(
            answer.first,
            answer.last,
            roleID[0],
            managerID[0]
          );

          connection.query(
            insertEmployee,
            [
              employeeList[0],
              employeeList[1],
              employeeList[2],
              employeeList[3],
            ],
            (err, res) => {
              if (err) throw err;
            }
          );
          console.log("Employee added!");
          viewEmployees();
          start();
        });
    });
  });
}
//----ADD A ROLE----//
function addRole() {
  const insertRole = `INSERT INTO role(title, salary, department_id) VALUES (?, ?, ?)`;
  const queryDepartment = `SELECT id, name FROM department`;

  const roleList = [];

  connection.query(queryDepartment, (err, res) => {
    if (err) throw err;
    const departmentArray = res.map((row) => `${row.id} ${row.name}`);
    return inquirer
      .prompt([
        {
          name: "position",
          type: "input",
          message: "What position would you like to add?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of the position?",
        },
        {
          name: "department",
          type: "rawlist",
          choices: departmentArray,
          message: "What department is the position in?",
        },
      ])
      .then((answer) => {
        const departmentID = answer.department.split(" ");
        roleList.push(answer.position, answer.salary, departmentID[0]);
        console.log(roleList);
        connection.query(
          insertRole,
          [roleList[0], roleList[1], roleList[2]],
          (err, res) => {
            if (err) throw err;
          }
        );
        console.log("Position added");
        start();
      });
  });
}
//----ADD A DEPARTMENT----//
async function addDepartment() {
  const insertDepartment = `INSERT INTO department(name) VALUES (?)`;

  const departmentList = [];
  const answer = await inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "What department would you like to add?",
      },
    ]);
  departmentList.push(answer.department);
  connection.query(
    insertDepartment,
    [departmentList[0], departmentList[1], departmentList[2]],
    (err, res) => {
      if (err)
        throw err;
    }
  );
  console.log("Department added");
  start();
}
//----UPDATE AN EMPLOYEE----//
function updateEmployeeRole() {
  const queryRoleUpdate = `SELECT id, title FROM role`;
  const queryEmployeesUpdate = `SELECT id, first_name, last_name FROM employee`;
  const insertEmployee = `UPDATE employee SET role_id = (?) WHERE id = (?) `;

  const employeeListUpdate = [];

  connection.query(queryRoleUpdate, (err, res) => {
    if (err) throw err;
    const roleArrayUpdate = res.map((row) => `${row.id} ${row.title}`);

    connection.query(queryEmployeesUpdate, (err, res) => {
      if (err) throw err;
      const employeeArray = res.map(
        (row) => `${row.id} ${row.first_name} ${row.last_name}`
      );

      employeeArray.push("null");
      return inquirer
        .prompt([
          {
            name: "employee",
            type: "rawlist",
            choices: employeeArray,
            message: "Whose role would you like to update?",
          },
          {
            name: "role",
            type: "rawlist",
            choices: roleArrayUpdate,
            message: "What is the employee's role?",
          },
        ])
        .then((answer) => {
          const roleIDUpdate = answer.role.split(" ");
          const employeeIDUpdate = answer.employee.split(" ");

          employeeListUpdate.push(
            roleIDUpdate[0],
            employeeListUpdate[0]
          );

          connection.query(
            insertEmployee,
            [employeeListUpdate[0], employeeListUpdate[1]],
            (err, res) => {
              if (err) throw err;
            }
          );

          console.log("Employee position updated!");
          viewEmployees();
          start();
        });
    });
  });
}
//----UPDATE AN EMPLOYEE'S MANAGER----//
function updateManager() {
  const queryEmployees = `SELECT id, first_name, last_name FROM employee`;
  const joinQuery = `UPDATE employee SET manager_id = ? WHERE id = ?`;

  const managerView = [];

  connection.query(queryEmployees, (err, res) => {
    if (err) throw err;
    const employeeArray = res.map(
      (row) => `${row.id} ${row.first_name} ${row.last_name}`
    );

    employeeArray.push("null");
    return inquirer
      .prompt([
        {
          name: "employee",
          type: "rawlist",
          choices: employeeArray,
          message: "Whose manager would you like to update?",
        },
        {
          name: "new_manager",
          type: "rawlist",
          choices: employeeArray,
          message: "Who would you like to assign as the new manager?",
        },
      ])
      .then((answer) => {
        const employeeChoiceID = answer.employee.split(" ");
        const newManagerID = answer.new_manager.split(" ");

        managerView.push(employeeChoiceID[0], newManagerID[0]);

        connection.query(
          joinQuery,
          [managerView[1], managerView[0]],
          (err, res) => {
            if (err) throw err;
          }
        );
        console.log("Updated Manager!");
        viewEmployees();
        start();
      });
  });
}
//----DELETE AN EMPLOYEE----//
function deleteEmployee() {
  const queryEmployees = `SELECT id, first_name, last_name FROM employee`;
  const deleteQuery = `DELETE FROM employee WHERE id = ?`;

  const deleteEmployee = [];

  connection.query(queryEmployees, (err, res) => {
    if (err) throw err;
    const employeeArray = res.map(
      (row) => `${row.id} ${row.first_name} ${row.last_name}`
    );

    employeeArray.push("null");
    return inquirer
      .prompt([
        {
          name: "employee",
          type: "rawlist",
          choices: employeeArray,
          message: "Which employee would you like to delete?",
        },
      ])
      .then((answer) => {
        const employeeID = answer.employee.split(" ");
        deleteEmployee.push(employeeID[0]);

        connection.query(deleteQuery, [deleteEmployee[0]], (err, res) => {
          if (err) throw err;
        });
        console.log("Employee deleted!");
        viewEmployees();
        start();
      });
  });
}
//----DELETE A ROLE----//
function deleteRole() {
  const queryRoles = `SELECT id, title FROM role`;
  const deleteQuery = `DELETE FROM role WHERE id = ?`;

  const deleteRole = [];

  connection.query(queryRoles, (err, res) => {
    if (err) throw err;
    const roleArray = res.map((row) => `${row.id} ${row.title}`);

    roleArray.push("null");
    return inquirer
      .prompt([
        {
          name: "role",
          type: "rawlist",
          choices: roleArray,
          message: "Which role would you like to delete?",
        },
      ])
      .then((answer) => {
        const roleID = answer.role.split(" ");
        deleteRole.push(roleID[0]);

        connection.query(deleteQuery, [deleteRole[0]], (err, res) => {
          if (err) throw err;
        });
        console.log("Role deleted!");
        start();
      });
  });
}
//----DELETE A DEPARTMENT----//
function deleteDepartment() {
  const queryRoles = `SELECT id, name FROM department`;
  const deleteQuery = `DELETE FROM department WHERE id = ?`;

  const deleteDepartment = [];

  connection.query(queryRoles, (err, res) => {
    if (err) throw err;
    const departmentArray = res.map((row) => `${row.id} ${row.name}`);

    departmentArray.push("null");
    return inquirer
      .prompt([
        {
          name: "department",
          type: "rawlist",
          choices: departmentArray,
          message: "Which department would you like to delete?",
        },
      ])
      .then((answer) => {
        const departmentID = answer.department.split(" ");
        deleteDepartment.push(departmentID[0]);

        connection.query(deleteQuery, [deleteDepartment[0]], (err, res) => {
          if (err) throw err;
        });
        console.log("Department deleted!");
        start();
      });
  });
}
start();