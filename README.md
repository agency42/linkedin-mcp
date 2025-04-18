# LinkedIn MCP Server

A Model Context Protocol (MCP) server using the TypeScript SDK for LinkedIn integration. Allows an AI agent (e.g. Claude) to authenticate with LinkedIn and share posts or links.

## Prerequisites

- Node.js (>=14) and npm
- LinkedIn Developer App:
  - Create an app at https://www.linkedin.com/developers/apps
  - Under "Products", add **Sign In with LinkedIn** (OpenID Connect) and **Share on LinkedIn**
  - **Authorized Redirect URI** must match `.env`: `http://localhost:8000/auth/linkedin/callback`
  - Copy your **Client ID** and **Client Secret** into `.env`

## Setup

```bash
git clone <repo_url>
cd linkedin-mcp
npm install
```

Create a `.env` in project root with:

```env
SESSION_SECRET=your-session-secret
AUTH_PORT=8000          # OAuth callback server port
HTTP_PORT=8001          # HTTP/SSE server port
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/linkedin/callback
```

## Running

1. **OAuth Callback Server** (must stay running):
   ```bash
   npm run dev:auth
   ```

2. **MCP Server**:
   - Via Claude Desktop:
     ```bash
     claude-desktop
     ```
   - Or manually:
     ```bash
     npm run dev
     ```
   - This starts stdio transport + HTTP+SSE server.

3. **Inspector UI**:
   ```bash
   npm run build
   npx @modelcontextprotocol/inspector node build/server.js
   ```
   - Open the Inspector in browser → **Tools**
   - Use `linkedin-share-post` or `linkedin-share-link` tools.

## Testing

1. Visit `http://localhost:8000/auth/linkedin` in browser → complete LinkedIn login.
2. Confirm “Authentication successful!”.
3. In Inspector, run sample post/link tools.
4. Verify content on your LinkedIn profile.

## Claude Desktop Integration

Configure your Claude Desktop to use the older `mcpServers` format by updating `claude-config.json`:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "node",
      "args": ["/Users/ken/Desktop/lab/linkedin-mcp/build/server.js"],
      "transport": "http",
      "url": "http://localhost:8001",
      "sseEndpoint": "/stream",
      "httpEndpoint": "/message",
      "env": {
        "SESSION_SECRET": "your-session-secret",
        "AUTH_PORT": "8000",
        "HTTP_PORT": "8001",
        "LINKEDIN_CLIENT_ID": "your-client-id",
        "LINKEDIN_CLIENT_SECRET": "your-client-secret",
        "LINKEDIN_REDIRECT_URI": "http://localhost:8000/auth/linkedin/callback"
      }
    }
  },
  "globalShortcut": "Ctrl+Space"
}
```
Save and **restart Claude Desktop** to apply changes.
