const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authenticateToken = require('../middleware/authentcatetoken');
const adminAuthenticateToken = require('../middleware/adminAuthenticateToken');

/**** For Article Tags */
/**
 * @openapi
 * /articles/tags:
 *   post:
 *     summary: Create a new tag (genre/category) for health-related issues
 *     description: >
 *       This endpoint allows an admin to create a new tag (genre or category) 
 *       for various health-related issues. Tags help categorize articles based on specific topics or areas.
 *       Only admin or moderator can add , update or delete a tag. 
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new tag (e.g., "Cardiology", "Mental Health", etc.)
 *                 example: "Mental Health"
 *     responses:
 *       '201':
 *         description: Successfully created a new tag
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ArticleTag'
 *       '400':
 *         description: Invalid request, missing required fields or incorrect data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tag name is required"
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/articles/tags',adminAuthenticateToken, articleController.addNewTag);

/**
 * @openapi
 * /articles/tags:
 *   get:
 *     summary: Retrieve all tags for health-related issues
 *     description: >
 *       This endpoint retrieves a list of all tags (categories/genres) used for categorizing health-related articles or content.
 *       The tags are sorted by ID in descending order.
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 $ref: '#/components/schemas/ArticleTag'
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/articles/tags', authenticateToken, articleController.getAllTags);
/**
 * @openapi
 * /articles/tags/{id}:
 *   put:
 *     summary: Update a specific tag by its ID
 *     description: >
 *       This endpoint allows an admin to update an existing tag by its unique ID.
 *       The request must include the new name for the tag.
 *     tags:
 *       - Tags
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the tag to be updated.
 *         schema:
 *           type: integer
 *           example: 101
 *     security:
 *       - bearerAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the tag.
 *                 example: "Neurology"
 *     responses:
 *       '200':
 *         description: Successfully updated the tag
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ArticleTag'
 *       '400':
 *         description: Bad request due to invalid data or parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       '404':
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tag not found"
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.put('/articles/tags/:id', adminAuthenticateToken, articleController.updateTagById);


/**
 * @openapi
 * /articles/tags/{id}:
 *   delete:
 *     summary: Delete an article tag by ID
 *     description: >
 *       This endpoint allows an admin  to delete an article tag by its unique ID. 
 *       The tag can only be deleted if it is not used in any article that is not marked as `DISCARDED`.
 *     tags:
 *       - Tags
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the tag to be deleted.
 *         schema:
 *           type: integer
 *           example: 101
 *     security:
 *       - bearerAuth: []  
 *     responses:
 *       '200':
 *         description: Successfully deleted the tag
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tag deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Unique identifier for the deleted tag
 *                       example: 101
 *                     name:
 *                       type: string
 *                       description: The name of the deleted tag
 *                       example: "Neurology"
 *       '400':
 *         description: The tag is in use in an article and cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tag is used in an article"
 *       '404':
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tag not found"
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.delete('/articles/tags/:id', adminAuthenticateToken, articleController.deleteArticleTagByIds);



/**** For Article *****/

/**
 * @openapi
 * /articles:
 *   post:
 *     summary: Create a new article
 *     description: >
 *       This endpoint allows an authenticated user to create a new article post. The article will initially be in the `UNASSIGNED` state, awaiting review. If the article remains in an `UNASSIGNED` state for more than 30 days.
 *       it will be automatically discarded by the system, and user will be notified by mail. 
 *       The user submitting the article must be an active and non-blocked contributor.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorId
 *               - title
 *               - authorName
 *               - description
 *               - content
 *               - tags
 *               - imageUtils
 *               - pb_recordId
 *               - allow_podcast
 *             properties:
 *               authorId:
 *                 type: string
 *                 description: The unique ID of the author submitting the article.
 *               title:
 *                 type: string
 *                 description: The title of the article.
 *               authorName:
 *                 type: string
 *                 description: The name of the article's author.
 *               description:
 *                 type: string
 *                 description: A brief description of the article's content.
 *               content:
 *                 type: string
 *                 description: The main content of the article (HTML file url,after uploading it to pocketbase).
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of tags for the article (e.g., topics, categories).
 *               imageUtils:
 *                 type: object
 *                 description: Metadata related to images used in the article.
 *               pb_recordId:
 *                 type: string
 *                 description: The Pocketbase record ID associated with the article.
 *               allow_podcast:
 *                 type: boolean
 *                 description: Whether the article allows a podcast version.
 *     responses:
 *       '201':
 *         description: Article successfully created and under review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Article under review"
 *                 newArticle:
 *                   type: object
 *                   $ref: '#/components/schemas/Article'
 *       '400':
 *         description: Missing required fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please fill in all fields: authorId, title, authorName, description, content, tags, imageUtils, pb_recordId, allow_podcast"
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '403':
 *         description: User is blocked or banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User is blocked or banned."
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error creating article"
 */
router.post('/articles',authenticateToken, articleController.createArticle); 

/**
 * @openapi
 * /articles:
 *   get:
 *     summary: Get all published articles
 *     description: >
 *       This endpoint allows users to fetch all articles that are published (`PUBLISHED` status) and not removed (`is_removed: false`). The articles are paginated by `page` and `limit` parameters. 
 *       The articles will include information about their associated tags, mentioned users, liked users, and the author, excluding blocked or banned users.
 *       The results are sorted by `lastUpdated` in descending order.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (default is 1).
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: The number of articles to retrieve per page (default is 50).
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     $ref: '#/components/schemas/Article'
 *       '400':
 *         description: Invalid request or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request or parameters"
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching articles"
 */

router.get('/articles',authenticateToken, articleController.getAllArticles);

/**
 * @openapi
 * /articles/{id}:
 *   get:
 *     summary: Get an article by its ID
 *     description: >
 *       This endpoint allows users to fetch an article by its unique ID. It includes associated information such as tags, liked users, contributors, and the author's followers.
 *       The data is filtered to exclude blocked or banned users.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the article.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the article
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   type: object
 *                   $ref: '#/components/schemas/Article'
 * 
 *       '404':
 *         description: Article not found or removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Article not found"
 * 
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 * 
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching article"
 */

router.get('/articles/:id',authenticateToken, articleController.getArticleById);

/**
 * @deprecated
 */
router.put('/articles/:id',authenticateToken, articleController.updateArticle);

/**
 * @deprecated
 */
router.delete('/articles/:id',authenticateToken, articleController.deleteArticle);

router.post('/articles/saveArticle', authenticateToken, articleController.saveArticle); 
router.post('/articles/likeArticle', authenticateToken, articleController.likeArticle ); 
router.post('/articles/updateViewCount', authenticateToken, articleController.updateViewCount );
router.post('/article/readEvent', authenticateToken, articleController.updateReadEvents);

/**
 * @deprecated
 */
router.get('/article/read-status', authenticateToken, articleController.getReadDataForGraphs);

/**
 * @deprecated
 */
router.get('/article/write-status', authenticateToken, articleController.getWriteDataForGraphs );

router.post('/article/repost', authenticateToken, articleController.repostArticle);
router.get('/article/improvements', authenticateToken, articleController.getAllImprovementsForUser);
router.get('/user-articles',authenticateToken,articleController.getAllArticlesForUser);
router.get('/get-improvement/:reqid', authenticateToken, articleController.getImprovementById);


module.exports = router;
