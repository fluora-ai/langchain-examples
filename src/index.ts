import { ChatOpenAI } from "@langchain/openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
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

  const model = new ChatOpenAI({
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4.1",
  });
  const tools = await loadMcpTools("fluora-mcp", stdioClient as any);
  const agent = createReactAgent({
    llm: model,
    tools,
  });

  console.log("Searching servers on fluora");
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Search servers on fluora" }],
  });
  console.log(result);

  console.log("Listing tools from the PDF shift server");
  const listTools = await agent.invoke({
    messages: [
      { role: "user", content: "List tools from the PDF shift server" },
    ],
  });
  console.log(listTools);

  console.log("Pricing listing");
  const pricingListing = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `Call the pricing listing tool from the server using the callServerTool.
          Pass all params to the server:
          {
            "serverId": get the serverId from the previous response,
            "mcpServerUrl": get the mcpServerUrl from the previous response,
            "toolName": "pricing-listing",
            "args": {
              "searchQuery": ""
            }
          }`,
      },
    ],
  });
  console.log(pricingListing);

  console.log("Payment methods");
  const paymentMethods = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `Call the payment methods tool from the server using the callServerTool.
          Pass all params to the server:
          {
            "serverId": get the serverId from the list servers response,
            "mcpServerUrl": get the mcpServerUrl from the list servers response,
            "toolName": "payment-methods",
            "args": {}
          }`,
      },
    ],
  });
  console.log(paymentMethods);

  console.log("Make a purchase");
  const makePurchase = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `Call the 'make-purchase' tool from the server using the callServerTool.
          Pass all params to the server:
          {
            "serverId": get the serverId from the previous response,
            "mcpServerUrl": get the mcpServerUrl from the previous response,
            "toolName": "make-purchase",
            "args": {
              "params": {
                "websiteUrl": "https://www.fluora.ai/"
              },
              "itemId": get the itemId from the pricing listing response,
              "serverWalletAddress": get the serverWalletAddress from the payment methods response,
              "itemPrice": get the itemPrice from the pricing listing response,
              "paymentMethod": "USDC_BASE_SEPOLIA",
              
            }
          }`,
      },
    ],
  });

  console.log(makePurchase);
}

main().catch(console.error);
