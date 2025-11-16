const { GoogleGenerativeAI } = require("@google/generative-ai");
const expressAsyncHandler = require("express-async-handler");
const dotenv = require('dotenv');

const User = require('../models/UserModel');
const Conversation = require('../models/ai/Conversation');
const Message = require('../models/ai/Message');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


const startConversation = expressAsyncHandler(
    async (req, res) => {
        try {
            const userId = req.userId;
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ message: "Text is required" });
            }

            let user = await User.findById(userId);

            if (!user.conversationId) {
                const newConv = await Conversation.create({ userId });
                user.conversationId = newConv._id;
                await user.save();
            }

            const conversationId = user.conversationId;

            // 2. Save user message
            await Message.create({
                role: "user",
                text,
                conversationId
            });
            const history = await Message.find({ conversationId }).sort({ _id: 1 });

            // 4. Generate assistant reply via Gemini
            const reply = await generateReply(history);

            // 5. Save assistant message
            const newMsg = await Message.create({
                role: "assistant",
                text: reply,
                conversationId
            });

            return res.status(200).json({
                success: true,
                message: newMsg
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
)

async function generateReply(history) {
    const formattedMessages = history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const chat = model.startChat({
        history: formattedMessages
    });

    const result = await chat.sendMessage("Continue the conversation");
    return result.response.text();
}

const loadConversations = expressAsyncHandler(
    async (req, res) => {
        try {
            const userId = req.userId;

            const user = await User.findById(userId);
            if (!user || !user.conversationId) {
                return res.json({ messages: [] });
            }

            const messages = await Message.find({
                conversationId: user.conversationId
            }).sort({ _id: 1 });

            res.json({ success: true, messages });

        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
)

module.exports = {
    startConversation,
    loadConversations,
}
