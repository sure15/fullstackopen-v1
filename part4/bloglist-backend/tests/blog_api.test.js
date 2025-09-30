const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialblogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialblogs[0])
  await blogObject.save()
  blogObject = new Blog(initialblogs[1])
  await blogObject.save()

})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialblogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')

  const titles = response.body.map(e => e.title)
  assert.strictEqual(titles.includes('React patterns'), true)
})

test('blog posts are returned with id property instead of _id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body

  blogs.forEach(blog => {
    assert.ok(blog.id, 'blog should have id property')
    assert.strictEqual(blog._id, undefined, 'blog should not have _id property')
  })
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  const token = loginResponse.body.token

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)


  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, initialblogs.length + 1)

  assert(titles.includes('Canonical string reduction'))
})

test('if likes property is missing, it defaults to 0', async () => {
  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  const token = loginResponse.body.token

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const savedBlog = response.body
  assert.strictEqual(savedBlog.likes, 0, 'likes should default to 0')
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Author Only',
    url: 'http://example.com',
    likes: 5
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  const token = loginResponse.body.token

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await Blog.find({})
  const titles = blogsAtEnd.map(b => b.title)
  assert.ok(!titles.includes(undefined), 'should not save blog without title')
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'Title Only',
    author: 'Author Only',
    likes: 5
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  const token = loginResponse.body.token

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await Blog.find({})
  const urls = blogsAtEnd.map(b => b.url)
  assert.ok(!urls.includes(undefined), 'should not save blog without url')
})

test('adding a blog fails with 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized blog',
    author: 'No Token',
    url: 'http://example.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)
})

test('succeeds with status code 204 if id is valid and user is authorized', async () => {
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  const token = loginResponse.body.token

  const newBlog = {
    title: 'Blog to be deleted',
    author: 'Root User',
    url: 'http://example.com',
    likes: 0
  }

  const addedBlogResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const blogToDelete = addedBlogResponse.body

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})
  const ids = blogsAtEnd.map(b => b.id)
  assert.ok(!ids.includes(blogToDelete.id), 'deleted blog should be removed')
})



test('a blog\'s likes can be updated', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0]

  const updatedData = { ...blogToUpdate.toJSON(), likes: blogToUpdate.likes + 1 }

  const response = await api
    .put(`/api/blogs/${blogToUpdate._id}`)
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

  const updatedBlog = await Blog.findById(blogToUpdate._id)
  assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
})

after(async () => {
  await mongoose.connection.close()
})