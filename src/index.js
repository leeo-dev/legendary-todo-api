const express = require("express");
const { v4: uuid } = require("uuid");
const app = express();
const PORT = 3000;
const users = [
  {
    id: "46fa78ab-e021-4056-8a89-64bf3497e7ad",
    name: "Leonardo Albuquerque",
    username: "leeodesign",
    todos: [
      {
        id: "f925dd42db-99cf-46f7-84a3-e5f1a2f40016f",
        title: "Terminar API Todos",
        done: false,
        deadline: "2021-12-19T00:00:00.000Z",
        created_at: "2021-12-15T01:49:49.078Z",
      },
      {
        id: "f9d25d42db-99cf-46f7-84a3-w65ef14f40016f",
        title: "Buy new Shoes",
        done: true,
        deadline: "2021-12-19T00:00:00.000Z",
        created_at: "2021-12-15T01:49:49.078Z",
      },
      {
        id: "f9dd42785db-99cf-46f7-84a3-f86a2f40016f",
        title: "Shopping with friends",
        done: true,
        deadline: "2021-12-19T00:00:00.000Z",
        created_at: "2021-12-15T01:49:49.078Z",
      },
    ],
  },
  {
    id: "86543479-2fcb-400c-bd9f-84592ce0e247",
    name: "Ricardo Albuquerque",
    username: "ricalb",
    todos: [],
  },
];
function checkExistsUserAccount(request, response, next) {
  try {
    const { username } = request.headers;
    const user = users.find((user) => user.username === username);
    if (!user) throw new Error("User not found!");
    request.user = user;
    next();
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
function brDateConvertToUs(stringDate) {
  const arrayDate = stringDate.split("/");
  const invertedDate = arrayDate.reverse();
  return invertedDate.join("-");
}
app.use(express.json());
app.post("/users", (request, response) => {
  try {
    const { name, username } = request.body;
    const id = uuid();
    const isUsernameAlreadyInUse = users.some(
      (user) => user.username === username
    );
    if (isUsernameAlreadyInUse) throw new Error("Username already in use");
    const newUser = { id, name, username, todos: [] };
    users.push(newUser);
    return response.status(201).json(users);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});
app.get("/users", checkExistsUserAccount, (request, response) => {
  return response.json({ users, total: users.length });
});
app.get("/users/:id", (request, response) => {
  try {
    const { id } = request.params;
    const user = users.find((user) => user.id === id);
    if (!user) throw new Error("User not found or id incorrect!");
    return response.json(user);
  } catch (error) {
    return response.status(404).json({ error: error.message });
  }
});
app.delete("/users/:id", (request, response) => {
  try {
    const { id } = request.params;
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex < 0) throw new Error("User not found or id incorrect!");
    users.splice(userIndex, 1);
    return response.status(204).json();
  } catch (error) {
    return response.status(404).json({ error: error.message });
  }
});
app.patch("/users/:id", (request, response) => {
  try {
    const { name, username } = request.body;
    const { id } = request.params;
    const user = users.find((user) => user.id === id);
    const isUsernameAlreadyInUse = users.some(
      (user) => user.username === username
    );
    if (isUsernameAlreadyInUse) throw new Error("Username already in use");
    user.name = name;
    user.username = username;
    if (!user) throw new Error("User not found or id incorrect!");
    return response.json(users);
  } catch (error) {
    return response.status(404).json({ error: error.message });
  }
});
app.post("/todos", checkExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const { title, deadline } = request.body;
    const dateConverted = brDateConvertToUs(deadline);
    const today = new Date();

    const dueDate = new Date(dateConverted);
    const isDeadlineValid = dueDate >= today;
    if (!isDeadlineValid)
      throw new Error(
        "Deadline is invalid, it should be equal or greater than today"
      );
    const newTodo = {
      id: uuid(),
      title,
      done: false,
      deadline: dueDate,
      created_at: today,
    };
    user.todos.push(newTodo);
    response.json(users);
  } catch (error) {
    return response.status(401).json({ error: error.message });
  }
});
app.get("/todos", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const done = user.todos.filter((todo) => {
    if (todo.done) return todo;
  });
  const remain = user.todos.filter((todo) => {
    if (!todo.done) return todo;
  });
  return response.json({
    todos: user.todos,
    total: user.todos.length,
    done,
    done_total: done.length,
    remain,
    remain_total: remain.length,
  });
});
app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const { id } = request.params;
    const todo = user.todos.find((todo) => todo.id === id);
    if (!todo) throw new Error("Todo not found!");
    const todoIndex = user.todos.findIndex((todo) => todo.id === id);
    console.log(todoIndex);
    user.todos.splice(todoIndex, 1);

    return response.status(204).json();
  } catch (error) {
    return response.status(404).json({ error: error.message });
  }
});
app.get("/todos/:id", checkExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const { id } = request.params;
    const todo = user.todos.find((todo) => todo.id === id);
    if (!todo) throw new Error("Todo not found!");
    return response.json(todo);
  } catch (error) {
    return response.status(404).json({ error: error.message });
  }
});
app.listen(PORT, () => console.log(`Server is running ${PORT}`));
