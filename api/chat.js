export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages) {
    return res.status(400).json({ error: 'No messages provided' });
  }

  const SYSTEM_PROMPT = `You are Sarah, a friendly and professional AI receptionist for SmileCare Dental clinic. 
You help patients with questions about the clinic. Keep answers short, warm, and helpful (2-4 sentences max).

CLINIC INFORMATION:
- Name: SmileCare Dental
- Hours: Mon-Fri 8am-6pm, Sat 9am-3pm, Closed Sunday
- Location: 45 Bright Street, Lagos Island
- Phone: +234 801 234 5678
- Email: hello@smilecare.com

SERVICES & PRICES:
- Regular Checkup & Cleaning: ₦8,000
- Teeth Whitening: ₦35,000
- Dental Filling: ₦12,000 – ₦18,000
- Root Canal Treatment: ₦45,000 – ₦65,000
- Tooth Extraction: ₦10,000 – ₦20,000
- Braces (Orthodontics): From ₦180,000
- Dental Implant: From ₦250,000
- Emergency appointments available same day

RULES:
- If someone wants to book an appointment, collect their name and phone number
- If asked something you don't know, say a dentist will call them back shortly
- Never make up information not listed above
- Always be warm and professional
- When someone is ready to book, say: "I'd love to help you book! Just share your name and phone number and we'll confirm your slot."`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'No response from AI' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Server error, please try again' });
  }
}
