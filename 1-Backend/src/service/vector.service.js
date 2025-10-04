// Import the Pinecone library
const { createModelContent } = require('@google/genai');
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding
const chatGptProject = pc.Index('chat-gpt-project');

const createMemory = async ({vectors, metadata, messageId}) => {

    await chatGptProject.upsert([{
        id: messageId,
        values: vectors,
        metadata
    }])

}

const queryMemory = async ({queryVector, limit = 5, metadata}) => {

    const data = await chatGptProject.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches
}

module.exports = {
    createMemory, 
    queryMemory
}