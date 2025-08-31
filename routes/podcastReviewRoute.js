const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authentcatetoken');
const adminAuthenticateToken = require("../middleware/adminAuthenticateToken");

const {
    availablePodcastsForReview,
    getAllPodcastsOfModerator,
    getAllCompletedPodcastsOfModerator,
    pickPodcast,
    approvePodcast,
    discardPodcast
} = require('../controllers/admin/podcastReviewController');

/**
 * @openapi
 * /podcast-admin/available:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Get all podcasts available for review
 *     description: |
 *       Returns a paginated list of podcasts with status `REVIEW_PENDING`.
 *       Used by admins/moderators to claim podcasts for reviewing.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         default: 1
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         default: 10
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully fetched available podcasts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                podcasts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Podcast object with populated tags, mentionedUsers, and likedUsers
 *                     $ref: '#/components/schemas/Podcast'
 *                totalPages:
 *                   type: integer
 *                   description: Total number of pages (only for page 1)
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching articles
 *                 details:
 *                   type: string
 *                   example: Unexpected database error
 *       
 */

router.get('/podcast-admin/available', adminAuthenticateToken, availablePodcastsForReview);

/**
 * @openapi
 * /podcast-admin/all:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Get all in-progress podcasts assigned to the moderator
 *     description: |
 *       Returns podcasts that are currently assigned to the authenticated moderator (status: `IN_PROGRESS`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number
 *         default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *         default: 10
 *     responses:
 *       200:
 *         description: Successfully fetched assigned podcasts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                podcasts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Podcast object with populated tags, mentionedUsers, and likedUsers
 *                     $ref: '#/components/schemas/Podcast'
 *                totalPages:
 *                   type: integer
 *                   description: Total number of pages (only for page 1)
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching articles
 *                 details:
 *                   type: string
 *                   example: Unexpected database error
 */
router.get('/podcast-admin/all', adminAuthenticateToken, getAllPodcastsOfModerator);


/**
 * @openapi
 * /podcast-admin/completed:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Get all published podcasts completed by moderator
 *     description: |
 *       Returns a list of all podcasts reviewed and published by the authenticated moderator (status: `PUBLISHED`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Successfully fetched published podcasts for moderator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 podcasts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Podcast'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages (only for page 1)
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching podcasts
 *                 details:
 *                   type: string
 *                   example: Unexpected database error
 */

router.get('/podcast-admin/completed', adminAuthenticateToken, getAllCompletedPodcastsOfModerator);

/**
 * @swagger
 * /podcast-admin/pick:
 *   post:
 *     tags:
 *       - Podcasts
 *     summary: Pick a podcast for review or processing
 *     description: Allows an authenticated admin to pick a podcast that hasn't already been picked by another admin.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               podcast_id:
 *                 type: string
 *                 example: "64f8b94a12e4b6fabc123456"
 *                 description: The ID of the podcast to pick
 *             required:
 *               - podcast_id
 *     responses:
 *       '200':
 *         description: Podcast picked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast picked successfully
 * 
 *       '400':
 *         description: Missing or invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast id is required
 *       '401':
 *         description: Unauthorized - JWT token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '404':
 *         description: Podcast or admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast or admin not found
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

router.post('/podcast-admin/pick', adminAuthenticateToken, pickPodcast);

/**
 * @swagger
 * /podcast-admin/approve:
 *   post:
 *     tags:
 *       - Podcasts
 *     summary: Approve and publish a podcast
 *     description: Allows the authenticated admin who picked the podcast to approve and publish it.
 *     operationId: approvePodcast
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               podcast_id:
 *                 type: string
 *                 example: "64f8b94a12e4b6fabc123456"
 *                 description: The ID of the podcast to publish
 *             required:
 *               - podcast_id
 *     responses:
 *       '200':
 *         description: Podcast published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast published successfully
 *       '400':
 *         description: Validation error or unauthorized action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not the admin of this podcast
 *       '404':
 *         description: Podcast or admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast or admin not found
 *       '401':
 *         description: Unauthorized - JWT token missing or invalid
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
router.post('/podcast-admin/approve', adminAuthenticateToken, approvePodcast);

/**
 * @swagger
 * /podcast-admin/discard:
 *   post:
 *     tags:
 *       - Podcasts
 *     summary: Discard a podcast
 *     description: Allows the authenticated admin who picked the podcast to discard it with a reason. Also deletes the associated files.
 *     operationId: discardPodcast
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               podcast_id:
 *                 type: string
 *                 example: "64f8b94a12e4b6fabc123456"
 *                 description: The ID of the podcast to discard
 *               discardReason:
 *                 type: string
 *                 example: "The audio quality is poor and does not meet our guidelines."
 *                 description: The reason why the podcast is being discarded
 *             required:
 *               - podcast_id
 *               - discardReason
 *     responses:
 *       '200':
 *         description: Podcast discarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast discarded successfully
 *       '400':
 *         description: Validation error or unauthorized action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast id or discard-reason are required
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '404':
 *         description: Podcast or admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast or admin not found
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
router.post('/podcast-admin/discard', adminAuthenticateToken, discardPodcast);

module.exports = router;