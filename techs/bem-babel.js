var fs = require('vow-fs'),
    path = require('path'),
    vow = require('vow'),
    webpack = require('webpack'),
    RESOLVE_ROOT = path.resolve(__dirname, '../node_modules');

function runWebpack(entry, targetDir, target) {
    var deferred = vow.defer(),
        config = {
            entry : entry,
            output : {
                path : targetDir,
                filename : target
            },
            resolveLoader : {
                root : RESOLVE_ROOT
            },
            resolve : {
                fallback : RESOLVE_ROOT
            },
            module : {
                loaders : [
                    {
                        test : /\.js$/,
                        loader : 'babel-loader',
                        query : {
                            optional : ['runtime'],
                            plugins : require.resolve('babel-plugin-bem'),
                            loose : ['es6.modules']
                        }
                    }
                ]
            }
        };

    webpack(config, function(err, stats) {
        if(err) return deferred.reject(err);
        deferred.resolve(stats.toJson());
    });

    return deferred.promise();
}

module.exports = require('enb/lib/build-flow').create()
    .name('bem-babel')
    .target('target', '?.browser.js')
    .useFileList(['vanilla.js', 'js', 'browser.js'])
    .builder(function(files) {
        var node = this.node,
            target = this._target,
            targetDir = node.getDir(),
            preWebpackPath = node.resolvePath('.pre-webpack.' + target),
            resultPath = node.resolvePath(target);

        return fs
            .write(
                preWebpackPath,
                files.map(function(file) {
                        return 'import \'bem-source:' + node.relativePath(file.fullname) + '\';';
                }, node).join('\n'))
            .then(function() {
                return runWebpack(preWebpackPath, targetDir, target);
            })
            .then(function(stats) {
                if(stats.errors.length) {
                    node.getLogger().logErrorAction(
                        'bem-babel',
                        path.join(node.getPath(), target),
                        stats.errors);
                    return vow.reject(stats.errors.join('\n'));
                }

                if(stats.warnings.length) {
                    node.getLogger().logWarningAction(
                        'bem-babel',
                        path.join(node.getPath(), target),
                        stats.warnings);
                }

                return resultPath;
            })
            .always(function(promise) {
                return fs.remove(preWebpackPath).then(function() { return promise; });
            });
    })
    .saver(function() {})
    .createTech();
