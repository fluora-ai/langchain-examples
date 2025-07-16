# Fluora MCP LangChain Integration

## Overview

This project demonstrates how to integrate Fluora's Model Context Protocol (MCP) with LangChain to create an AI agent capable of interacting with various tools and services in the Fluora marketplace.

## Features

- **MCP Client Integration**: Connects to Fluora's MCP server via stdio transport
- **AI Agent Creation**: Uses Claude 3.5 Sonnet with LangChain's ReAct agent
- **Marketplace Interaction**: Search and discover available servers and tools
- **Service Operations**: Query pricing, payment methods, and execute transactions
- **Error Handling**: Comprehensive error handling and logging

## Architecture

### Components

1. **MCP Client (`initStdioClient`)**

   - Establishes connection to Fluora MCP server
   - Uses stdio transport for communication
   - Automatically installs latest fluora-mcp package via npx

2. **AI Agent**

   - Claude 3.5 Sonnet as the language model
   - LangChain ReAct agent for tool usage
   - Configured with specific prompt for Fluora operations

3. **Workflow Orchestration**
   - Sequential execution of marketplace operations
   - Context preservation across tool calls
   - Comprehensive logging and debugging

### Workflow Steps

1. **Server Discovery**: Search for available servers on Fluora marketplace
2. **Tool Enumeration**: List tools available from specific servers (e.g., PDF shift)
3. **Pricing Query**: Retrieve pricing information for services
4. **Payment Methods**: Get available payment options
5. **Transaction Execution**: Perform sample purchase with specified parameters

## Prerequisites

### Environment Variables

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Dependencies

- Node.js 18+
- npm or yarn
- Valid Anthropic API key for Claude access

## Installation

```bash
# Install dependencies
npm install

# Install TypeScript globally (if not already installed)
npm install -g typescript

# Install ts-node for direct TypeScript execution
npm install -g ts-node
```

## Usage

### Basic Execution

```bash
# Run the application
npm start

# Or run directly with ts-node
npx ts-node src/index.ts
```

### Development

```bash
# Build the project
npm run build

# Run in development mode with file watching
npm run dev
```

## Code Structure

### Type Definitions

The application includes TypeScript interfaces for better type safety:

- `ToolResponse`: Structure for storing conversation history
- Environment variable declarations for required API keys

### Error Handling

- All async operations are wrapped in try-catch blocks
- Comprehensive error logging
- Graceful degradation when tools fail

### Logging

The application provides detailed console output:

- Step-by-step operation progress
- Tool response contents
- Error messages and stack traces
- Transaction results

## Configuration

### MCP Client Configuration

```typescript
const client = new Client({
  name: "langchain-client",
  version: "1.0.0",
});
```

### Agent Configuration

```typescript
const agent = createReactAgent({
  llm: claude,
  tools,
  prompt: "Custom prompt for Fluora operations...",
});
```

## API Reference

### `initStdioClient()`

Initializes and connects the MCP client.

**Returns**: `Promise<Client>` - Connected MCP client instance

**Throws**: Error if connection fails

### `main()`

Main application function that orchestrates the complete workflow.

**Throws**: Error if any step in the workflow fails

## Troubleshooting

### Common Issues

1. **Connection Failures**

   - Ensure network connectivity
   - Verify fluora-mcp package is accessible
   - Check npm/npx permissions

2. **API Key Issues**

   - Verify ANTHROPIC_API_KEY is set correctly
   - Check API key validity and permissions
   - Ensure .env file is in project root

3. **Type Errors**
   - Run `npm run build` to check for TypeScript errors
   - Verify all dependencies are installed
   - Check for version compatibility issues

### Debug Mode

Enable verbose logging by modifying the console.log statements or adding:

```typescript
console.log("Debug info:", JSON.stringify(data, null, 2));
```

## Best Practices

1. **Error Handling**: Always wrap async operations in try-catch blocks
2. **Type Safety**: Use TypeScript interfaces for better code maintainability
3. **Logging**: Include comprehensive logging for debugging
4. **Resource Cleanup**: Properly close connections and clean up resources
5. **Security**: Never commit API keys to version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper documentation
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

- Check the troubleshooting section
- Review the Fluora MCP documentation
- Contact Fluora support for marketplace-specific issues
