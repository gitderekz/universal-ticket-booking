const path = require('path');
const i18n = require('i18n');

i18n.configure({
  locales: ['en', 'sw', 'zh', 'ru', 'es', 'fr', 'de', 'pt'],
  directory: path.join(__dirname, '../i18n/locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  cookie: 'lang',
  autoReload: true,
  updateFiles: false,
  syncFiles: false,
  objectNotation: true,
  api: {
    __: 't',
    __n: 'tn'
  }
});

module.exports = i18n;
