import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';
import debug from 'debug';
import generateTextMistral from './generateTextMistral.js';
import generateTextKarma from './generateTextKarma.js';
import generateTextClaude from './generateTextClaude.js';
import wrapModelWithContext from './wrapModelWithContext.js';
import surSystemPrompt from './personas/sur.js';
import unityPrompt from './personas/unity.js';
import midijourneyPrompt from './personas/midijourney.js';
import rtistPrompt from './personas/rtist.js';
import rateLimit from 'express-rate-limit';
import PQueue from 'p-queue';
import generateTextCommandR from './generateTextCommandR.js';
import sleep from 'await-sleep';
import { availableModels } from './availableModels.js';
import { generateText } from './generateTextOpenai.js';
import { generateText as generateTextRoblox } from './generateTextOpenaiRoblox.js';
import evilPrompt from './personas/evil.js';
import generateTextHuggingface from './generateTextHuggingface.js';
import generateTextOptiLLM from './generateTextOptiLLM.js';
import { generateTextOpenRouter } from './generateTextOpenRouter.js';
import { generateDeepseek } from './generateDeepseek.js';
import { generateTextScaleway } from './generateTextScaleway.js';
import { sendToAnalytics } from './sendToAnalytics.js';
import fs from 'fs';
import path from 'path';
import { setupFeedEndpoint, sendToFeedListeners } from './feed.js';
import { getFromCache, setInCache, createHashKey } from './cache.js';

const app = express();

const log = debug('pollinations:server');
const errorLog = debug('pollinations:error');

// Remove the custom JSON parsing middleware and use the standard bodyParser
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cors());

// New route handler for root path
app.get('/', (req, res) => {
    res.redirect('https://sur.pollinations.ai');
});

// Create custom instances of Sur backed by Claude, Mistral, and Command-R
const surOpenai = wrapModelWithContext(surSystemPrompt, generateText);
const surMistral = wrapModelWithContext(surSystemPrompt, generateTextMistral);
// const surCommandR = wrapModelWithContext(surSystemPrompt, generateTextCommandR);
// Create custom instance of Unity backed by Mistral Large
const unityMistralLarge = wrapModelWithContext(unityPrompt, generateTextMistral);
// Create custom instance of Midijourney
const midijourney = wrapModelWithContext(midijourneyPrompt, generateText);
// Create custom instance of Rtist
const rtist = wrapModelWithContext(rtistPrompt, generateText);
// Create custom instance of Evil backed by Command-R
const evilCommandR = wrapModelWithContext(evilPrompt, generateTextMistral);

app.set('trust proxy', true);

// Queue setup per IP address
const queues = new Map();

function getQueue(ip) {
    if (!queues.has(ip)) {
        queues.set(ip, new PQueue({ concurrency: 1 }));
    }
    return queues.get(ip);
}

// Function to get IP address
export function getIp(req) {
    const ip = req.headers["x-bb-ip"] || req.headers["x-nf-client-connection-ip"] || req.headers["x-real-ip"] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!ip) return null;
    const ipSegments = ip.split('.').slice(0, 2).join('.');
    // if (ipSegments === "128.116")
    //     throw new Error('Pollinations cloud credits exceeded. Please try again later.');
    return ipSegments;
}

// GET /models request handler
app.get('/models', (req, res) => {
    res.json(availableModels);
});

setupFeedEndpoint(app);

// Helper function to handle both GET and POST requests
async function handleRequest(req, res, requestData) {

    log('Request data: %o', requestData);
    console.log(`${requestData.model} ${requestData.referrer} `);

    try {
        const completion = await generateTextBasedOnModel(requestData.messages, requestData);
        const responseText = completion.choices[0].message.content;

        const cacheKey = createHashKey(requestData);
        setInCache(cacheKey, completion);
        log('Generated response', responseText);
        
        sendToFeedListeners(responseText, requestData, getIp(req));

        if (requestData.stream) {
            sendAsOpenAIStream(res, completion);
        } else {
            if (requestData.plaintTextResponse) {
                sendContentResponse(res, completion);
            } else {
                sendOpenAIResponse(res, completion);
            }
        }
    } catch (error) {
        sendErrorResponse(res, error);
    }
    await sleep(8000);
}

// Helper function for consistent error responses
function sendErrorResponse(res, error, statusCode = 500) {
    errorLog('Error:', error.message);
    console.error(error.stack); // Print stack trace
    res.status(statusCode).json({
        error: {
            message: error.message,
            status: statusCode
        }
    });
}

// Helper function for consistent success responses
function sendOpenAIResponse(res, completion) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.json(completion);
}

function sendContentResponse(res, completion) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(completion.choices[0].message.content);
}

// Common function to handle request data
function getRequestData(req) {
    const bypassCode = req.query.code || (req.body && req.body.code);
    const hasValidBypassCode = bypassCode === 'BeesKnees';
    
    const ip = getIp(req);
    const model = req.params[0] || req.body?.model || 'openai';
    const temperature = parseFloat(req.query.temperature || req.body?.temperature || 0.7);
    const messages = req.body?.messages || [{ role: 'user', content: req.query.prompt || '' }];
    const stream = req.query.stream === 'true' || req.body?.stream === true;
    const referrer = req.get('Referrer') || req.headers.origin || 'unknown';
    
    return {
        ip,
        model,
        temperature,
        messages,
        stream,
        referrer,
        hasValidBypassCode,
        plaintTextResponse: true
    };
}

// Helper function to process requests with queueing and caching logic
async function processRequest(req, res, requestData) {
    const cacheKey = createHashKey(requestData);
    const cachedResponse = getFromCache(cacheKey);
    
    if (cachedResponse) {
        log('Cache hit');
        if (requestData.stream) {
            sendAsOpenAIStream(res, cachedResponse);
        } else {
            if (requestData.plaintTextResponse) {
                sendContentResponse(res, cachedResponse);
            } else {
                sendOpenAIResponse(res, cachedResponse);
            }
        }
        return;
    }

    const queue = getQueue(requestData.ip);
    
    try {
        await queue.add(async () => {
            try {
                await handleRequest(req, res, requestData);
                if (!requestData.hasValidBypassCode) {
                    await sleep(8000);
                }
            } catch (error) {
                errorLog('Error in queue:', error);
                sendErrorResponse(res, error);
                if (!requestData.hasValidBypassCode) {
                    await sleep(8000);
                }
            }
        });
    } catch (error) {
        errorLog('Queue error:', error);
        sendErrorResponse(res, error);
        if (!requestData.hasValidBypassCode) {
            await sleep(8000);
        }
    }
}

// GET request handler
app.get('/*', async (req, res) => {
    const requestData = getRequestData(req);
    try {
        await processRequest(req, res, requestData);
    } catch (error) {
        sendErrorResponse(res, error);
    }
});

// POST request handler
app.post('/', async (req, res) => {
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
        console.log('Invalid messages array. Received:', req.body.messages);
        return res.status(400).send(`Invalid messages array. Received: ${req.body.messages}`);
    }

    const requestParams = getRequestData(req);
    try {
        await processRequest(req, res, requestParams);
    } catch (error) {
        sendErrorResponse(res, error);
    }
});

app.get('/openai/models', (req, res) => {
    const models = availableModels.map(model => ({
        id: model.name,
        object: "model",
        created: Date.now(),
        owned_by: model.name
    }));
    res.json({
        object: "list",
        data: models
    });
});

// POST /openai/* request handler
app.post('/openai*', async (req, res) => {

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
        return sendErrorResponse(res, new Error('Invalid messages array'), 400);
    }

    const requestParams = getRequestData(req);
   
    try {
        await processRequest(req, res, requestParams);
    } catch (error) {
        sendErrorResponse(res, error);
    }
})

function sendAsOpenAIStream(res, completion) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: completion.choices[0].message.content }, finish_reason: "stop", index: 0 }] })}\n\n`);
    res.write('data: [DONE]\n\n');  // Add the [DONE] message for OpenAI compatibility
    res.end();
}

async function generateTextBasedOnModel(messages, options) {
    const model = options.model || 'openai';
    log('Using model:', model);

    try {
        
        const modelHandlers = {
            'deepseek': () => generateDeepseek(messages, options),
            'mistral': () => generateTextScaleway(messages, options),
            'qwen-coder': () => generateTextScaleway(messages, options),
            'qwen': () => generateTextHuggingface(messages, { ...options, model }),
            'llama': () => generateTextScaleway(messages, { ...options, model }),
            'llamalight': () => generateTextOpenRouter(messages, { ...options, model: "nousresearch/hermes-2-pro-llama-3-8b" }),
            // 'karma': () => generateTextKarma(messages, options),
            'sur': () => surOpenai(messages, options),
            'sur-mistral': () => surMistral(messages, options),
            'unity': () => unityMistralLarge(messages, options),
            'midijourney': () => midijourney(messages, options),
            'rtist': () => rtist(messages, options),
            'searchgpt': () => generateText(messages, options, true),
            'evil': () => evilCommandR(messages, options),
            // 'roblox': () => generateTextRoblox(messages, options),
            'openai': () => generateText(messages, options),
        };

        const handler = modelHandlers[model] || (() => generateText(messages, options));
        const response = await handler();
        
        return response;
    } catch (error) {
        errorLog('Error in generateTextBasedOnModel:', error);
        throw error;
    }
}

function formatAsOpenAIResponse(response, requestParams) {
    const choices = [{
        "message": {
            "content": response,
            "role": "assistant"
        },
        "finish_reason": "stop",
        "index": 0,
        "logprobs": null
    }];

    const result = {
        "created": Date.now(),
        "id": crypto.randomUUID(),
        "model": requestParams.model,
        "object": isStream ? "chat.completion.chunk" : "chat.completion",
        "choices": choices
    };
    return result;
}

app.use((req, res, next) => {
    log(`Unhandled request: ${req.method} ${req.originalUrl}`);
    next();
});

export default app; // Add this line to export the app instance
