import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { loadConfig } from './config.js';
import { storedAccessToken, storedUserId, sharePost, shareLink, loadTokenData } from './linkedinApi.js';
import { z } from 'zod';

console.error('▶ cwd:', process.cwd(), 'argv:', process.argv);

async function main() {
  console.error('Starting LinkedIn MCP Server...');
  const config = loadConfig();
  await loadTokenData(); // initialize stored credentials from file

  const server = new McpServer(
    { name: 'linkedin-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.tool(
    'linkedin-share-post',
    'Shares a text post to LinkedIn.',
    { text: z.string().min(1).describe('The content of the post to share.') },
    async ({ text }) => {
      await loadTokenData();
      if (!storedAccessToken || !storedUserId) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Authentication required. Please visit http://localhost:${config.authPort}/auth/linkedin in your browser.`,
            },
          ],
        };
      }
      try {
        const result = await sharePost(storedAccessToken, storedUserId, text);
        return {
          content: [
            {
              type: 'text',
              text: `Post shared successfully! ${result.postId ? `(Post ID: ${result.postId})` : ''}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to share post: ${error.message}` }],
        };
      }
    }
  );

  server.tool(
    'linkedin-share-link',
    'Shares a link with commentary to LinkedIn.',
    {
      text: z.string().min(1).describe('The commentary text to accompany the link.'),
      url: z.string().url().describe('The URL of the link to share.'),
    },
    async ({ text, url }) => {
      await loadTokenData();
      if (!storedAccessToken || !storedUserId) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Authentication required. Please visit http://localhost:${config.authPort}/auth/linkedin in your browser.`,
            },
          ],
        };
      }
      try {
        const result = await shareLink(storedAccessToken, storedUserId, text, url);
        return {
          content: [
            {
              type: 'text',
              text: `Link shared successfully! ${result.postId ? `(Post ID: ${result.postId})` : ''}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to share link: ${error.message}` }],
        };
      }
    }
  );

  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);
    console.error('LinkedIn MCP Server connected via stdio.');
  } catch (e: any) {
    console.error('Failed to connect MCP server:', e);
    process.exit(1);
  }

  // HTTP+SSE transport for Claude Desktop
  const app = express();
  app.use(express.json());
  const transports: Record<string, SSEServerTransport> = {};
  app.get('/stream', async (req, res) => {
    const transport = new SSEServerTransport('/message', res);
    transports[transport.sessionId] = transport;
    res.on('close', () => delete transports[transport.sessionId]);
    // Connect MCP server (handles SSE handshake internally)
    await server.connect(transport);
  });
  app.post('/message', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports[sessionId];
    if (!transport) {
      res.status(400).send('No transport found for sessionId');
      return;
    }
    // Handle incoming POST JSON-RPC using SDK method
    await transport.handlePostMessage(req as any, res as any, req.body);
  });
  app.listen(config.httpPort, () => {
    console.error(`HTTP/SSE server listening on http://localhost:${config.httpPort}`);
  });
} // close main()

main();
