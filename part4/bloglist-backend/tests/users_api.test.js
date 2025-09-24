const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

describe('creating a new user', () => {
  test('succeeds with valid data', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('fails if username is not unique', async () => {
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /username must be unique/)
  })

  test('fails if username or password is missing', async () => {
    const newUser = {
      name: 'No credentials',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /username and password are required/)
  })

  test('fails if username or password is too short', async () => {
    const newUser = {
      username: 'ab',
      name: 'Too Short',
      password: '12',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(
      result.body.error,
      /username and password must be at least 3 characters long/
    )
  })

})

after(async () => {
  await mongoose.connection.close()
})