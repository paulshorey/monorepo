import React from 'react';

export default (): [boolean, (str: string) => any] => {
  const copyToClipboard = (str: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    const windoc: any = window.document;
    const el = windoc.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    windoc.body.appendChild(el);
    const selected =
      windoc.getSelection().rangeCount > 0
        ? windoc.getSelection().getRangeAt(0)
        : false;
    el.select();
    const success = windoc.execCommand('copy');
    windoc.body.removeChild(el);
    if (selected) {
      windoc.getSelection().removeAllRanges();
      windoc.getSelection().addRange(selected);
    }
    setCopied(true);
    return success;
  };

  const [copied, setCopied] = React.useState(false);

  // React.useEffect(() => () => setCopied(false), [text]);
  return [copied, copyToClipboard];
};
