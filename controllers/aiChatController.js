const { GoogleGenerativeAI } = require("@google/generative-ai");
const expressAsyncHandler = require("express-async-handler");
const dotenv = require('dotenv');

const User = require('../models/UserModel');
const Conversation = require('../models/ai/Conversation');
const Message = require('../models/ai/Message');

dotenv.config();

const PPLX_URL = "https://api.perplexity.ai/chat/completions";
const MODEL = "sonar-pro";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const MAX_DAY_LIMIT = 5;


const startConversation = expressAsyncHandler(
    async (req, res) => {
        try {
            const userId = req.userId;
            // console.log("User id", req.userId);
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

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            let messages = await Message.find({
                conversationId: conversationId,
                role: 'model',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            if (messages.length > MAX_DAY_LIMIT) {
                return res.status(429).json({
                    success: false,
                    error: "Daily quota exceeded",
                    remaining: 0
                });
            }

            // 2. Save user message
           await Message.create({
                role: "user",
                text,
                conversationId
            });

            //await userMsg.save();
            const history = await Message.find({ conversationId }).sort({ _id: 1 });

            // 4. Generate assistant reply via Gemini
            const reply = await generateReply(history);

            // 5. Save assistant message
            const newMsg = await Message.create({
                role: "model",
                text: reply,
                conversationId
            });

           // await newMsg.save();
         //  console.log("saved reply", newMsg);

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

const startPPLXConversation = expressAsyncHandler(async (req, res) => {
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

        // Daily limit check
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let modelMessagesToday = await Message.find({
            conversationId,
            role: "model",
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (modelMessagesToday.length > MAX_DAY_LIMIT) {
            return res.status(429).json({
                success: false,
                error: "Daily quota exceeded",
                remaining: 0
            });
        }

        // Save user message
        await Message.create({
            role: "user",
            text,
            conversationId
        });

        // Fetch full history
        const history = await Message
            .find({ conversationId })
            .sort({ _id: 1 });

        // Generate AI reply using Perplexity
        const reply = await generatePPLXReply(history);

        // Save model reply
        const newMsg = await Message.create({
            role: "model",
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
});


async function generatePPLXReply(history) {

    let messages = history.map(m => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.text
    }));

    const cleaned = [];
    for (let i = 0; i < messages.length; i++) {
        if (i === 0 || messages[i].role !== messages[i - 1].role) {
            cleaned.push(messages[i]);
        }
    }

    if (cleaned[cleaned.length - 1].role !== "user") {
        cleaned.push({
            role: "user",
            content: "Continue our conversation."
        });
    }

    cleaned.unshift({
        role: "system",
        content: "You are a helpful AI assistant. Respond concisely and naturally."
    });

    const response = await fetch(PPLX_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.PPLX_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: cleaned
        })
    });

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "Unable to generate response.";
}




const loadConversations = expressAsyncHandler(
    async (req, res) => {
        try {
            const userId = req.userId;
           // console.log("req", req.userId);

            const user = await User.findById(userId);

           // console.log("User Conversation Id", user);
            if (!user || !user.conversationId) {
                return res.status(200).json({ messages: [] });
            }

            const messages = await Message.find({
                conversationId: user.conversationId
            });

          console.log("Messages length", messages.length);
            const enhancedMessages = messages.map(msg => {
                const m = msg.toObject();

                if (m.role === "user") {
                    m.userHandle = user.user_handle;       
                    m.profileImage = user.Profile_image;   
                }

                return m;
            });

            res.json({ success: true, messages: enhancedMessages });

        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
)

module.exports = {
    startConversation,
    loadConversations,
    startPPLXConversation,
}
