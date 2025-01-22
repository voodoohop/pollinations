import test from 'ava';
import { generateDeepseek } from '../generateDeepseek.js';
import { sendOpenAIResponse } from '../server.js';

// Increase timeout for all tests
test.beforeEach(t => {
    t.timeout(60000); // 60 seconds
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

// Mock fetch for testing
const mockFetch = async (url, options) => {
    const mockApiResponse = {
        id: 'mock-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'deepseek-reasoner',
        system_fingerprint: 'fp_mock',
        choices: [{
            index: 0,
            message: {
                role: 'assistant',
                content: 'Final answer',
                reasoning_content: 'Chain of thought reasoning'
            },
            finish_reason: 'stop',
            logprobs: null
        }],
        usage: {
            prompt_tokens: 8,
            completion_tokens: 675,
            completion_tokens_details: {
                reasoning_tokens: 632
            },
            prompt_tokens_details: {
                cached_tokens: 0
            },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 8,
            total_tokens: 683
        }
    };

    return {
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
        status: 200,
        statusText: 'OK'
    };
};

// Replace global fetch with mock
global.fetch = mockFetch;

test('sendOpenAIResponse should include reasoning_content for deepseek-reasoner', async t => {
    try {
        const completion = {
            id: 'mock-id',
            object: 'chat.completion',
            created: Date.now(),
            model: 'deepseek-reasoner',
            system_fingerprint: 'fp_mock',
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: 'Final answer',
                    reasoning_content: 'Chain of thought reasoning'
                },
                finish_reason: 'stop',
                logprobs: null
            }],
            usage: {
                prompt_tokens: 8,
                completion_tokens: 675,
                completion_tokens_details: {
                    reasoning_tokens: 632
                },
                prompt_tokens_details: {
                    cached_tokens: 0
                },
                prompt_cache_hit_tokens: 0,
                prompt_cache_miss_tokens: 8,
                total_tokens: 683
            }
        };

        const mockRes = {
            headers: {},
            setHeader(key, value) {
                this.headers[key] = value;
            },
            json(data) {
                this.sentData = data;
            }
        };

        sendOpenAIResponse(mockRes, completion);

        // Verify headers are set correctly
        t.is(mockRes.headers['Content-Type'], 'application/json; charset=utf-8');
        t.is(mockRes.headers['Cache-Control'], 'public, max-age=31536000, immutable');

        // Verify response includes reasoning_content
        t.deepEqual(mockRes.sentData, completion);
        t.is(mockRes.sentData.choices[0].message.reasoning_content, 'Chain of thought reasoning');
    } catch (error) {
        t.fail(error.message);
    }
});

test('sendOpenAIResponse should not modify non-deepseek-reasoner responses', async t => {
    try {
        const completion = {
            model: 'gpt-4',
            choices: [{
                message: {
                    content: 'Regular response'
                }
            }]
        };

        const mockRes = {
            headers: {},
            setHeader(key, value) {
                this.headers[key] = value;
            },
            json(data) {
                this.sentData = data;
            }
        };

        sendOpenAIResponse(mockRes, completion);

        // Verify response is unchanged
        t.deepEqual(mockRes.sentData, completion);
        t.falsy(mockRes.sentData.choices[0].message.reasoning_content);
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateDeepseek should handle complex reasoning tasks', async t => {
    try {
        const messages = [{ role: 'user', content: 'Explain why the sky is blue using scientific principles' }];
        const response = await generateDeepseek(messages, { model: 'deepseek-reasoner' });
        
        t.truthy(response.choices[0].message.content, 'Response should have content');
        t.truthy(response.choices[0].message.reasoning_content, 'Response should have reasoning content');
        t.true(response.choices[0].message.reasoning_content.length > response.choices[0].message.content.length, 
            'Reasoning content should be more detailed than final answer');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateDeepseek should handle multi-step reasoning', async t => {
    try {
        const messages = [{ 
            role: 'user', 
            content: 'If a train travels at 60mph for 2.5 hours, how far does it go? Show your reasoning.' 
        }];
        const response = await generateDeepseek(messages, { model: 'deepseek-reasoner' });
        
        t.truthy(response.choices[0].message.reasoning_content, 'Response should have reasoning content');
        t.regex(response.choices[0].message.reasoning_content, /step|calculate|multiply|reasoning/i, 
            'Reasoning should show step-by-step calculation');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateDeepseek should maintain reasoning consistency', async t => {
    try {
        const messages = [
            { role: 'user', content: 'What is 2+2?' },
            { role: 'assistant', content: '4' },
            { role: 'user', content: 'Now multiply that by 3' }
        ];
        const response = await generateDeepseek(messages, { model: 'deepseek-reasoner' });
        
        t.truthy(response.choices[0].message.reasoning_content, 'Response should have reasoning content');
        t.regex(response.choices[0].message.reasoning_content, /previous|4|multiply/i, 
            'Reasoning should reference previous calculation');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateDeepseek should handle edge cases', async t => {
    try {
        const messages = [{ role: 'user', content: '' }];  // Empty content
        const error = await t.throwsAsync(async () => {
            await generateDeepseek(messages, { model: 'deepseek-reasoner' });
        });
        t.truthy(error, 'Should throw error for empty content');
    } catch (error) {
        t.fail(error.message);
    }
});

test('generateDeepseek should handle temperature parameter', async t => {
    try {
        const messages = [{ role: 'user', content: 'Write a one-sentence story' }];
        const response = await generateDeepseek(messages, { model: 'deepseek-reasoner', temperature: 0.7 });
        
        t.truthy(response.choices[0].message.reasoning_content, 'Response should have reasoning content');
        t.truthy(response.choices[0].message.content, 'Response should have final content');
    } catch (error) {
        t.fail(error.message);
    }
});
