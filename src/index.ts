import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import "dotenv/config";


const initStdioClient = async () => {
  const client = new Client({
    name: "langchain-client",
    version: "1.0.0",
  });
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "fluora-mcp@latest"],
  });
  await client.connect(transport);
  return client;
};

async function main() {
  const stdioClient = await initStdioClient();
  const toolResponses = [];
  const claude = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20241022',
  });
  const tools = await loadMcpTools("fluora-mcp", stdioClient as any);
  const agent = createReactAgent({
    llm: claude,
    tools,
    prompt: "You are a helpful assistant that can help with tasks. You have access to the following tools: searchFluora, listTools, callServerTool. You are given a task and you need to complete it using the tools. You need to return the tool response as JSON, no explanations. You have to use the mcp tools to complete the task.",
  });

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
  toolResponses.push({
    role: "user",
    content: result.messages.slice(-2)[0].content,
  });
  console.log(result.messages.slice(-2)[0].content);

  console.log("Listing tools from the PDF shift server");
  const listTools = await agent.invoke({
    messages: [
      ...toolResponses,
      { role: "user", content: "List tools from the PDF shift server" },
    ],
  });
  toolResponses.push({
    role: "user",
    content: listTools.messages.slice(-2)[0].content,
  });
  console.log(listTools.messages.slice(-2)[0].content);

  console.log(...toolResponses);

  console.log("Pricing listing");
  const pricingListing = await agent.invoke({
    messages: [
      ...toolResponses,
      {
        role: "user",
        content: `Pricing listing`,
      },
    ],
  });
  toolResponses.push({
    role: "user",
    content: pricingListing.messages.slice(-2)[0].content,
  });
  console.log(pricingListing.messages.slice(-2)[0].content);

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
  toolResponses.push({
    role: "user",
    content: paymentMethods.messages.slice(-2)[0].content,
  });
  console.log(paymentMethods.messages.slice(-2)[0].content);

  console.log("Making a purchase");
  const makePurchase = await agent.invoke({
    messages: [
      ...toolResponses,
      {
        role: "user",
        content: "Call the 'make-purchase' tool. Convert this website: https://www.fluora.ai and use base sepolia as payment method",
      },
    ],
  });
  console.log(makePurchase.messages.slice(-2)[0].content);
}

main().catch(console.error);
