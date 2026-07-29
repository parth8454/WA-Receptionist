import Groq from 'groq-sdk';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { sendMessage,getSession } from '../Services/baileyService.js';
import { Customer } from '../models/Customer.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';

// customerPhone is the customer's phone number (919XXXXXXXXX@s.whatsapp.net)
// all the three shopId, customerPhone, customerQuery are strings

const messageCount = {};

const isWithinWorkingHours = () => {
    const now = new Date();
    const hours = now.getHours(); // IST if server is in India
    const day = now.getDay(); // 0=Sunday

    // Working hours: 9AM to 9PM, all days
    return hours >= 9 && hours < 24;
};

const isRateLimited = (customerPhone) => {
    // Normalize phone — always use the base number as key
    const normalizedPhone = customerPhone
        .replace('@s.whatsapp.net', '')
        .replace('@lid', '')
        .trim();

    const now = Date.now();
    const windowMs = 60 * 60 * 1000;

    if (!messageCount[normalizedPhone] || messageCount[normalizedPhone].resetAt < now) {
        messageCount[normalizedPhone] = {count: 0, resetAt: now + windowMs };
    }

    messageCount[normalizedPhone].count++;

    console.log(`📊 Rate limit for ${normalizedPhone}: ${messageCount[normalizedPhone].count}`);

    return messageCount[normalizedPhone].count > 10; // back to 10 for production
};

export const handleIncomingMessage = async (shopId, customerPhone, customerQuery) => {
    console.log(`🤖 Handling message for shop ${shopId} from ${customerPhone}: ${customerQuery}`);
    try {
        const currentShop = await Shop.findById(shopId).catch(() => null);
        if (!currentShop) {
            console.log(`❌ Shop not found for id: ${shopId}`);
            return;
        }

    //     if (!isWithinWorkingHours()) {
    //     await sendMessage(shopId, customerPhone,
    //     "Bhai abhi hum available nahi hain 🌙. Subah 9 baje se shaam 9 baje tak reply milega.\nApna message chod do, hum zaroor reply karenge! 😊"
    //     );
    //     return;
    // }

    if (isRateLimited(customerPhone)) {
        console.log(`🚫 Rate limited: ${customerPhone} — message dropped silently`);
        return; 
        }


        // Save customer (upsert — create if not exists)
        await Customer.findOneAndUpdate(
            { shopId, phone: customerPhone },
            { shopId, phone: customerPhone, lastMessage: new Date() },
            { upsert: true, new: true }
        );

        // Save inbound message
        await Message.create({
            shopId,
            customerPhone,
            text: customerQuery,
            direction: 'inbound'
        });

        const messages = await Message.find({ shopId, customerPhone })
            .sort({ createdAt: -1 });

        if (messages.length > 2) {
            const oldIds = messages.slice(10).map(m => m._id);
            await Message.deleteMany({ _id: { $in: oldIds } });
        }

        const merchantKey = currentShop.clientGroqApiKey;
        if (!merchantKey) {
            await sendMessage(shopId, customerPhone,
                "Automated assistant is being set up. Please check back shortly! 🙏"
            );
            return;
        }

        const localCatalog = await Product.find({
            shopId: currentShop._id,
            isAvailable: true
        });

        const systemPrompt = `
You are a WhatsApp assistant for "${currentShop.businessName}", a barber/salon shop. Reply like a helpful shop assistant — short, friendly, natural.

SHOP INFO:
- Address: ${currentShop.shopDetails?.address || 'Not provided'}
- Hours: ${currentShop.shopDetails?.openingHours || '9AM-9PM'}
- Closed: ${currentShop.shopDetails?.closingDays || 'Never'}
- Reception: ${currentShop.shopDetails?.receptionNumber || 'Not provided'}
- About: ${currentShop.shopDetails?.about || ''}
- Instagram: ${currentShop.shopDetails?.instagram || ''},



Live services: ${JSON.stringify(localCatalog)}
previous messages : ${JSON.stringify(messages)}

"If customer asks to order, take their order details 
and confirm it's been noted. Tell them shop will 
confirm shortly."

STRICT RULES:
strict - for message of greeting like hi, hello etc... or any other message which is not a question welcome them to the shop warmly.
1. If asked price → just say the price. Nothing else. Example: "Haircut ₹70 hai bhai! 💈"
2. Reply in same language as customer (Hinglish/Hindi/English)
3. MAX 1-2 lines. Never write paragraphs.
4. Never mention appointments unless customer asks about booking
5. Never suggest calling reception unless you don't know the answer
6. Only use info above. Never make up prices or services.
7. Be warm but extremely brief.
8. When asked about anyproduct -> give a detailed description of the product or service with price and its description.
`;

        const groq = new Groq({ apiKey: merchantKey });

        const classifyQuery = async (text) => {
        const res = await groq.chat.completions.create({
            messages: [{
                role: 'user',
                content: `Classify this message into ONE word only — either "appointment" or "general" or "order".

                        Reply with ONLY one word: "appointment" or "general" or "order"

                        Classify as "appointment" ONLY if the customer is explicitly trying to:
                            - Book a time slot
                            - Schedule a visit  
                            - Ask about availability for a specific time
                            - Cancel or reschedule a booking
                    
                        Classify as "general" for everything including:
                            - Asking prices
                            - Asking about services
                            - Greeting (hi, hello, haan)
                            - Asking location or hours
                            - Any vague messages

                        Classify as "order" ONLY if the customer is explicitly trying to:
                            -order something
                            - Ask about order status
                            - try or want to place an order
                            

Message: "${text}"

Reply with one word only:`
            }],
            model: 'qwen/qwen3.6-27b', 
            });

            let ans = res.choices[0].message.content;
            ans = ans.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            console.log(ans);
            return ans;

        };

        const type = await classifyQuery(customerQuery); // "appointment" or "general"

    if (type === 'appointment') {
    // Save as lead

        const existingLead = await Lead.findOne({ 
            shopId: shopId, 
            customerPhone: customerPhone,
        });

        if (existingLead) {
            // Lead exists! Don't create a new one. Just send a reminder ACK.
            await sendMessage(shopId, customerPhone, 
                "Bhai aapki request humare paas already noted hai! Hum bohot jald aapse contact karenge. Or you can try contacting our reception, Should i share the number?"
            );
        } else {
            // No active lead found. Create a brand new one.
            await Lead.create({
                shopId,
                customerPhone,
                query: customerQuery,
                type: 'appointment',
                status: 'new'
            });

            // Send standard ACK
            await sendMessage(shopId, customerPhone, 
                "Bhai aapki request note kar li hai! Hum jald hi aapse contact karenge appointment confirm karne ke liye. Thanks for contacting"
            );
        }
    }else if(type === 'order'){
        // Save as lead
        const existingLead = await Lead.findOne({ 
            shopId: shopId, 
            customerPhone: customerPhone,
        });
        if (existingLead) {
            // Lead exists! Don't create a new one. Just send a reminder ACK.
            await sendMessage(shopId, customerPhone, 
                "Bhai aapki request humare paas already noted hai! Hum bohot jald aapse contact karenge. Or you can try contacting our reception, Should i share the number?"
            );
        }else{
                await Lead.create({
                shopId,
                customerPhone,
                query: customerQuery,
                type: 'order',
                status: 'new'
            });

            // Send standard ACK
            await sendMessage(shopId, customerPhone, 
                "Bhai aapki request note kar li hai! Hum jald hi aapse contact karenge order confirm karne ke liye. Thanks for contacting"
            );
            
        }} else{

       const sock = getSession(shopId);
const jid = customerPhone.includes('@s.whatsapp.net')
    ? customerPhone
    : `${customerPhone}@s.whatsapp.net`;

// Start typing
if (sock) {
    try {
        await sock.sendPresenceUpdate('composing', jid);
    } catch (err) {
        console.log('Typing start failed:', err.message);
    }
}

// Groq runs WHILE typing indicator is active
const completion = await groq.chat.completions.create({
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: customerQuery }
    ],
    model: 'qwen/qwen3.6-27b'
});

// Stop typing only after Groq finishes


let reply = completion.choices[0].message.content;
reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        // Save outbound message
        await Message.create({
            shopId,
            customerPhone,
            text: reply,
            direction: 'outbound'
        });

        await sendMessage(shopId, customerPhone, reply);
        
        if (sock) {
    try {
        await sock.sendPresenceUpdate('paused', jid);
    } catch (err) {
        console.log('Typing stop failed:', err.message);
    }
}

    }

    } catch (err) {
        console.error(`Webhook handler error for shop ${shopId}:`, err);
    }
};