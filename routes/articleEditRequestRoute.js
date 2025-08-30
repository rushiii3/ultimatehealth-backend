const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authentcatetoken');
const adminAuthenticateToken = require("../middleware/adminAuthenticateToken");

const{
    submitEditRequest,
    getAllImprovementsForReview,
    getAllInProgressImprovementsForAdmin,
    getAllCompletedImprovementsForAdmin,
    pickImprovementRequest,
    submitReviewOnImprovement,
    submitImprovement,
    detectContentLoss, 
    discardImprovement,
    publishImprovement,
    unassignModerator
}= require('../controllers/admin/articleEditRequestController');

/**
 * @openapi
 * /article/submit-edit-request:
 *   post:
 *     summary: Submit an edit request for an article
 *     description: |
 *      This endpoint allows a logged-in user to submit an edit request for a specific article. 
 *       The status of the edit request will default to `UNASSIGNED`. 
 *       The user must provide the article ID, a reason for the edit, and the article record ID.
 *       A user can have up to 2 open edit requests at a time. Blocked or banned users are not permitted to submit requests.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - article_id
 *               - edit_reason
 *               - article_recordId
 *             properties:
 *               article_id:
 *                 type: integer
 *                 description: ID of the article for which the edit request is submitted
 *                 example: 123
 *               edit_reason:
 *                 type: string
 *                 description: Explanation or reason for requesting the edit
 *                 example: Typo found in the third paragraph
 *               article_recordId:
 *                 type: string
 *                 description: External record ID of the article (e.g., Pocketbase record ID)
 *                 example: abc123xyz
 *     responses:
 *       '200':
 *         description: Edit request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your edit request has been successfully created and is being processed.
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/EditRequest'
 *                   description: The newly created edit request details
 *       '400':
 *         description: Missing or invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Article Id , User Id, article record id, Edit Reason required
 *       '401':
 *         description: Unauthorized - User must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '403':
 *         description: Forbidden - user is blocked, banned, or has exceeded edit request limit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not permitted to submit edit request at this moment
 *       '404':
 *         description: Article or user not found, or article removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Article or user not found
 *       '500':
 *         description: Internal server error while processing the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.post('/article/submit-edit-request', authenticateToken, submitEditRequest);


/**
 * @openapi
 * /admin/available-improvements:
 *   get:
 *     summary: Get all unassigned article edit requests for review
 *     description: |
 *       Retrieves a paginated list of all article improvement (edit) requests that are pending review (i.e., have a status of "UNASSIGNED").
 *       Only articles by active (non-blocked and non-banned) authors are included.
 *       This route is protected and requires a valid JWT.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       '200':
 *         description: List of unassigned edit requests for review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   description: List of unassigned edit requests
 *                   items:
 *                     type: object
 *                     $ref: '#/components/schemas/EditRequest'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages (only returned on first page)
 *       '401':
 *         description: Unauthorized - User or admin must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get('/admin/available-improvements', adminAuthenticateToken, getAllImprovementsForReview);

/**
 * @openapi
 * /admin/progress-improvements:
 *   get:
 *     summary: Get all in-progress improvements assigned to the logged-in reviewer
 *     description: |
 *       Retrieves a paginated list of all article improvement requests that are currently in progress, 
 *       awaiting user feedback, or pending review. Only improvements assigned to the logged-in reviewer are returned.
 *       This route is protected and requires authentication.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       '200':
 *         description: Successfully retrieved improvement requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   description: List of improvement requests
 *                   items:
 *                     type: object
 *                     $ref: '#/components/schemas/EditRequest'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages (only on first page)
 *       '400':
 *         description: Reviewer ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reviewer ID is required.
 *       '401':
 *         description: Unauthorized - User or admin must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '500':
 *         description: Server error while fetching improvement requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get('/admin/progress-improvements', adminAuthenticateToken, getAllInProgressImprovementsForAdmin);

/**
 * @openapi
 * /admin/publish-improvements:
 *   get:
 *     summary: All completed improvements assigned to the reviewer
 *     description: |
 *       Returns a paginated list of all article improvement requests that have been marked as `PUBLISHED`,
 *       and are assigned to the currently authenticated reviewer.
 *       Only completed (published) edit requests are shown.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       '200':
 *         description: Successfully retrieved completed improvement requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   description: List of improvement requests
 *                   items:
 *                     $ref: '#/components/schemas/EditRequest'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages (only included on first page)
 *       '400':
 *         description: Reviewer ID is required or missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reviewer ID is required.
 *       '401':
 *         description: Unauthorized - User or admin must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '500':
 *         description: Server error while fetching completed improvements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get('/admin/publish-improvements', adminAuthenticateToken, getAllCompletedImprovementsForAdmin);

/**
 * @openapi
 * /admin/approve-improvement-request:
 *   post:
 *     summary: Assign a reviewer and start review for an edit request
 *     description: >
 *       This endpoint is used by an admin or moderator to pick an unassigned edit request.
 *       The request will be marked as `IN_PROGRESS`, the reviewer will be assigned, and notifications will be sent to the contributor.
 *       The edit request must be in `UNASSIGNED` state, and the reviewer must not be blocked or banned.
 *       The user has a maximum of 4 days to complete their review and submit improvements. After 4 days, if not completed, the request will be automatically discarded by the system, and the user will be notified via **phone** and **email**.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - reviewerId
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: The ID of the edit request to assign
 *               reviewerId:
 *                 type: string
 *                 description: The ID of the moderator/reviewer picking the request
 *     responses:
 *       '200':
 *         description: Successfully assigned the edit request to a reviewer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Article status updated
 *       '400':
 *         description: Missing required fields, invalid status, or user blocked/banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide Request Id and Reviewer Id
 *       '401':
 *         description: Unauthorized - User or admin must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '403':
 *         description: The user who submitted the edit request is blocked or banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User is blocked or banned
 *       '404':
 *         description: Edit request or reviewer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request or Reviewer not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.post('/admin/approve-improvement-request', adminAuthenticateToken, pickImprovementRequest);


/**
 * @openapi
 * /admin/submit-review-on-improvement:
 *   post:
 *     summary: Submit feedback on an edit request
 *     description: >
 *       This endpoint allows a reviewer to submit feedback on an edit request. 
 *       The reviewer will review the user's new changes, detect if there is any **notable content loss**, 
 *       and submit their feedback accordingly. 
 *       If everything is acceptable, the reviewer will **publish** the new improvement to the article.
 *       If any changes are required, the request status will be updated to `AWAITING_USER` and feedback will be provided to the user for new changes.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - reviewer_id
 *               - feedback
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the edit request being reviewed
 *               reviewer_id:
 *                 type: string
 *                 description: ID of the moderator/reviewer submitting the feedback
 *               feedback:
 *                 type: string
 *                 description: The review comment or feedback message
 *     responses:
 *       '200':
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review submitted
 *       '401':
 *         description: Unauthorized - User or admin must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '400':
 *         description: Missing required fields or article/author not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: |
 *                      Please fill all fields: Request Id, Reviewer id and feedback
 *       '403':
 *         description: Reviewer not authorized to access the edit request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to access this article
 *       '404':
 *         description: Edit request or reviewer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request or Moderator not found
 *       '500':
 *         description: Server error while submitting feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/admin/submit-review-on-improvement', adminAuthenticateToken, submitReviewOnImprovement);


/**
 * @openapi
 * /article/submit-improvement:
 *   post:
 *     summary: Submit an improvement for an edit request
 *     description: >
 *       This endpoint allows an user (author) to submit their own improvements to an edit request, and the request status is updated to `REVIEW_PENDING`.
 *       The improvement includes a URL pointing to the edited HTML file, a Pocketbase record ID, and additional image data.  
 *       The request must be open, and the user must have the necessary permissions to submit their work.  
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - edited_content
 *               - pb_recordId
 *               - imageUtils
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the edit request being reviewed
 *               edited_content:
 *                 type: string
 *                 description: Content submitted as the improvement
 *               pb_recordId:
 *                 type: string
 *                 description: ID for the PB record related to the request
 *               imageUtils:
 *                 type: object
 *                 description: Metadata related to images (could be an array or object, define based on actual schema)
 *     responses:
 *       '200':
 *         description: Improvement successfully submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Improvement submitted"
 *       '400':
 *         description: Missing required fields or invalid edit request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request Id, Edited Content, pb recordid, Author Id and Reviewer Id and imageUtils required"
 *       '401':
 *         description: Unauthorized - User or admin must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '403':
 *         description: The request has not been approved yet or the user is unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The request has not been approved yet"
 *       '404':
 *         description: Edit request or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Edit request not found"
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

router.post('/article/submit-improvement', authenticateToken, submitImprovement);


/**
 * @openapi
 * /article/detect-content-loss:
 *   get:
 *     summary: Detect content loss between original and edited content
 *     description: >
 *       This endpoint compares the original content of an article with the edited content from an edit request.
 *       It highlights differences such as missing or added content, which helps to ensure no important information is lost during the editing process.
 *       The differences are returned as HTML, with added content highlighted in green and removed content in red.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: [] 
 *     parameters:
 *       - in: query
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the edit request to check for content loss
 *     responses:
 *       '200':
 *         description: Content comparison successful. Differences between the original and new content are provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 diff:
 *                   type: string
 *                   description: A string containing the HTML version of the content differences, where added content is highlighted in green and removed content in red.
 *                   example: "<ins style='background-color:#c8facc; padding:2px;'>Added content</ins> <del style='background-color:#fdd; padding:2px;'>Removed content</del>"
 *       '400':
 *         description: Missing request ID or invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing request id"
 *       '401':
 *         description: Unauthorized - User or admin must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '403':
 *         description: The request has not been approved yet or is not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The request has not been approved yet."
 *       '404':
 *         description: Edit request or required data not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Edit request not found"
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
router.get('/article/detect-content-loss', adminAuthenticateToken, detectContentLoss);

/**
 * @openapi
 * /admin/discard-improvement:
 *   post:
 *     summary: Discard an improvement for an edit request
 *     description: >
 *       This endpoint allows an admin or authorized user to discard an improvement on an edit request. 
 *       It deletes related image files (from AWS), updates the request status to `DISCARDED`, and notifies the user via email.
 *       The discard action clears the reviewer ID and marks the request as discarded.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - discardReason
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: The ID of the edit request to discard
 *               discardReason:
 *                 type: string
 *                 description: Reason for discarding the improvement
 *     responses:
 *       '200':
 *         description: The improvement was discarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Improvement Discarded"
 *       '400':
 *         description: Invalid request data (missing request ID or discard reason)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request, please provide discard reason and request id"
 *       '401':
 *         description: Unauthorized - User must be authenticated with a valid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '404':
 *         description: The edit request or associated data not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request not found"
 *       '500':
 *         description: Internal server error, could not discard the improvement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/admin/discard-improvement', adminAuthenticateToken, discardImprovement);

/**
 * @openapi
 * /admin/publish-improvement:
 *   post:
 *     summary: Publish an improvement to an article
 *     description: >
 *       This endpoint allows a reviewer to publish an improvement to an article. 
 *       It updates the article's content, changes its status to "PUBLISHED", and notifies the contributor and reviewer via email.
 *       The reviewer must be assigned to the article, and the article must not be removed or the contributor blocked/banned.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - reviewer_id
 *               - content
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: The ID of the edit request to publish
 *               reviewer_id:
 *                 type: string
 *                 description: The ID of the reviewer publishing the improvement
 *               content:
 *                 type: string
 *                 description: The content that will be published to the article
 *     responses:
 *       '200':
 *         description: The article was successfully published
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Article Published"
 *       '400':
 *         description: Invalid request data or article not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request ID and Reviewer ID, content are required"
 *       '403':
 *         description: The reviewer is not assigned to the article or the contributor is blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Article is not assigned to this reviewer"
 *       '404':
 *         description: Request or reviewer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request or Reviewer not found"
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

router.post('/admin/publish-improvement', adminAuthenticateToken, publishImprovement);

/**
 * @openapi
 * /admin/improvement/unassign-moderator:
 *   post:
 *     summary: Unassign a moderator from an edit request
 *     description: >
 *       This endpoint allows a moderator to unassign themselves from an edit request. 
 *       If the article has been published, the action is forbidden. The request status will be changed to `UNASSIGNED`.
 *     tags:
 *       - ArticlesEditRequest
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: The ID of the edit request to unassign the moderator from
 *     responses:
 *       '200':
 *         description: The moderator was successfully unassigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unassigned moderator"
 *       '400':
 *         description: Invalid request data or request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request id required"
 *       '403':
 *         description: The improvement has already been published, so it cannot be unassigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Improvement already published"
 *       '404':
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request not found"
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

router.post('/admin/improvement/unassign-moderator', adminAuthenticateToken, unassignModerator);


module.exports = router;