# LinkedIn API Integration Specification

This document outlines the integration with LinkedIn's API for authentication and content sharing capabilities.

## Authentication

### OAuth 2.0 Configuration

LinkedIn uses OAuth 2.0 for authentication. You'll need to set up your application in the LinkedIn Developer Portal:

1. Create an application at https://www.linkedin.com/developers/
2. Configure OAuth 2.0 settings:
   ```
   Authorization URL: https://www.linkedin.com/oauth/v2/authorization
   Token URL: https://www.linkedin.com/oauth/v2/accessToken
   Redirect URI: http://localhost:8000/auth/linkedin/callback (development)
   ```

### Required Environment Variables

```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/linkedin/callback
```

### OAuth Scopes

The application requires the following OAuth scopes:
- `openid` - OpenID Connect authentication
- `profile` - Basic profile information
- `email` - User's email address
- `w_member_social` - Ability to create and share posts

### Authentication Flow

1. User initiates authentication via `/auth/linkedin`
2. LinkedIn OAuth redirects to authorization page
3. User approves permissions
4. LinkedIn redirects to callback URL with authorization code
5. Server exchanges code for access token
6. Server fetches user profile from userinfo endpoint
7. User session is created with LinkedIn credentials

## API Endpoints

### User Profile

```
GET https://api.linkedin.com/v2/userinfo
Headers:
  Authorization: Bearer ${access_token}
```

Returns OpenID Connect user profile information including:
- `sub` - Unique identifier
- `given_name` - First name
- `family_name` - Last name
- `email` - Email address

### Share Post

```
POST https://api.linkedin.com/v2/ugcPosts
Headers:
  Authorization: Bearer ${access_token}
  Content-Type: application/json
  X-Restli-Protocol-Version: 2.0.0

Body:
{
  "author": "urn:li:person:${userId}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "Your post content"
      },
      "shareMediaCategory": "NONE"
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

### Share Link

```
POST https://api.linkedin.com/v2/ugcPosts
Headers:
  Authorization: Bearer ${access_token}
  Content-Type: application/json
  X-Restli-Protocol-Version: 2.0.0

Body:
{
  "author": "urn:li:person:${userId}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "Your post content"
      },
      "shareMediaCategory": "ARTICLE",
      "media": [
        {
          "status": "READY",
          "originalUrl": "https://example.com"
        }
      ]
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

## Organization Sharing

If the user has organization permissions, posts can be made on behalf of an organization:

1. First, check for organization access:
```
GET https://api.linkedin.com/v2/organizationAcls?q=roleAssignee
```

2. If organization found, use organization URN instead of person URN:
```json
{
  "author": "urn:li:organization:${orgId}",
  // ... rest of post body
}
```

## Error Handling

Common error scenarios:

1. Authentication Errors
   - Invalid client credentials
   - Missing required scopes
   - Expired access token

2. API Errors
   - Rate limiting (429)
   - Invalid post content
   - Missing permissions

Always check response status and include error handling:
```javascript
if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`LinkedIn API error: ${errorText}`);
}
```

## Development Setup

1. Install dependencies:
   ```bash
   npm install passport passport-oauth2 express-session
   ```

2. Configure environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=8000
   SESSION_SECRET=your-session-secret
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/linkedin/callback
   ALLOWED_ORIGINS=http://localhost:8000
   ```

3. Start the server:
   ```bash
   npm run start
   ```

4. Test authentication:
   - Visit http://localhost:8000/auth/linkedin
   - Complete OAuth flow
   - Check session at http://localhost:8000/auth/status

## Security Considerations

1. Always store credentials securely
2. Use environment variables for sensitive data
3. Implement proper session management
4. Validate all user input
5. Use HTTPS in production
6. Implement proper CORS settings
7. Monitor API usage and rate limits

## References

- [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/consumer/)
- [OAuth 2.0 Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [Share API Documentation](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [Organizations API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/organizations) 