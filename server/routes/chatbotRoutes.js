const express = require("express");
const router = express.Router();

// Simple chatbot logic (replace with AI logic if needed)

const axios = require("axios");

// 🤖 AI Chatbot with Hugging Face & Hinglish Support
router.post("/", async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ HUGGINGFACE_API_KEY is missing in .env");
  } else {
    console.log(`🔑 API Key found: ${apiKey.substring(0, 4)}...`);
  }

  if (!message) {
    return res.status(400).json({ reply: "Please provide a message." });
  }

  console.log(`🤖 AI Request for: "${message}"`);

  try {
    // 🧠 OpenAI-compatible request to Hugging Face Router
    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "microsoft/Phi-3-mini-4k-instruct",
        messages: [
          {
            role: "system",
            content: "You are MindMend AI, a supportive and empathetic mental health companion. Respond in a mix of Hindi and English (Hinglish). Use a warm, caring tone. Provide support for stress, anxiety, and general wellness. If someone is in crisis, advise professional help."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    let reply = response.data.choices[0]?.message?.content || "Shukriya share karne ke liye. Main abhi thoda slow respond kar raha hoon, par main hamesha aapke saath hoon.";

    res.json({ reply: reply.trim() });
  } catch (err) {
    if (err.response) {
      console.error("❌ Hugging Face API Error Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("❌ Chatbot Error:", err.message);
    }

    // FALLBACK LOGIC (same as previous Hinglish logic) if API fails
    let fallbackReply = "Main sun raha hoon. Aap kaisa feel kar rahe hain?";
    const msg = message.toLowerCase();

    if (msg.includes("sad") || msg.includes("dukhi") || msg.includes("man nahi")) {
      fallbackReply = "I'm sorry ki aap aisa feel kar rahe hain. Sad feel karna normal hai, par please yaad rakhein ki help available hai. Kya aap kisi professional se baat karna chahenge?";
    } else if (msg.includes("anxious") || msg.includes("tension") || msg.includes("ghabrahat")) {
      fallbackReply = "Tension aur anxiety bohot uncomfortable ho sakti hai. 🧘‍♂️ Lambi saans lein (Deep breathing).";
    } else {
      fallbackReply = "Thank you share karne ke liye. Mere server me thodi dikkat hai, par aap mujhse Hinglish me baat karte rahein!";
    }

    res.json({ reply: fallbackReply });
  }
});

module.exports = router;
