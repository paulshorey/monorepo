export const insertString = function(origString, indexPosition, stringToAdd) {
  return origString.slice(0, indexPosition)
    + stringToAdd
    + origString.slice(indexPosition);
};

export const makeid = function(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const numToSup = function(num) {
  switch (num + '') {
    case '1':
      return '¹';
    case '2':
      return '²';
    case '3':
      return '³';
    case '4':
      return '⁴';
    case '5':
      return '⁵';
    case '6':
      return '⁶';
    case '7':
      return '⁷';
    case '8':
      return '⁸';
    case '9':
      return '⁹';
    case '0':
      return '⁰';
    default:
      return '';
  }
};
