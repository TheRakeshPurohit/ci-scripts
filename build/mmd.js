const docifyFolder = require('./docifyFolder');

exports.scriptList = () => docifyFolder({
    folder: 'lib/cmd',
    concatBlock: () => '',
    concatListItem: (name) => '- [`' + name + '`](#ci-' + name.toLowerCase() + '-script)\n',
});

exports.scripts = () => docifyFolder({
    folder: 'lib/cmd',
    concatBlock: (name, src) => `
### \`ci ${name}\` Script

${src}


`,
    concatListItem: () => '',
});

exports.variableList = () => docifyFolder({
    folder: 'lib/var',
    concatBlock: () => '',
    concatListItem: (name) => '- [`' + name + '`](#' + name.toLowerCase() + '-variable)\n',
});

exports.variables = () => docifyFolder({
    folder: 'lib/var',
    concatBlock: (name, src) => `#### \`${name}\` Variable\n\n` + src + '\n\n\n',
    concatListItem: () => '',
});
