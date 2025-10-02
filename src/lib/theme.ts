// MVP90 Terminal Theme Configuration
// Bloomberg-style design system with dark, dense, monospace typography

export const MVP90_THEME = {
  // Typography
  fonts: {
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
  },

  // Spacing (ultra-dense)
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px'
  },

  // Colors (high contrast dark theme)
  colors: {
    // Terminal colors
    terminal: {
      bg: '#0a0a0a',
      surface: '#1a1a1a',
      border: '#333333',
      text: '#ffffff',
      textMuted: '#888888',
      textDim: '#666666'
    },

    // Status colors
    status: {
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444',
      info: '#00aaff'
    },

    // Data visualization
    charts: {
      primary: '#00ff88',
      secondary: '#00aaff',
      tertiary: '#ffaa00',
      quaternary: '#ff6b35',
      quinary: '#8b5cf6'
    },

    // Score colors
    scores: {
      high: '#00ff88',    // Green for scores >= 8
      medium: '#ffaa00',  // Yellow for scores 6-7
      low: '#ff4444'      // Red for scores < 6
    }
  },

  // Component styles
  components: {
    // Cards and panels
    card: {
      background: '#1a1a1a',
      border: '1px solid #333333',
      borderRadius: '0px', // Sharp edges
      padding: '4px'
    },

    // Buttons
    button: {
      borderRadius: '0px',
      padding: '4px 8px',
      fontSize: '12px',
      fontFamily: 'mono'
    },

    // Tables
    table: {
      headerBg: '#0a0a0a',
      rowBg: '#1a1a1a',
      borderColor: '#333333',
      fontSize: '11px',
      padding: '2px 4px'
    },

    // Metrics
    metric: {
      labelSize: '10px',
      valueSize: '12px',
      padding: '2px',
      fontFamily: 'mono'
    }
  },

  // Animation preferences
  animations: {
    duration: '150ms',
    easing: 'ease-out',
    // Minimal animations - quick blinks/fades only
    transition: 'all 150ms ease-out'
  },

  // Layout
  layout: {
    sidebarWidth: '280px',
    headerHeight: '48px',
    panelGap: '4px',
    contentPadding: '8px'
  }
};

// Utility functions for theme usage
export const getScoreColor = (score: number, maxScore: number = 10): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return MVP90_THEME.colors.scores.high;
  if (percentage >= 60) return MVP90_THEME.colors.scores.medium;
  return MVP90_THEME.colors.scores.low;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'active':
    case 'completed':
      return MVP90_THEME.colors.status.success;
    case 'warning':
    case 'pending':
      return MVP90_THEME.colors.status.warning;
    case 'error':
    case 'failed':
      return MVP90_THEME.colors.status.error;
    default:
      return MVP90_THEME.colors.status.info;
  }
};

// CSS-in-JS styles for components
export const terminalStyles = {
  container: {
    fontFamily: MVP90_THEME.fonts.mono,
    backgroundColor: MVP90_THEME.colors.terminal.bg,
    color: MVP90_THEME.colors.terminal.text,
    fontSize: '12px',
    lineHeight: '1.2'
  },
  
  panel: {
    backgroundColor: MVP90_THEME.colors.terminal.surface,
    border: `1px solid ${MVP90_THEME.colors.terminal.border}`,
    borderRadius: '0px',
    padding: MVP90_THEME.spacing.sm
  },

  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${MVP90_THEME.spacing.xs} ${MVP90_THEME.spacing.sm}`,
    borderBottom: `1px solid ${MVP90_THEME.colors.terminal.border}`,
    fontSize: '11px'
  },

  sparkline: {
    height: '20px',
    width: '60px',
    display: 'inline-block'
  }
};

export default MVP90_THEME;
