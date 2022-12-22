const theme = {
  colors: {
    link: 'blue',
  },
  fonts: {
    helvetica: 'Roboto,Helvetica,sans-serif',
  },
  breakpoints: {},
};

const width = {
  xxsmall: { num: 520 },
  xsmall: { num: 710 },
  small: { num: 924 },
  medium: { num: 1080 },
  large: { num: 1130 },
  xlarge: { num: 1440 },
  xxlarge: { num: 1920 },
};
for (let size in width) {
  let obj = {};
  obj.num = width[size].num;
  obj.str = obj.num + 'px';
  obj.max = `@media(max-width: ${obj.num}px)`;
  obj.min = `@media(min-width: ${obj.num + 1}px)`;
  theme.breakpoints[size] = obj;
}

export default theme;
