const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const userHeader = request.headers.username

  const validUserInfo = users.find(user => user.username === userHeader)
  if (validUserInfo) {

    request.userInfo = validUserInfo;
    return next();

  } else {
    return response.status(404).json({ error: "User not found" })
  }

}

app.post('/users', (request, response) => {

  const { name, username } = request.body

  const repeatedUsername = users.some(userOnList => userOnList.username === username)


  if (repeatedUsername === false) {
    const newUser = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: []
    }

    users.push(newUser)

    return response.status(201).json(newUser).send()
  } else {

    return response.status(400).json({ error: 'Erro: username already exists' }).send()

  }

});


app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { userInfo } = request

  if (userInfo) {

    const { todos } = userInfo

    return response.status(200).json(todos).send()
  }

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  //entrada deadline insomnia: ANO-MES-DIA

  const { title, deadline } = request.body

  const { userInfo } = request

  const obj = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  userInfo.todos.push(
    obj
  )

  return response.status(201).json(obj).send()


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { userInfo } = request

  const { todos } = userInfo

  const { title, deadline } = request.body

  const updatedTodo = todos.find(todo => todo.id === request.params.id)

  if (updatedTodo) {
    const indexOfTodo = todos.indexOf(updatedTodo)

    const obj = {
      id: request.params.id,
      title: title,
      done: userInfo.todos[indexOfTodo].done,
      deadline: new Date(deadline),
      created_at: userInfo.todos[indexOfTodo].created_at
    }

    userInfo.todos[indexOfTodo] = {
      obj
    }

    return response.status(200).json(obj).send()
  } else {
    return response.status(404).json({ error: 'Erro: todo does not exists' }).send()
  }

});

app.patch(`/todos/:id/done`, checksExistsUserAccount, (request, response) => {

  const { userInfo } = request
  const { todos } = userInfo

  const updatedTodo = todos.find(todo => todo.id === request.params.id)

  if (updatedTodo) {
    const indexOfTodo = todos.indexOf(updatedTodo)

    userInfo.todos[indexOfTodo].done = true

    return response.json(updatedTodo)

  } else {
    return response.status(404).json({ error: 'Erro: todo does not exists' }).send()
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { userInfo } = request

  const { todos } = userInfo

  const { id } = request.params

  const validId = todos.some(todo => todo.id === id)

  if (validId) {

    const filtered = todos.filter(todo => todo.id !== id)

    userInfo.todos = filtered

    return response.status(204).send()
  } else {
    return response.status(404).json({ error: 'Erro: todo does not exists' }).send()
  }

});

module.exports = app;