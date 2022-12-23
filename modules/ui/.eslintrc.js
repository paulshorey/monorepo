const preset = require('./.eslint.preset.cjs')(__dirname);

preset.rules['no-console'] = 'off';
preset.rules['react/display-name'] = 'off';
preset.rules['import/newline-after-import'] = 'warn';

module.exports = preset;
