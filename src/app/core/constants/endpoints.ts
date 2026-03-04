export const ENDPOINTS = {
  USER: {
    BASE: 'user',
    LOGIN: 'login',
    VERIFY_2FA: 'verify-2fa',
    REGISTER: 'register',
    GOOGLE_LOGIN: 'google-login',
    LOGOUT: 'logout',
    PROFILE: 'profile',
    FORGOT: 'forgot-password',
    RESET: 'reset-password',
    SEND_VERIFICATION: 'send-verification-email',
    VERIFY: 'verify-email',
  },
  CATEGORY: {
    BASE: 'category',
  },
  PRODUCT: {
    BASE: 'product',
    SLUG: 'slug',
    CATEGORY: 'category',
  },
} as const;
