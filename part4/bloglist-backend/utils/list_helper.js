const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {

  return blogs.length === 0
    ? 0
    : blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

const favoriteBlog = (blogs) => {
  return blogs.length === 0
    ? null
    : blogs.reduce((favorite, blog) => blog.likes > favorite.likes ? blog : favorite)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const grouped = _.groupBy(blogs, 'author')
  const counts = _.map(grouped, (authorBlogs, author) => ({
    author,
    blogs: authorBlogs.length
  }))
  return _.maxBy(counts, 'blogs')

}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}