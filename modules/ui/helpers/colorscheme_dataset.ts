type Input = {
  'bgcolor'?: string;
  'bggradient'?: string | boolean;
  'textcolor'?: string;
  'textgradient'?: string | boolean;
  'colorscheme'?: string;
  'data-bgcolor'?: string;
  'data-bggradient'?: string | boolean;
  'data-textcolor'?: string;
  'data-textgradient'?: string | boolean;
  'data-colorscheme'?: string;
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
  /*
   * consolidate the 2 formats into 1
   */
  if (props['data-bgcolor']) {
    props.bgcolor = props['data-bgcolor'];
    delete props['data-bgcolor'];
  }
  if (props['data-bggradient']) {
    props.bggradient = props['data-bggradient'];
    delete props['data-bggradient'];
  }
  if (props['data-textcolor']) {
    props.textcolor = props['data-textcolor'];
    delete props['data-textcolor'];
  }
  if (props['data-textgradient']) {
    props.textgradient = props['data-textgradient'];
    delete props['data-textgradient'];
  }
  /*
   * HTML DOM element gets only [data-textcolor] attribute, not the plain [textcolor] prop
   */
  if (props.bgcolor || props.bggradient) {
    attrs['data-bgcolor'] = props.bgcolor || props.bggradient;
  }
  if (props.bggradient) {
    attrs['data-bggradient'] = 'true';
  }
  if (props.textcolor || props.textgradient) {
    attrs['data-textcolor'] = props.textcolor || props.textgradient;
  }
  if (props.textgradient) {
    attrs['data-textgradient'] = 'true';
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
