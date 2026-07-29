// for all the guys who are going to judge me on the basis of wrong spellings --  FUCK YOU
// Go attend an english lecture you fucking nerd

import makeWASocket, {useMultiFileAuthState,DisconnectReason,fetchLatestBaileysVersion} from '@whiskeysockets/baileys';
import {wrapSocket,PRESETS} from 'baileys-antiban';
import {Boom} from '@hapi/boom';
import qrcode from 'qrcode';
import {fileURLToPath} from 'url';
import fs from 'fs';
import path, {dirname,join} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sessions = {};
const SESSIONS_DIR = join(__dirname, '../sessions');

if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// if you know about whatsapp login session - yk that it can go dead after a few mins of inactivity
// start health check will check the session health for each shop and if the session is dead
// it will delete the session files the prevent data leak

let SESSION_HEALTH = {};
// Session health is currently empty scroll down to create session

export const startHealthCheck = (onDead) => {

    setInterval(() => {

        const now = Date.now();

        for (const [shopId, sock] of Object.entries(sessions)){

            const lastSeen = SESSION_HEALTH[shopId] || 0;
            const minutesSinceActivity = (now - lastSeen) / 1000 / 60;

            // recconneting logic for whatsapp

            if (minutesSinceActivity > 30){

                console.log(`Session Health check ping for shop ${shopId}`);
                sock.sendPresenceUpdate('available')
                    .catch(() => {
                        console.log(`Session is dead for shop ${shopId} — reconnecting`);
                        delete sessions[shopId];
                        onDead(shopId);
                    });
            }
        }
        // in every 5 min
    }, 5 * 60 * 1000); 
};


// Creates or restores a Baileys session for a shop

// shopId - MongoDB shop _id as string
// onMessage - callback(customerPhone, messageText)
// onQR - callback(qrDataURL) when QR is ready to scan
// callback() - when connected successfully

export const createSession = async (shopId, onMessage, onQR, onReady) => {

    const sessionPath = join(SESSIONS_DIR, shopId);
    const {state,saveCreds} = await useMultiFileAuthState(sessionPath);
    const {version} = await fetchLatestBaileysVersion();

    const rawSock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: (await import('pino')).default({level:'silent'}),
        // markOnline - show the agent always online even when its now typing
        markOnlineOnConnect: false,
        // sync all the previous messages when you activate the agent after a long time
        syncFullHistory: false
    });

// whatsapp constantly monitors agents sending messages like a stupid robot - PRESETS lib 
// allow us to mimic human typing behavious to prevent ban, you can turn it off/remove it
// if you dont care about your Mobile number

    const sock = wrapSocket(rawSock,{
        ...PRESETS.CONSERVATIVE,
        circuitBreaker: null,
        jidCircuitBreaker: null
    });

    console.log('Socket created for shop:', shopId);

    sock.ev.on('connection.update', (update) => {
        console.log('Connection update:', update.connection, update.qr ? 'QR available' : '');
    });

// whenever we recieve any message SESSION_HEALTH stores the time at which mssg was sent or recieved

    sock.ev.on('messages.upsert', async ({messages})=>{

        SESSION_HEALTH[shopId] = Date.now();
        console.log('NEW MESSAGE RECEIVED:',JSON.stringify(messages[0]));
        const msg = messages[0];

// crucial line as bot can reply to its own message that it just sent... hence this prevent 
// infinite loop. Also this tell bot not to reply on empty message.
    
        if (!msg || msg.key.fromMe || !msg.message){
                return;
            } 
    });

// whats app updates security keys, we must update them or we will be logged out
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
        const {connection,lastDisconnect,qr } = update;

        if(qr){

            // Convert QR to data URL so frontend can display it
            const qrDataURL = await qrcode.toDataURL(qr);
            onQR(qrDataURL);
        }

        if (connection === 'open') {
            console.log(`Shop ${shopId} WhatsApp connected`);
            sessions[shopId] = sock;
            onReady();
        }

        const reconnecting = {};

// as whatsapp is monitored by bots then can log us out, hence when our connection close we must
// check the actual cause

        if (connection === 'close'){

// we use boom to check the reason or cause of our logout
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

// delete the previous session file for the shop
            delete sessions[shopId];

// if the session close reason was not logout by user "shouldReconnect" --> true
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

// then lets create a new session

            if (shouldReconnect && !reconnecting[shopId]) {
                reconnecting[shopId] = true;
                setTimeout(() => {
                    reconnecting[shopId] = false;
                    createSession(shopId, onMessage, onQR, onReady);
                },8000);
            }   

        }
    });

// This block handles the incoming messages

    sock.ev.on('messages.upsert',async ({messages})=>{

    const msg = messages[0];

// again check that message is not a black thing or your own message
    if (!msg || msg.key.fromMe || !msg.message){
        return;
    }

// get sender's number
    const customerPhone = msg.key.remoteJidAlt || msg.key.remoteJid;

// message content
    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (!messageText){
        return;
    }

    console.log(`Sir, you got a message from ${customerPhone}: ${messageText}`);
    
// shopId is from the outer createSession closure — NOT from the message
    onMessage(customerPhone, messageText);  // only 2 args, shopId comes from closure
    });

    return sock;
};


// sending the reply from shop's whatsapp number

// {string} shopId - string
// {string} to - phone number like "919306439483"
// text - string

export const sendMessage = async (shopId, to, text, retries = 2) => {

    const sock = sessions[shopId]; 

    if (!sock) {

        console.error(`No active session for shop ${shopId}`);

        if (retries > 0) {
            console.log(`Retrying in 2 seconds - (${retries} left)`);
            await new Promise(r => setTimeout(r, 2000));
            return sendMessage(shopId, to, text, retries-1);
        }
        
        return;
    }

    if(to.includes('@g.us')){
        return;
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

    try{

        await sock.sendMessage(jid, {text},{});
        console.log(`Message sent to ${to} from shop ${shopId}`);

    }catch(err){

        if (retries > 0 && err.message?.includes('Connection Closed')){
            console.log(`Connection closed, retrying in 2s.. (${retries} left)`);
            await new Promise(r => setTimeout(r, 2000));
            return sendMessage(shopId, to, text, retries-1);
        }

        throw err;
    }
};

// Restore all sessions on server restart
// onMessage - same callback as createSession

export const restoreAllSessions = async (onMessage)=>{

    if (!fs.existsSync(SESSIONS_DIR)){
        return;
    }

    const shopIds = fs.readdirSync(SESSIONS_DIR);
    console.log(`Restoring ${shopIds.length} sessions.`);

    for (const shopId of shopIds){
        await createSession(
            shopId,
            // pass whole data for the shop.
            (customerPhone, text) => onMessage(shopId, customerPhone, text),
            () => {},
            () => console.log(`Restored session for shop ${shopId}`)
        );
    }   
};

// get session data of a particular shop
export const getSession = (shopId) => sessions[shopId];

// delete session files and logout from the shop
export const deleteSession = async (shopId) => {
    const sock = sessions[shopId];
    if (sock){
        // logout from whatsapp
        await sock.logout(); 
        delete sessions[shopId];
    }
    // Delete session files
    const sessionPath = join(__dirname, '../sessions', shopId);
    if (fs.existsSync(sessionPath)){
        fs.rmSync(sessionPath,{recursive:true,force:true});
    }
    console.log(`Shop ${shopId} WhatsApp disconnected`);
};