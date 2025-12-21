const Article = require("../../models/Articles");

const findArticleById = async (articleId) => {
  return await Article.findById(Number(articleId));
}

module.exports = {
    findArticleById
}