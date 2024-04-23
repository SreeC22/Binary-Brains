import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1536px',
  },

  styles: {
    global: {
      // Apply smooth transition to all Box components
      '.smooth-transition': {
        transition: 'all 0.3s ease-in-out',
      }
    },
  },
});

export default theme;