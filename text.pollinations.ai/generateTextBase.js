import debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

const log = debug('pollinations:text-generation');

// Helper function to ensure messages have a system message
export const ensureSystemMessage = (messages, defaultSystemMessage) => {
    if (!messages.some(m => m.role === 'system')) {
        return [{ role: 'system', content: defaultSystemMessage }, ...messages];
    }
    return messages;
};

export const createTextGenerator = ({
    endpoint,
    apiKey,
    defaultModel,
    modelMapping = {},
    customHeaders = {},
    preprocessor = null,
    customApiCall = null
}) => {
    const generateText = async (messages, options = {}) => {
        const {
            model = defaultModel,
            temperature = 0.7,
            jsonMode = false,
            seed = null,
            maxTokens = 4096,
            tools,
            toolChoice
        } = options;

        const requestId = Math.random().toString(36).substring(7);
        log(`[${requestId}] Starting text generation request`, {
            timestamp: new Date().toISOString(),
            messageCount: messages.length,
            model,
            options
        });

        // Apply preprocessor if provided
        const processedMessages = preprocessor ? 
            await preprocessor(messages, options) : 
            messages;

        const modelName = modelMapping[model] || model;

        const requestBody = {
            model: modelName,
            messages: processedMessages,
            temperature,
            max_tokens: maxTokens,
            response_format: jsonMode ? { type: 'json_object' } : undefined,
            seed,
            ...(tools && { tools }),
            ...(toolChoice && { tool_choice: toolChoice })
        };

        try {
            // Use custom API call if provided, otherwise use default fetch
            const response = customApiCall ? 
                await customApiCall(endpoint, {
                    body: JSON.stringify(requestBody),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        ...customHeaders
                    }
                }) :
                await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        ...customHeaders
                    },
                    body: JSON.stringify(requestBody)
                });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`API request failed: ${error.message || response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            log(`[${requestId}] Error during text generation:`, error);
            throw error;
        }
    };

    return generateText;
};
