import dotenv from 'dotenv';
import fetch from 'node-fetch';
import debug from 'debug';

dotenv.config();

const log = debug('pollinations:deepseek');
const errorLog = debug('pollinations:deepseek:error');

/**
 * Generate text using the DeepSeek API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Configuration options
 * @param {string} [options.model] - Model to use for generation
 * @param {boolean} [options.jsonMode] - Whether to return JSON format
 * @param {number} [options.seed] - Seed for deterministic generation (integer between 0 and 2^32-1)
 * @param {number} [options.temperature=0.7] - Temperature for generation (between 0 and 2)
 * @param {Array} [options.tools] - Array of tools for function calling
 * @param {string} [options.tool_choice] - Tool choice for function calling
 * @returns {Promise<Object>} - API response
 */
export async function generateDeepseek(messages, options = {}) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    // Validate seed if provided
    if (options.seed !== undefined) {
        if (!Number.isInteger(options.seed) || options.seed < 0 || options.seed > Math.pow(2, 32) - 1) {
            throw new Error('Seed must be an integer between 0 and 2^32-1');
        }
    }

    // Validate temperature if provided
    const temperature = options.temperature === undefined ? 0.7 : options.temperature;
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
        throw new Error('Temperature must be a number between 0 and 2');
    }
    
    log(`[${requestId}] Starting DeepSeek generation request`, {
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
        options: {
            ...options,
            temperature
        }
    });

    try {
        const requestBody = {
            model: options.model,
            messages,
            response_format: options.jsonMode ? { type: 'json_object' } : undefined,
            max_tokens: 4096,
            stream: false,
            temperature,
            tools: options.tools,
            tool_choice: options.tool_choice,
            seed: options.seed
        };

        log(`[${requestId}] Sending request to DeepSeek API`, {
            timestamp: new Date().toISOString(),
            model: requestBody.model,
            maxTokens: requestBody.max_tokens,
            seed: requestBody.seed,
            temperature: requestBody.temperature
        });

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        log(`[${requestId}] Received response from DeepSeek API`, {
            timestamp: new Date().toISOString(),
            status: response.status,
            statusText: response.statusText,
        });

        if (!response.ok) {
            const errorText = await response.text();
            errorLog(`[${requestId}] DeepSeek API error`, {
                timestamp: new Date().toISOString(),
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const completionTime = Date.now() - startTime;

        log(`[${requestId}] Successfully generated text`, {
            timestamp: new Date().toISOString(),
            completionTimeMs: completionTime,
            modelUsed: data.model,
            promptTokens: data.usage?.prompt_tokens,
            completionTokens: data.usage?.completion_tokens,
            totalTokens: data.usage?.total_tokens,
            reasoningContent: data.choices[0]?.message?.reasoning_content,
            seed: options.seed,
            temperature
        });

        return data;
    } catch (error) {
        errorLog(`[${requestId}] Error in text generation`, {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            completionTimeMs: Date.now() - startTime
        });
        throw error;
    }
}
