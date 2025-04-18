import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  linkedinClientId: string;
  linkedinClientSecret: string;
  linkedinRedirectUri: string;
  sessionSecret: string;
  authPort: number;
  httpPort: number;
}

export function loadConfig(): AppConfig {
  const config = {
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    linkedinRedirectUri: process.env.LINKEDIN_REDIRECT_URI,
    sessionSecret: process.env.SESSION_SECRET,
    authPort: parseInt(process.env.AUTH_PORT || '8000', 10),
    httpPort: parseInt(process.env.HTTP_PORT || '8000', 10),
  };

  if (!config.linkedinClientId || !config.linkedinClientSecret || !config.linkedinRedirectUri || !config.sessionSecret) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  return config as AppConfig;
}
