/**
 * Fluora MCP LangChain Integration Example
 *
 * This application demonstrates how to integrate Fluora's Model Context Protocol (MCP)
 * with LangChain to create an AI agent that can interact with various tools and services.
 *
 * Features:
 * - Initialize MCP client connection to Fluora services
 * - Create a ReAct agent using Claude 3.5 Sonnet
 * - Search and interact with Fluora marketplace
 * - Query pricing and payment methods
 * - Execute purchase transactions
 *
 * Quick Start:
 * 1. Set ANTHROPIC_API_KEY in .env file
 * 2. Run: npm install
 * 3. Run: npm start
 *
 * Code Flow:
 * 1. initStdioClient() - Connect to Fluora MCP server
 * 2. main() - Orchestrate the complete workflow:
 *    a. Search servers on Fluora marketplace
 *    b. List tools from PDF shift server
 *    c. Query pricing information
 *    d. Get payment methods
 *    e. Execute sample purchase
 *
 * @author Fluora AI
 * @version 1.0.0
 */

import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import "dotenv/config";

/**
 * Interface for storing conversation history and tool responses
 * Compatible with LangChain's message format
 */
interface ToolResponse {
  role: "user" | "assistant";
  content: string;
}

/**
 * Initializes a Model Context Protocol (MCP) client for communicating with Fluora services.
 *
 * This function creates a client that communicates via standard input/output (stdio)
 * with the Fluora MCP server. The client is configured to use the latest version
 * of the fluora-mcp package via npx.
 *
 * @returns {Promise<Client>} A connected MCP client instance
 * @throws {Error} If the client fails to connect to the transport
 */
const initStdioClient = async () => {
  // Create a new MCP client with identification metadata
  const client = new Client({
    name: "langchain-client",
    version: "1.0.0",
  });

  // Configure stdio transport to communicate with Fluora MCP server
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "fluora-mcp@latest"],
  });

  // Establish connection to the MCP server
  await client.connect(transport);
  return client;
};

/**
 * Main application function that demonstrates the complete Fluora MCP workflow.
 *
 * This function orchestrates a series of operations:
 * 1. Initializes MCP client and AI agent
 * 2. Searches for available servers on Fluora
 * 3. Lists tools from PDF shift server
 * 4. Queries pricing information
 * 5. Retrieves payment methods
 * 6. Executes a sample purchase transaction
 *
 * All interactions are logged to the console for debugging and monitoring.
 *
 * @throws {Error} If any step in the workflow fails
 */
async function main() {
  // Initialize the MCP client connection
  const stdioClient = await initStdioClient();

  // Array to store conversation history and tool responses
  const toolResponses: any[] = [];

  // Initialize Claude 3.5 Sonnet as the LLM backend
  const claude = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-5-sonnet-20241022",
  });

  // Load MCP tools and create a ReAct agent
  const tools = await loadMcpTools("fluora-mcp", stdioClient as any);
  const agent = createReactAgent({
    llm: claude,
    tools,
    prompt:
      "You are a helpful assistant that can help with tasks. You have access to the following tools: searchFluora, listTools, callServerTool. You are given a task and you need to complete it using the tools. You need to return the tool response as JSON, no explanations. You have to use the mcp tools to complete the task.",
  });

  // =============================================================================
  // STEP 1: Search for available servers on Fluora marketplace
  // =============================================================================
  console.log("Searching servers on fluora");
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content:
          "Search servers on fluora and return all the data from the response",
      },
    ],
  });

  // Store the response for context in subsequent calls
  toolResponses.push({
    role: "user",
    content: result.messages.slice(-2)[0].content,
  });
  console.log(result.messages.slice(-2)[0].content);

  // =============================================================================
  // STEP 2: List available tools from the PDF shift server
  // =============================================================================
  console.log("Listing tools from the PDF shift server");
  const listTools = await agent.invoke({
    messages: [
      ...toolResponses,
      { role: "user", content: "List tools from the PDF shift server" },
    ],
  });

  // Add tools response to conversation history
  toolResponses.push({
    role: "user",
    content: listTools.messages.slice(-2)[0].content,
  });
  console.log(listTools.messages.slice(-2)[0].content);

  // Debug: Display all accumulated tool responses
  console.log("=== All Tool Responses ===");
  console.log(...toolResponses);

  // =============================================================================
  // STEP 3: Query pricing information
  // =============================================================================
  console.log("Pricing listing");
  const priceListing = await agent.invoke({
    messages: [
      ...toolResponses,
      {
        role: "user",
        content: `Pricing listing`,
      },
    ],
  });

  // Store pricing information for purchase decision
  toolResponses.push({
    role: "user",
    content: priceListing.messages.slice(-2)[0].content,
  });
  console.log(priceListing.messages.slice(-2)[0].content);

  // =============================================================================
  // STEP 4: Retrieve available payment methods
  // =============================================================================
  console.log("Payment methods");
  const paymentMethods = await agent.invoke({
    messages: [
      ...toolResponses,
      {
        role: "user",
        content: `Payment methods from pdf shift server`,
      },
    ],
  });

  // Store payment methods for transaction processing
  toolResponses.push({
    role: "user",
    content: paymentMethods.messages.slice(-2)[0].content,
  });
  console.log(paymentMethods.messages.slice(-2)[0].content);

  // =============================================================================
  // STEP 5: Execute a sample purchase transaction
  // =============================================================================
  console.log("Making a purchase");
  const makePurchase = await agent.invoke({
    messages: [
      ...toolResponses,
      {
        role: "user",
        content:
          "Call the 'make-purchase' tool. Convert this website: https://www.fluora.ai and use base sepolia as payment method",
      },
    ],
  });

  // Log the final purchase result
  console.log("=== Purchase Result ===");
  console.log(makePurchase.messages.slice(-2)[0].content);
}

/**
 * Application entry point with error handling.
 *
 * Executes the main workflow and catches any unhandled errors,
 * logging them to the console for debugging purposes.
 */
main().catch(console.error);
