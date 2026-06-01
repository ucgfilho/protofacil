export default {
  content: [
    './resources/js/**/*.{vue,ts}',
    '../../packages/ui/src/**/*.{vue,ts}'
  ],
  theme: {
    extend: {
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
