// install extension vscode-color-picker to see previews of colors in JS files
import theme from '@techytools/ui/styles/theme';
import Link from 'next/link';

export default {
  ...theme,
  RouterLink: Link,
  header: {
    height: '50px',
  },
};
