import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { ChatGroq } from '@langchain/groq';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from '@langchain/tavily';

// Tool configuration — preserved from original index.js
const tool = new TavilySearch({
    maxResults: 3,
    topic: 'general',
});

const tools = [tool];
const toolNode = new ToolNode(tools);

// LLM configuration — preserved from original index.js
const llm = new ChatGroq({
    model: 'openai/gpt-oss-120b',
    temperature: 0,
    maxRetries: 2,
}).bindTools(tools);

// callModel node function — preserved from original index.js
async function callModel(state) {
    console.log('Calling LLM....');
    const response = await llm.invoke(state.messages);
    return { messages: [response] };
}

// shouldContinue conditional edge function — preserved from original index.js
function shouldContinue(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'tools';
    }
    return '__end__';
}

// Build the workflow — preserved from original index.js
const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addEdge('tools', 'agent')
    .addConditionalEdges('agent', shouldContinue);

// Lazy-initialized compiled app — created after DB connects to reuse Mongoose connection
let app = null;

function getApp() {
    if (!app) {
        // Reuse the existing Mongoose MongoClient — no separate auth needed
        const mongoClient = mongoose.connection.getClient();
        const checkpointer = new MongoDBSaver({ client: mongoClient });
        app = workflow.compile({ checkpointer });
        console.log('LangGraph app compiled with MongoDBSaver (reusing Mongoose connection).');
    }
    return app;
}

/**
 * Sends a message to the LangGraph AI agent and retrieves the response.
 * @param {string} messageText - The user message text
 * @param {string} sessionId   - The session identifier (used as thread_id)
 * @returns {Promise<string>}  The response content from the agent
 */
export async function sendMessageToAgent(messageText, sessionId) {
    const agentApp = getApp();

    const finalState = await agentApp.invoke(
        {
            messages: [{ role: 'user', content: messageText }],
        },
        { configurable: { thread_id: sessionId } }
    );

    const lastMessage = finalState.messages[finalState.messages.length - 1];
    return lastMessage.content;
}
