/**
 * Use to add syntax highlighting to SCSS strings:
 * import css from '@techytools/ui/helpers/css';
 * <Block ss={(props)=> css`
 *  padding: 10px ${props.theme.padding}px;
 * `} />
 */
export default (...args) => {
  const template = args.shift();
  const literals = args;
  let output = '';
  // append each next literal to each next template string
  // but only if it's a string or number, else just append empty string
  // TODO: support functions inside template literals (e.g. ${props => props.theme.color})
  for (let i = 0; i < template.length; i++) {
    output +=
      template[i] +
      (['string', 'number'].includes(typeof literals[i]) ? literals[i] : '');
  }
  return output;
};
