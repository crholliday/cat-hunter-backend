const config = {
  API_KEY: 'your-api-key', // for api call in src/modules/listing/RefreshListings.ts
  REFRESH_MINUTES: 15, //how often refresh is called
  SESSION_SECRET: 'your-redis-session-secret',
  CLIENT_URL: 'http://localhost:8080', // for CORS setup
  COOKIE_MAX_AGE: 1000 * 60 * 60 * 24 * 7 // 7 days
}

export default config
