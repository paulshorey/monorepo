type Input = {
  bgcolor?: string;
  bggradient?: string;
  textcolor?: string;
  textgradient?: string;
  colorscheme?: string;
};
type Output = {
  'data-bgcolor'?: string;
  'data-bggradient'?: string;
  'data-textcolor'?: string;
  'data-textgradient'?: string;
  'data-colorscheme'?: string;
};

/**
 * Modify data- attributes so CSS can "Cascade" (add light/dark colors based on parents and grandparents)
 */
export default (props: Input): Output => {
  const attrs = {};

  if (props.bgcolor || props.bggradient) {
    attrs['data-bgcolor'] = props.bgcolor || props.bggradient;
    if (props.bggradient) {
      attrs['data-bggradient'] = props.bggradient;
    }
  }
  if (props.textcolor || props.textgradient) {
    attrs['data-textcolor'] = props.textcolor || props.textgradient;
    if (props.textgradient) {
      attrs['data-textgradient'] = props.textgradient;
    }
  }
  if (attrs['data-textcolor'] === 'light') {
    attrs['data-colorscheme'] = 'dark';
  } else if (attrs['data-textcolor'] === 'dark') {
    attrs['data-colorscheme'] = 'light';
  } else if (attrs['data-bgcolor'] === 'light') {
    attrs['data-colorscheme'] = 'light';
  } else if (attrs['data-bgcolor'] === 'dark') {
    attrs['data-colorscheme'] = 'dark';
  } else if (attrs['data-bggradient'] === 'light') {
    attrs['data-colorscheme'] = 'light';
  } else if (attrs['data-bggradient'] === 'dark') {
    attrs['data-colorscheme'] = 'dark';
  }

  delete props.bgcolor;
  delete props.bggradient;
  delete props.textcolor;
  delete props.textgradient;

  return attrs;
};
