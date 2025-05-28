import { ChatOpenAI } from "@langchain/openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import * as fs from "fs";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import * as path from "path";

dotenv.config();

const configPath = path.resolve(__dirname, "../mcp-servers.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

async function main() {
  const transport = new StdioClientTransport({
    command: config.mcpServers.playwright.command,
    args: config.mcpServers.playwright.args,
  });

  const client = new Client({
    name: "langchain-client",
    version: "1.0.0",
  });

  await client.connect(transport);

  const mcpTools = await client.listTools();

  console.log(mcpTools);

  const model = new ChatOpenAI({
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const executor = await initializeAgentExecutorWithOptions(
    mcpTools.tools as any,
    model,
    {
      agentType: "openai-functions",
      verbose: true,
    }
  );

  await executor.call({
    input: "List tools from the PDF shift server",
  });

  await executor.call({
    input: "Get pricing listing",
  });

  await executor.call({
    input: "Get payment methods",
  });

  const makePurchase = await executor.call({
    input: "Make a purchase using this website url: https://fluora.ai",
  });

  console.log(makePurchase);
}

main().catch(console.error);
