import style_to_string from '@ps/ui/helpers/style_to_string';
import { styleProps } from '@ps/ui/types/styles';

type Props = {
  /*
   * All the props that were passed to your component. Style props are prefixed with "ss".
   */
  props: styleProps;
};

export default ({ props }: Props): string => {
  const {
    theme,
    ss,
    ssAll,
    ssDesktop,
    ssLandscape,
    ssLargeDesktop,
    ssLargeTablet,
    ssLg,
    ssMobile,
    ssNotPhone,
    ssPhone,
    ssPortrait,
    ssSm,
    ssSmallPhone,
    ssTablet,
    ssTinyPhone,
    ssVeryLargeDesktop,
  } = props;

  // styled strings
  let styleString = '';

  // inline styles and media queries
  if (ss) {
    styleString += `\n${style_to_string(ss, props)}\n`;
  }
  if (ssAll) {
    styleString += `${theme?.mq.all} { ${style_to_string(ssAll, props)} }\n`;
  }
  if (ssLg) {
    styleString += `${theme?.mq.lg} { ${style_to_string(ssLg, props)} }\n`;
  }
  if (ssSm) {
    styleString += `${theme?.mq.sm} { ${style_to_string(ssSm, props)} }\n`;
  }
  if (ssDesktop) {
    styleString += `${theme?.mq.desktop} { ${style_to_string(
      ssDesktop,
      props
    )} }\n`;
  }
  if (ssMobile) {
    styleString += `${theme?.mq.mobile} { ${style_to_string(
      ssMobile,
      props
    )} }\n`;
  }
  if (ssTablet) {
    styleString += `${theme?.mq.tablet} { ${style_to_string(
      ssTablet,
      props
    )} }\n`;
  }
  if (ssLargeTablet) {
    styleString += `${theme?.mq.largeTablet} { ${style_to_string(
      ssLargeTablet,
      props
    )} }\n`;
  }
  if (ssNotPhone) {
    styleString += `${theme?.mq.notPhone} { ${style_to_string(
      ssNotPhone,
      props
    )} }\n`;
  }
  if (ssPhone) {
    styleString += `${theme?.mq.phone} { ${style_to_string(
      ssPhone,
      props
    )} }\n`;
  }
  if (ssSmallPhone) {
    styleString += `${theme?.mq.smallPhone} { ${style_to_string(
      ssSmallPhone,
      props
    )} }\n`;
  }
  if (ssTinyPhone) {
    styleString += `${theme?.mq.tinyPhone} { ${style_to_string(
      ssTinyPhone,
      props
    )} }\n`;
  }
  if (ssLargeDesktop) {
    styleString += `${theme?.mq.largeDesktop} { ${style_to_string(
      ssLargeDesktop,
      props
    )} }\n`;
  }
  if (ssVeryLargeDesktop) {
    styleString += `${theme?.mq.veryLargeDesktop} { ${style_to_string(
      ssVeryLargeDesktop,
      props
    )} }\n`;
  }
  if (ssPortrait) {
    styleString += `${theme?.mq.portrait} { ${style_to_string(
      ssPortrait,
      props
    )} }\n`;
  }
  if (ssLandscape) {
    styleString += `${theme?.mq.landscape} { ${style_to_string(
      ssLandscape,
      props
    )} }\n`;
  }

  // Cleanup used props that should not go on the DOM element
  delete props.ss;
  delete props.ssAll;
  delete props.ssDesktop;
  delete props.ssLandscape;
  delete props.ssLargeDesktop;
  delete props.ssLargeTablet;
  delete props.ssLg;
  delete props.ssMobile;
  delete props.ssNotPhone;
  delete props.ssPhone;
  delete props.ssPortrait;
  delete props.ssSm;
  delete props.ssSmallPhone;
  delete props.ssTablet;
  delete props.ssTinyPhone;
  delete props.ssVeryLargeDesktop;

  /*
   * return
   */
  return styleString;
};
