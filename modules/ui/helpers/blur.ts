/**
 * This causes any DOM element that is currently in focus() to lose focus.
 */
export default () => {
  const element = document.createElement('textarea');
  document.body.appendChild(element);
  // element.setAttribute('style', 'display: none');
  element.click();
  element.focus();
  document.body.removeChild(element);
};
