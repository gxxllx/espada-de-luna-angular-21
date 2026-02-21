export const environment = {
  production: _NGX_ENV_.NODE_ENV === 'production',
  apiUrl: _NGX_ENV_.NG_APP_API_URL,
  googleClientId: _NGX_ENV_.NG_APP_GOOGLE_CLIENT_ID,
  isAdmin: false,
};
