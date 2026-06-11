const { HTTP_STATUS, ERROR_CODES } = require('../../constants/errorConstants')
const Article = require('../../models/Articles')
const ArticleTag = require('../../models/ArticleModel')
const { throwError } = require('../../utils/throwError')

const findArticleById = async (articleId) => {
    if (!Number.isSafeInteger(articleId) || articleId <= 0) {
        throwError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT,
            'Article ID must be a positive integer within safe range'
        )
    }
    return Article.findById(Number(articleId)).lean()
}

const getArticleContributors = async ({ articleId }) => {
    const article = await Article.findById(Number(articleId))
        .populate({
            path: 'contributors',
            select: 'user_id user_name followers Profile_image',
            match: {
                isBannedUser: false,
                isBlockUser: false,
            },
        })
        .exec()

    if (!article || article.is_removed) {
        return null
    }

    if (article.contributors) {
        article.contributors = article.contributors.filter(
            (user) => user !== null
        )
    }

    return article.contributors || []
}

const createDraftArticle = async ({
    title,
    pb_recordId,
    authorId,
    content,
}) => {
    return Article.create({
        title,
        authorName: '',
        content: '',
        authorId,
        pb_recordId,
        status: 'draft',
        content,
    })
}

// const checkArticleBelongtoUser = async ({ userId, articleId }) => {
//     return Article.exists({
//         _id: articleId,
//         authorId: userId,
//         is_removed: false,
//         status: 'draft',
//     })
// }

const checkArticleExists = async (articleId) => {
    return Article.findOne({
        _id: articleId,
        is_removed: false,
        status: 'draft',
    }).lean()
}

const createArticle = async ({
    articleId,
    author_name,
    description,
    imageUtils,
    allow_podcast,
    language,
    authorId,
    tags,
}) => {
    return Article.findByIdAndUpdate(
        articleId,
        {
            $set: {
                authorName: author_name,
                description,
                imageUtils,
                allow_podcast,
                language,
                status: 'unassigned',
                tags,
            },
            $addToSet: {
                mentionedUsers: authorId,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
}

const checkArticleTagsExists = async (tags) => {
    const tagIds = tags.map((tag) => tag._id)

    const count = await ArticleTag.countDocuments({
        _id: { $in: tagIds },
    })

    return count === tagIds.length
}

module.exports = {
    findArticleById,
    getArticleContributors,
    createDraftArticle,
    // checkArticleBelongtoUser,
    checkArticleExists,
    createArticle,
    checkArticleTagsExists,
}
