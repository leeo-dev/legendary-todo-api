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
    return response.json(users);
  } catch (error) {
    return response.status(203).json({ error: error.message });
  }
});
app.get("/users", (request, response) => {
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
app.listen(PORT, () => console.log(`Server is running ${PORT}`));
