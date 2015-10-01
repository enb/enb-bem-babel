var vow = require('vow'),
    webpack = require('webpack');

module.exports = require('enb/lib/build-flow').create()
    .name('bem-babel')
    .target('target', '?.browser.js')
    .useFileList(['vanilla.js', 'js', 'browser.js'])
    .builder(function (files) {
        var res = vow.defer(),
            node = this.node,
            target = this._target,
            targetDir = node.getDir(),
            preWebpackPath = node.resolvePath('.pre-webpack.' + target),
            resultPath = node.resolvePath(target);

        fs.writeFile(
            preWebpackPath,
            files.map(function(file) {
                return 'import \'bem-source:' + file.fullname + '\';';
            }).join('\n'),
            function(err) {
                webpack(
                    {
                        entry : preWebpackPath,
                        output : {
                            path : targetDir,
                            filename : target
                        },
                        module : {
                            loaders : [
                                {
                                    test : /\.js$/,
                                    loader : 'babel-loader',
                                    query : {
                                        optional : ['runtime'],
                                        plugins : 'bem',
                                        loose : ['es6.modules']
                                    }
                                }
                            ]
                        }
                    },
                    function(err, stats) {
                        // TODO: remove preWebpackPath
                        if(err) {
                            res.reject('Fatal error in webpack');
                        } else {
                            stats = stats.toJson();
                            if(stats.errors.length) {
                                return res.reject(stats.errors.join('\n'));
                            }

                            if(stats.warnings.length) {
                                node.getLogger().logWarningAction(
                                    'bem-babel',
                                    path.join(node.getPath(), target),
                                    stats.warnings);
                            }
                            res.resolve(resultPath);
                        }
                    });
            });
        return res.promise();
    })
    .saver(function() {})
    .createTech();
