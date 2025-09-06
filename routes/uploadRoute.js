const multer = require('multer');
const express = require('express');
const controller = require('../controllers/uploadController');
const upload = multer({ dest: 'uploads/' }); 
const authenticateToken = require('../middleware/authentcatetoken');
const adminAuthenticateToken = require("../middleware/adminAuthenticateToken");
const uploadRoute = express.Router();

// For Storage Server

/**
 * @swagger
 * /upload-storage:
 *   post:
 *     summary: Upload a file to AWS S3
 *     description: >
 *       Upload a file to AWS S3. If the uploaded file is an audio file (`.mp3`, `.wav`, etc.), 
 *       a presigned URL is generated using AWS SDK v3 and returned in the response. 
 *       For all other file types, the file is uploaded directly using AWS SDK v3.
 *     tags:
 *       - File Storage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (audio or other types)
 *     responses:
 *       200:
 *         description: File upload initiated or completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Audio file uploaded successfully
 *                 key:
 *                   type: string
 *                   example: sample-audio.mp3
 *                 uploadUrl:
 *                   type: string
 *                   example: https://bucket.s3.amazonaws.com/sample-audio.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&...
 *       400:
 *         description: Bad Request - Invalid file or file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid file or file type
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error uploading file
 */

uploadRoute.post('/upload-storage', upload.single('file'), controller.uploadFile);

/**
 * @swagger
 * /getFile/{key}:
 *   get:
 *     summary: Retrieve a file from S3 by key
 *     description: Fetches and streams a file directly from S3 using AWS SDK v3.
 *     tags:
 *       - File Storage
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The S3 object key (filename or path)
 *         schema:
 *           type: string
 *           example: uploads/sample.pdf
 *     responses:
 *       200:
 *         description: File streamed successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found or failed to fetch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: File not found or access denied
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unexpected server error occurred
 */
uploadRoute.get('/getFile/:key', controller.getFile);

/**
 * @swagger
 * /deleteFile/{key}:
 *   delete:
 *     summary: Delete a file from S3
 *     description: Deletes a file from the S3 bucket. Requires JWT authentication.
 *     tags:
 *       - File Storage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The S3 object key to delete
 *         schema:
 *           type: string
 *           example: uploads/file-to-delete.pdf
 *     responses:
 *       200:
 *         description: File deleted successfully from S3
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized- Token missing or invalid
 *       404:
 *         description: File not found or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: File not found in S3
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unexpected error during deletion
 */
uploadRoute.delete('/deleteFile/:key',authenticateToken, controller.deleteFile);

/** Pocketbase */

/**
 * @swagger
 * /upload-pocketbase:
 *   post:
 *     summary: Upload article HTML content to PocketBase
 *     description: >
 *       Accepts article content as raw HTML and uploads it to PocketBase as an HTML file (`html_file` field).  
 *       If a `record_id` is provided, updates the corresponding PocketBase record.  
 *       Otherwise, creates a new record in the `content` collection.   
 *     tags:
 *       - File Storage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - htmlContent
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the article (used as the file name)
 *                 example: "Welcome Page"
 *               htmlContent:
 *                 type: string
 *                 description: Raw HTML content of the article
 *                 example: "<html><body><h1>Welcome!</h1></body></html>"
 *               record_id:
 *                 type: string
 *                 description: Optional PocketBase record ID to update
 *                 example: "rec_abc123xyz"
 *     responses:
 *       200:
 *         description: Article content uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 recordId:
 *                   type: string
 *                   example: rec_abc123xyz
 *                 html_file:
 *                   type: string
 *                   example: files/html/welcome_page.html
 *       400:
 *         description: Bad request - Missing both title and htmlContent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide title and htmlContent
 *       401:
 *         description: Unauthorized - User authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized access
 *       404:
 *         description: Record to update not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record not found
 *       500:
 *         description: Internal server error during upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

uploadRoute.post('/upload-pocketbase/article', authenticateToken, controller.uploadFileToPocketBase);

/**
 * @swagger
 * /upload-pocketbase/improvement:
 *   post:
 *     summary: Submit improved article content (HTML) by user
 *     description: >
 *       Allows an authenticated user to submit improved article content.  
 *       The content is saved as an HTML file (`edited_html_file`) in the `edit_requests` collection in PocketBase.  
 *       This does **not update the original article content** directly — it's reviewed before applying.  
 *       
 *     tags:
 *       - File Storage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - article_id
 *               - improvement_id
 *               - title
 *               - htmlContent
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of the user submitting the improvement
 *                 example: user_xyz123
 *               article_id:
 *                 type: string
 *                 description: ID of the article being improved
 *                 example: art_abc456
 *               improvement_id:
 *                 type: string
 *                 description: ID of the improvement being made
 *                 example: imp_789xyz
 *               title:
 *                 type: string
 *                 description: Title of the improvement or article
 *                 example: Updated Welcome Page
 *               htmlContent:
 *                 type: string
 *                 description: Raw HTML content of the improvement
 *                 example: "<html><body><h1>Updated Title</h1></body></html>"
 *               record_id:
 *                 type: string
 *                 description: Optional PocketBase record ID to update existing improvement
 *                 example: rec_oldImprovementId
 *     responses:
 *       200:
 *         description: Improvement saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 recordId:
 *                   type: string
 *                   example: rec_improvement123
 *                 html_file:
 *                   type: string
 *                   example: files/improvements/updated_welcome.html
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields- user_id, article_id, improvement_id , htmlContent, title
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized access
 *       404:
 *         description: Record to update not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record not found
 *       500:
 *         description: Internal server error during upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
uploadRoute.post('/upload-pocketbase/improvement', authenticateToken,  controller.uploadImprovementFileToPocketbase);

/**
 * @swagger
 * /publish-improvement-from-pocketbase:
 *   post:
 *     summary: Publish a user-submitted article improvement
 *     description: >
 *       Publishes an improved HTML file (from `edit_requests`) to the specified article (`content` collection).  
 *       Deletes the improvement record after publishing.  
 *       
 * 
 *       🛡️ **Protected route:** Only accessible by authenticated admins.  
 * 
 *       ✅ After publishing, the user is considered a contributor to the article.
 *     tags:
 *       - File Storage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - record_id
 *               - article_id
 *             properties:
 *               record_id:
 *                 type: string
 *                 description: ID of the edit request record (from `edit_requests` collection)
 *                 example: rec_edit_123abc
 *               article_id:
 *                 type: string
 *                 description: ID of the article to apply the improvement to (in `content` collection)
 *                 example: rec_article_456def
 *     responses:
 *       200:
 *         description: Improvement published and applied to article successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Improvement published successfully
 *                 recordId:
 *                   type: string
 *                   example: rec_article_456def
 *                 html_file:
 *                   type: string
 *                   example: files/html/updated_article_456def.html
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields- record_id, article_id
 *       401:
 *         description: Unauthorized - Admin authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized access
 *       404:
 *         description: Edit request not found or missing HTML file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record not found
 *       500:
 *         description: Internal server error during publishing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
uploadRoute.post('/publish-improvement-from-pocketbase', adminAuthenticateToken, controller.publishImprovementFileFromPocketbase);

/**
 * @openapi
 * /articles/get-article-content/{id}:
 *   get:
 *     tags:
 *       - Articles
 *     summary: Get article HTML content by ID
 *     description: |
 *       Fetches the raw HTML content of an article by its ID from the PocketBase collection.
 *       
 *       ⚠️ This endpoint is JWT protected. Only authenticated users or admins can access it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the article to retrieve
 *         schema:
 *           type: string
 *           example: "abc123xyz456"
 *     responses:
 *       200:
 *         description: Successfully fetched the article HTML content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "abc123xyz456"
 *                 content:
 *                   type: string
 *                   description: The raw HTML content of the article
 *                   example: "<h1>Health Benefits of Yoga</h1><p>Yoga improves flexibility...</p>"
 *       401:
 *         description: Unauthorized – JWT missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Article not found
 *       500:
 *         description: Internal server error while fetching article
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
uploadRoute.get('/articles/get-article-content/:id', authenticateToken, controller.getPbFile);
/**
 * @swagger
 * /articles/get-improve-content:
 *   get:
 *     summary: Get HTML content from improvement or published article
 *     description: >
 *       Retrieves HTML file content from PocketBase based on provided query params.  
 *       
 *       - If `recordid` is provided, fetches from `edit_requests` collection (user improvement).  
 *       - If `articleRecordId` is provided, fetches from `content` collection (published article).  
 *       
 *       ⚠️ This is a protected route — authentication is required (user or admin).
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recordid
 *         schema:
 *           type: string
 *         required: false
 *         description: Record ID from `edit_requests` (improvement)
 *         example: rec_edit_123abc
 *       - in: query
 *         name: articleRecordId
 *         schema:
 *           type: string
 *         required: false
 *         description: Record ID from `content` (original published article)
 *         example: rec_content_456def
 *     responses:
 *       200:
 *         description: HTML file content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *               example:
 *                 content: "<html><body><h1>Welcome</h1></body></html>"
 *       400:
 *         description: Missing both `recordid` and `articleRecordId`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request- missing recordid or articleRecordId
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error while fetching file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
uploadRoute.get('/article/get-improve-content', authenticateToken, controller.getIMPFile);


/**
 * @swagger
 * /delete-improvement/{record_id}:
 *   delete:
 *     summary: Delete an improvement record (admin only)
 *     description: >
 *       Deletes a user-submitted improvement (edit request) from the `edit_requests` collection in PocketBase.  
 *       🛡️ This is a **protected admin-only route** and requires authentication.
 *     tags:
 *       - File Storage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: record_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the edit request record to delete
 *         example: rec_edit_789xyz
 *     responses:
 *       200:
 *         description: Improvement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Improvement deleted successfully
 *       400:
 *         description: Missing record_id in request path
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields- record_id
 *       401:
 *         description: Unauthorized - Admin authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized access
 *       404:
 *         description: Record not found in edit_requests collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record not found
 *       500:
 *         description: Internal server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
uploadRoute.delete('/delete-improvement/:record_id', authenticateToken, controller.deleteImprovementRecordFromPocketbase);

   

module.exports = uploadRoute;


