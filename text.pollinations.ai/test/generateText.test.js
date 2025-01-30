import test from 'ava';
import { generateText as generateTextOpenai } from '../generateTextOpenai.js';
import generateTextHuggingface from '../generateTextHuggingface.js';
import { generateTextScaleway } from '../generateTextScaleway.js';

// Increase timeout for all tests
test.beforeEach(t => {
    t.timeout(30000); // 30 seconds
});

// Helper function to wait for all promises to settle
const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 100));

test.afterEach(async () => {
    await waitForPromises();
});

// Add cleanup after all tests
test.after.always(async () => {
    await waitForPromises();
    // Force Node to exit after a reasonable timeout if something is still hanging
    setTimeout(() => process.exit(0), 1000);
});

// OpenAI Tests
test('generateTextOpenai should handle basic text generation', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextOpenai(messages, {});
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle system messages', async t => {
    try {
        const messages = [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Hello' }
        ];
        const response = await generateTextOpenai(messages, {});
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle temperature parameter', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextOpenai(messages, { temperature: 0.7 });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle jsonMode', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextOpenai(messages, { jsonMode: true });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle long messages', async t => {
    try {
        const longContent = 'a'.repeat(260000);
        const messages = [{ role: 'user', content: longContent }];
        const error = await t.throwsAsync(async () => {
            await generateTextOpenai(messages, {});
        });
        t.truthy(error.message.includes('Input text exceeds maximum length'), 'Should throw an error for long messages');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle search tool', async t => {
    try {
        const messages = [{ role: 'user', content: 'What is the weather in London?' }];
        const response = await generateTextOpenai(messages, {}, true);
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle seed parameter', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextOpenai(messages, { seed: 42 });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle array content', async t => {
    try {
        const messages = [{
            role: 'user',
            content: [
                { type: 'text', text: 'Hello' },
                { type: 'text', text: 'World' }
            ]
        }];
        const response = await generateTextOpenai(messages, {});
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle web search', async t => {
    try {
        const messages = [{ role: 'user', content: 'Search for information about OpenAI' }];
        const response = await generateTextOpenai(messages, {}, true);
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle searchgpt model', async t => {
    try {
        const messages = [{ 
            role: 'user', 
            content: 'What are the latest developments in quantum computing? Please search the web for recent breakthroughs.' 
        }];
        const response = await generateTextOpenai(messages, { model: 'searchgpt' }, true);
        t.truthy(response, 'Response should not be empty');
        t.truthy(response.choices && response.choices.length > 0, 'Should have a response with choices');
        t.truthy(response.choices[0].message.content, 'Should have content in response');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle web scraping', async t => {
    try {
        const messages = [{ 
            role: 'user', 
            content: 'Can you scrape and summarize the content from https://en.wikipedia.org/wiki/Main_Page?' 
        }];
        const response = await generateTextOpenai(messages, { model: 'searchgpt' }, true);
        t.truthy(response, 'Response should not be empty');
        t.truthy(response.choices && response.choices.length > 0, 'Should have a response with choices');
        t.truthy(response.choices[0].message.content, 'Should have content in response');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle long messages with content array', async t => {
    try {
        const messages = [{
            role: 'user',
            content: Array(10).fill('This is a very long message. ').map(msg => ({
                type: 'text',
                text: msg
            }))
        }];
        await generateTextOpenai(messages, {});
        t.pass();
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle too long messages', async t => {
    try {
        const messages = [{
            role: 'user',
            content: Array(20000).fill('This is a very long message. ').join('')
        }];
        await generateTextOpenai(messages, {});
        t.fail('Should have thrown error');
    } catch (error) {
        t.truthy(error.message.includes('exceeds maximum length'));
    }
});

test('generateTextOpenai should handle jsonMode with existing system message', async t => {
    try {
        const messages = [
            { role: 'system', content: 'Be helpful' },
            { role: 'user', content: 'Hello' }
        ];
        await generateTextOpenai(messages, { jsonMode: true });
        t.pass();
    } catch (error) {
        t.fail(error.message);
    }
});

// Additional Vision API Tests
test('generateTextOpenai should handle invalid image URL', async t => {
    try {
        const messages = [{
            role: "user",
            content: [
                { type: "text", text: "What's in this image?" },
                {
                    type: "image_url",
                    image_url: { url: "https://invalid-url-that-does-not-exist.jpg" }
                }
            ]
        }];
        
        await generateTextOpenai(messages, { model: 'openai-large' });
        t.fail('Should have thrown error for invalid image URL');
    } catch (error) {
        t.truthy(error, 'Should throw an error for invalid image URL');
    }
});

test('generateTextOpenai should handle multiple images in request', async t => {
    try {
        const messages = [{
            role: "user",
            content: [
                { type: "text", text: "Compare these two images" },
                {
                    type: "image_url",
                    image_url: { url: "https://image.pollinations.ai/prompt/red%20apple?width=512&height=512&seed=123&nologo=true" }
                },
                {
                    type: "image_url",
                    image_url: { url: "https://image.pollinations.ai/prompt/green%20apple?width=512&height=512&seed=456&nologo=true" }
                }
            ]
        }];
        
        const response = await generateTextOpenai(messages, { model: 'openai-large' });
        t.truthy(response.choices[0].message.content, 'Should provide comparison of both images');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle function calling', async t => {
    try {
        const messages = [{ role: 'user', content: 'What\'s the weather in London?' }];
        const functions = [{
            name: 'get_weather',
            description: 'Get the weather in a location',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The city and state, e.g. San Francisco, CA'
                    }
                },
                required: ['location']
            }
        }];
        
        const response = await generateTextOpenai(messages, { 
            functions: functions,
            function_call: 'auto'
        });
        
        t.truthy(response, 'Response should not be empty');
        t.true('choices' in response, 'Response should have choices property');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextOpenai should handle detailed image analysis', async t => {
    try {
        const messages = [{
            role: "user",
            content: [
                { type: "text", text: "Analyze this image in detail, including colors, composition, and any text visible" },
                {
                    type: "image_url",
                    image_url: { url: "https://image.pollinations.ai/prompt/colorful%20abstract%20painting%20with%20text?width=512&height=512&seed=789&nologo=true" }
                }
            ]
        }];
        
        const response = await generateTextOpenai(messages, { 
            model: 'openai-large',
            max_tokens: 500,
            temperature: 0
        });
        
        t.truthy(response.choices[0].message.content, 'Should provide detailed image analysis');
        const content = response.choices[0].message.content.toLowerCase();
        t.true(
            content.includes('color') || 
            content.includes('composition') || 
            content.includes('text'),
            'Response should include detailed analysis aspects'
        );
    } catch (error) {
        t.fail(error.message);
    }
});

// Vision API Tests
test('generateTextOpenai should identify content in image', async t => {
    try {
        const messages = [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "What's in this image?"
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: "https://image.pollinations.ai/prompt/a%20red%20apple%20on%20a%20white%20table?width=512&height=512&seed=123&nologo=true"
                        }
                    }
                ]
            }
        ];
        
        console.log('Making request with messages:', JSON.stringify(messages, null, 2));
        console.log('Using model: openai-large');
        
        const response = await generateTextOpenai(messages, { 
            model: 'openai-large',
            max_tokens: 300,
            temperature: 0
        });
        
        console.log('Full response:', JSON.stringify(response, null, 2));
        
        t.truthy(response, 'Response should not be null');
        if (!response) {
            console.error('Response is null');
            t.fail('Response is null');
            return;
        }

        // Check if response has choices array with at least one item
        t.true(Array.isArray(response.choices), 'Response should have choices array');
        t.true(response.choices.length > 0, 'Response should have at least one choice');

        const firstChoice = response.choices[0];
        t.truthy(firstChoice.message, 'First choice should have message');
        t.truthy(firstChoice.message.content, 'Message should have content');

        const content = firstChoice.message.content.toLowerCase();
        console.log('Response content:', content);
        t.true(content.includes('apple') || content.includes('red') || content.includes('table'), 'Response should describe the apple on the table');
    } catch (error) {
        console.error('Error details:', error);
        if (error.response) {
            console.error('Error response:', JSON.stringify(error.response, null, 2));
        }
        if (error.request) {
            console.error('Error request:', JSON.stringify(error.request, null, 2));
        }
        t.fail(error.message);
    }
});

// Huggingface Tests
test('generateTextHuggingface should handle basic text generation', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextHuggingface(messages, {});
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextHuggingface should handle system messages', async t => {
    try {
        const messages = [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Hello' }
        ];
        const response = await generateTextHuggingface(messages, {});
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextHuggingface should handle empty messages', async t => {
    try {
        await generateTextHuggingface([], {});
        t.fail('Should have thrown error for empty messages');
    } catch (error) {
        t.truthy(error, 'Should throw an error for empty messages');
    }
});

test('generateTextHuggingface should handle invalid messages format', async t => {
    try {
        await generateTextHuggingface([{ invalid: 'format' }], {});
        t.fail('Should have thrown error for invalid message format');
    } catch (error) {
        t.truthy(error, 'Should throw an error for invalid message format');
    }
});

test('generateTextHuggingface should handle jsonMode', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextHuggingface(messages, { jsonMode: true });
        t.pass();
    } catch (error) {
        t.fail(error.message);
    }
});

// Scaleway Tests
test('generateTextScaleway should handle basic text generation', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextScaleway(messages, {});
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextScaleway should handle temperature parameter', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextScaleway(messages, { temperature: 0.7 });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextScaleway should handle qwen-coder model', async t => {
    try {
        const messages = [{ role: 'user', content: 'Write a simple hello world in Python' }];
        const response = await generateTextScaleway(messages, { model: 'qwen-coder' });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextScaleway should handle llama model', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextScaleway(messages, { model: 'llama' });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextScaleway should handle seed parameter', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextScaleway(messages, { seed: 42 });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextScaleway should handle jsonMode without system message', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextScaleway(messages, { jsonMode: true });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextScaleway should handle jsonMode with existing system message', async t => {
    try {
        const messages = [
            { role: 'system', content: 'Be helpful' },
            { role: 'user', content: 'Hello' }
        ];
        const response = await generateTextScaleway(messages, { jsonMode: true });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateTextScaleway should use default model when invalid model specified', async t => {
    try {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await generateTextScaleway(messages, { model: 'invalid-model' });
        t.truthy(response, 'Response should not be empty');
    } catch (error) {
        t.fail(error.message);
    }
});
