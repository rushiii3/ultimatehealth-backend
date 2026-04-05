const express = require("express");
const authToken = require("../middleware/authentcatetoken"); // user token
const router = express.Router();

const { startConversation,loadConversations, startPPLXConversation } = require('../controllers/aiChatController');
/**
 * @swagger
 * /gemini/send:
 *   post:
 *     summary: Send a message to Gemini & receive response
 *     tags: [ChatBot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Hello, tell me about Gemini"
 *     responses:
 *       200:
 *         description: Gemini's reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 */
router.post("/send", authToken, startConversation);

/**
 * @swagger
 * /gemini/messages:
 *   get:
 *     summary: Get all chat messages for the user
 *     tags: [ChatBot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 */
router.get("/messages", authToken, loadConversations);

module.exports = router;