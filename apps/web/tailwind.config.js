export default {
  content: [
    './resources/js/**/*.{vue,ts}',
    '../../packages/ui/src/**/*.{vue,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif']
      },
      colors: {
        brand: {
          dark: '#052B6C',
          primary: '#2F80FF',
          muted: '#7A8CA5'
        }
      },
      fontSize: {
        base: '1.125rem'
      },
      outlineWidth: {
        3: '3px'
      }
    }
  },
  plugins: []
};
