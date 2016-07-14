# enb-bem-babel

[![NPM version](https://img.shields.io/npm/v/enb-bem-babel.svg?style=flat)](https://www.npmjs.org/package/enb-bem-babel)

Available technologies:

- bem-babel

## Usage

Install the package:

~~~
$ npm install --save-dev enb-bem-babel
~~~

Add the tech to your project's `make.js`

~~~js
var bemTechs = require('enb-bem-techs'),
    fileProvideTech = require('enb/techs/file-provider')
    bemBabel = require('enb-bem-babel/techs/bem-babel');

module.exports = function(config) {
    config.node('bundle', function(node) {
        node.addTechs([
            [fileProvideTech, { target : '?.bemdecl.js' }],
            [bemTechs.levels, { levels : ['blocks'] }],
            [bemTechs.deps],
            [bemTechs.files]
            [bemBabel, { target : '?.js' }]
        ]);

        node.addTarget('?.js');
    });
};
~~~

## License

Code and documentation copyright 2015 YANDEX LLC.
Code released under the [Mozilla Public License 2.0](LICENSE.txt).
