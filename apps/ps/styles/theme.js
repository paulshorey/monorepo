import theme from '@techytools/ui/styles/theme';
import Link from 'next/link';
console.log('theme', theme);
export default {
  ...theme,
  RouterLink: Link,
  header: {
    height: '50px',
  },
};
