const express = require("express");
const { v4: uuid } = require("uuid");
const app = express();
const PORT = 3000;
const users = [
  {
    id: "46fa78ab-e021-4056-8a89-64bf3497e7ad",
    name: "Leonardo Albuquerque",
    username: "leeodesign",
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
    console.log(userIndex);
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
    // today.setHours(5, 5, 5, 60);
    console.log(today);
    const dueDate = new Date(dateConverted);
    const isDeadlineValid = dueDate >= today;
    if (!isDeadlineValid)
      throw new Error(
        "Deadline is invalid, it should be equal or greater then today"
      );
    const newTodo = { id: uuid(), title, deadline: dueDate, created_at: today };
    user.todos.push(newTodo);
    response.json(users);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});
app.listen(PORT, () => console.log(`Server is running ${PORT}`));
