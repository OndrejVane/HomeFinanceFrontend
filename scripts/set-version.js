const { writeFileSync } = require('fs');
const { version } = require('../package.json');

const content = `export const version = '${version}';`;
writeFileSync('./src/environments/version.ts', content);
