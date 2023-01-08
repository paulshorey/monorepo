/**
 * Expects formData array containing each field
 *    Checks if each field is valid. Returns object of field errors, plus extra properties _clean and _valid
 * @param formData {object} - see example:
 *    {
 *      email: {
 *        name: 'email',
 *        value: '',
 *        type: 'email', // if type==='email' then no need to put email in tests object. It will automatically check email format
 *        tests: {
 *          'email':'Custom error message for email field',
 *          'required':true
 *        }
 *      },
 *      fullName: {
 *        name: 'fullName',
 *        value: '',
 *        type: 'text',
 *        tests: {
 *          '[\w]+ [\w]+': 'Please enter both your first and last names',
 *          'required':true
 *        }
 *      }
 *    ]
 * @param formData.fieldName.value {object} - value for the form field input
 * @param formData.fieldName.tests {string} - key/value pairs, where:
 *    key = string to use from pre-defined dictionary, or string to build RegExp for custom test (value.test(new RegExp(keyIsThisValue)))
 *    value = error message to show if field value is invalid. Set to "true" to use from pre-defined dictionary. Default: invalid.
 * @returns {object} - containing error message for each key (each key being the name of the form field)
 *    IMPORTANT: messages object also contains 2 other properties: _valid and _clean, describing the whole form, not individual fields.
 */
export default function (formData = {}) {
  let lib = {
    required: ['.+', 'required'],
    email: ['^[\\w\\d]+[^\\s@]*[\\w\\d]+@[^\\s@]+\\.[^\\s@]+$', 'Email address is invalid'],
    ein: ['^[0-9]{2}-[0-9]{7}$','EIN must be 00-0000000 format']
  };
  let messages = {};
  messages._valid = true;
  messages._clean = true;

  for (let name in formData) {
    let field = formData[name];
    let value = field.value ? field.value.toString() : '';
    if (value) messages._clean = false;
    let tests = {};
    if (field.type === 'email' && !field.tests?.email) {
      if (!field.tests) field.tests = {};
      field.tests.email = true;
    }
    if (typeof field.tests === 'object') {
      // required test must always be first in list
      // if (field.tests['required']) {
      //   tests['required'] = field.tests['required'];
      // }
      for (let testStr in field.tests) {
        tests[testStr] = field.tests[testStr];
      }
      // test
      for (let testStr in tests) {
        // expression to use in new RegExp
        let testExp = lib[testStr] ? lib[testStr][0] : testStr;
        // error message to show
        let testErrorMessage = field.tests[testStr];
        if (typeof testErrorMessage !== 'string' || testErrorMessage.length < 5) {
          if (lib[testStr]) {
            testErrorMessage = lib[testStr][1];
          } else {
            testErrorMessage = 'invalid';
            console.warn('validation failed from RegExp(/' + testExp + '/)');
          }
        }
        // perform test on value
        if (!new RegExp(testExp).test(value)) {
          messages[name] = testErrorMessage;
          messages._valid = false;
        }
      }
    }
  }
  return messages;
}
