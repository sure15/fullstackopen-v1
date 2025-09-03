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

module.exports = {
  dummy, totalLikes, favoriteBlog
}