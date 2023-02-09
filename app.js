const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const isValid = require("date-fns/isValid");
let format = require("date-fns/format");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const initilizeDbAndSerevr = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};
initilizeDbAndSerevr();

///API1

const aa = (response, data) => {
  response.send(
    data.map((k) => {
      return {
        id: k.id,
        todo: k.todo,
        priority: k.priority,
        status: k.status,
        category: k.category,
        dueDate: k.due_date,
      };
    })
  );
};

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;
  if (
    status !== undefined &&
    priority === undefined &&
    category === undefined &&
    search_q === ""
  ) {
    const sql = `SELECT
                *
                FROM
                TODO
                WHERE
                STATUS='${status}';`;

    const data = await db.all(sql);
    if (data == false) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      aa(response, data);
    }
  } else if (
    priority !== undefined &&
    status === undefined &&
    category === undefined &&
    search_q === ""
  ) {
    const sql = `SELECT
                  *
                  FROM
                  TODO
                  WHERE 
                  PRIORItY='${priority}';`;

    const data = await db.all(sql);
    if (data == false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      aa(response, data);
    }
  } else if (
    priority !== undefined &&
    status !== undefined &&
    category === undefined &&
    search_q === ""
  ) {
    const sql = `SELECT
                  *
                  from
                   TODO
                   WHERE
                   PRIORITY='${priority}'
                    and
                    STATUS='${status}';`;

    const data = await db.all(sql);
    if (data == false) {
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        response.status(400);

        response.send("Invalid Todo Status");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      aa(response, data);
    }
  } else if (
    priority === undefined &&
    status === undefined &&
    category === undefined &&
    search_q !== ""
  ) {
    const sql = `SELECT
                    *
                    FROM
                    TODO
                    WHERE
                    TODO LIKE '%${search_q}%' ;`;

    const data = await db.all(sql);
    response.send(aa(response, data));
  } else if (
    category !== undefined &&
    status !== undefined &&
    priority === undefined &&
    search_q === ""
  ) {
    const sql = `SELECT
                 *
                  FROM
                  TODO
                  WHERE 
                  CATEGORY='${category}'
                  and 
                  status='${status}';`;

    const data = await db.all(sql);
    if (data == false) {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.send(aa(response, data));
    }
  } else if (
    category !== undefined &&
    status === undefined &&
    priority === undefined &&
    search_q === ""
  ) {
    const sql = `SELECT
                   *
                   FROM
                   TODO
                   WHERE
                   CATEGORY='${category}';`;

    const data = await db.all(sql);
    if (data == false) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      response.send(aa(response, data));
    }
  } else if (
    category !== undefined &&
    priority !== undefined &&
    status === undefined &&
    search_q === ""
  ) {
    const sql = `SELECT
                   *
                   FROM
                   TODO
                   WHERE
                   CATEGORY='${category}'
                  and priority='${priority}';`;

    const data = await db.all(sql);
    if (data == false) {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.send(aa(response, data));
    }
  }
});

///API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sql = `SELECT
                *
                 from
                 todo
                 where
                 id=${todoId};`;

  const k = await db.get(sql);
  response.send({
    id: k.id,
    todo: k.todo,
    priority: k.priority,
    status: k.status,
    category: k.category,
    dueDate: k.due_date,
  });
});

///API3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  if (isValid(new Date(date))) {
    const forDate = format(new Date(date), "yyyy-MM-dd");
    const year = forDate.getFullYear;
    const sql = `SELECT
                *
                FROM
                TODO
                WHERE
                due_date=${forDate}`;
    const data = await db.all(sql);
    response.send(data);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

///API4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isValid(new Date(dueDate))) {
          const fordate = format(new Date(dueDate), "yyyy-MM-dd");
          const sql = `INSERT
                                    INTO 
                                    TODO
                                    (id,todo,priority,status,category,due_date)
                                    VALUES(${id},'${todo}','${priority}','${status}','${category}','${fordate}');`;

          await db.run(sql);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

///

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const sql = `UPDATE
                     TODO
                     SET
                     STATUS='${status}'
                     where id=${todoId};`;
      await db.run(sql);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else if (priority !== undefined) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const sql = `UPDATE
                    TODO
                    SET
                    PRIORITY='${priority}'
                    where id=${todoId};`;
      await db.run(sql);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (todo !== undefined) {
    const sql = `UPDATE
                    TODO
                    SET
                     PRIORITY='${priority}'
                     where id=${todoId};`;

    await db.run(sql);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const sql = `UPDATE
                    TODO
                     SET
                     CATEGORY='${category}'
                     where id=${todoId};`;

      await db.run(sql);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (dueDate !== undefined) {
    if (isValid(new Date(dueDate))) {
      const fordate = format(new Date(dueDate), "yyyy-MM-dd");
      const sql = `UPDATE
                    TODO
                     SET
                     DUE_DATE='${fordate}'
                     where id=${todoId};`;

      await db.run(sql);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

///API6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sql = `DELETE
               FROM
               TODO
               WHere
               ID=${todoId};`;
  await db.run(sql);
  response.send("Todo Deleted");
});

module.exports = app;
