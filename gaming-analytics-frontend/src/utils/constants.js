export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile'
  },
  GAME: {
    ANALYTICS: '/gameAnalysis',
    SESSIONS: '/gameAnalysis/sessions',
    PERFORMANCE: '/gameAnalysis/performance'
  },
  BEHAVIOR: {
    TRACKING: '/behavior',
    MOOD: '/behavior/mood',
    ALERTS: '/behavior/alerts'
  }
};

export const THEME = {
  BREAKPOINTS: {
    mobile: '(max-width: 600px)',
    tablet: '(max-width: 960px)',
    desktop: '(min-width: 961px)'
  }
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}; 