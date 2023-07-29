const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dBPath = path.join(__dirname, "todoApplication.db");

//console.log(dBPath);
let dBConnObj = null;
const connectDBAndStartServer = async () => {
  try {
    dBConnObj = await open({ filename: dBPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is listening on http://localhost:3000/");
      //console.log(dBConnObj);
    });
  } catch (e) {
    console.log(`Error is :${e.message}`);
    process.exit(1);
  }
};

connectDBAndStartServer();

//API1

app.get("/todos/", async (request, response) => {
  //console.log(request.query);
  const { status, priority, search_q } = request.query;
  if (status !== undefined && priority === undefined) {
    const query = `SELECT * FROM todo
  WHERE status = '${status}';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData);
  } else if (priority !== undefined && status === undefined) {
    const query = `SELECT * FROM todo
  WHERE priority = '${priority}';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData);
  } else if (status !== undefined && priority !== undefined) {
    const query = `SELECT * FROM todo
  WHERE priority = '${priority}' AND status = '${status}';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData);
  } else if (search_q !== undefined) {
    const query = `SELECT * FROM todo
  WHERE todo LIKE  '%${search_q}%';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData);
  }
});

//API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(request.params);

  const queryById = `SELECT * FROM todo
    WHERE id = '${todoId}';`;
  const dBResponse = await dBConnObj.get(queryById);
  response.send(dBResponse);
});

//API3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  //console.log(request.params);

  const addTodoQuery = `INSERT INTO todo (id,todo,
      priority,status) VALUES (${id},'${todo}','${priority}',
      '${status}')
    ;`;
  await dBConnObj.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  //console.log(request.params);
  if (todo === undefined && priority === undefined && status !== undefined) {
    const updateQuery = `UPDATE  todo SET
      status = '${status}'
    WHERE id = '${todoId}';`;

    await dBConnObj.run(updateQuery);
    response.send("Status Updated");
  } else if (
    todo === undefined &&
    priority !== undefined &&
    status === undefined
  ) {
    const updateQuery = `UPDATE  todo SET
      priority = '${priority}'
    WHERE id = '${todoId}';`;

    await dBConnObj.run(updateQuery);
    response.send("Priority Updated");
  } else if (
    todo !== undefined &&
    priority === undefined &&
    status === undefined
  ) {
    const updateQuery = `UPDATE  todo SET
      todo = '${todo}'
    WHERE id = '${todoId}';`;

    await dBConnObj.run(updateQuery);
    response.send("Todo Updated");
  }
});

//API5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  // console.log(request.params);

  const deleteQuery = `DELETE FROM todo
    WHERE id = '${todoId}';`;
  await dBConnObj.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
