'use strict';

const shelljs = require('shelljs');
const chalk = require('chalk').default;
const microApp = require('@necfe/micro-app-core');
const logger = microApp.logger;

const path = require('path');

module.exports = name => {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;
    const micros = microAppConfig.micros;
    if (micros.includes(name)) {
        const microConfig = microApp(name);
        if (microConfig) {
            const root = microConfig.root;

            const pkgInfo = microAppConfig.package;
            const gitPath = (pkgInfo.devDependencies && pkgInfo.devDependencies[microConfig.name]) || (pkgInfo.dependencies && pkgInfo.dependencies[microConfig.name]) || false;
            if (gitPath) {
                logger.logo(`${chalk.yellow('Delete')}: ${root}`);
                shelljs.rm('-rf', root);
                shelljs.rm('-rf', path.join(microAppConfig.root, 'package-lock.json'));
                logger.logo('waiting...');
                shelljs.exec(`npm install -D "${gitPath}"`);
                logger.logo(`${chalk.green('Finish!')}`);
                return;
            }
        }
    } else if (name === 'all' || name === '*') {
        shelljs.rm('-rf', path.join(microAppConfig.root, 'package-lock.json'));
        const _gitPaths = micros.map(key => {
            const microConfig = microApp(key);
            if (microConfig) {
                const root = microConfig.root;

                const pkgInfo = microAppConfig.package;
                const gitPath = (pkgInfo.devDependencies && pkgInfo.devDependencies[microConfig.name]) || (pkgInfo.dependencies && pkgInfo.dependencies[microConfig.name]) || false;
                if (gitPath) {
                    return {
                        root, gitPath,
                    };
                }
            }
            return false;
        }).filter(item => !!item).map(({ root, gitPath }) => {
            logger.logo(`${chalk.yellow('Delete')}: ${root}`);
            shelljs.rm('-rf', root);
            return gitPath;
        });

        logger.logo('waiting...');
        shelljs.exec(`npm install -D "${_gitPaths.join('" ')}"`);

        logger.logo(`${chalk.green('Finish!')}`);
        return;
    }
    logger.error('Update Error!!!');
};