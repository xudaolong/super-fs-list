'use strict';

const fs = require('fs');
const systemPath = require('path');

class autoLoad {

    constructor() {

    }

    /**
     * get filename
     * @param p_path
     * @returns {string}
     */
    filename(p_path) {
        return p_path.substr(0, p_path.length - systemPath.extname(p_path).length);
    }

    camelCase(p_input) {
        return p_input.toLowerCase().replace(/-(.)/g, (match, firstLetter) => {
            return firstLetter.toUpperCase();
        });
    }

    traverse(p_path, p_options) {
        let traverse2json = {};
        fs.readdirSync(p_path).forEach((file) => {
            let name = this.filename(file);
            let newPath = p_path + '/' + file;
            let stat = fs.statSync(newPath);
            if (stat.isFile()) {
                let extension = systemPath.extname(file);
                if (extension === '.js' && p_options.js) {
                    traverse2json[name] = require(newPath);
                }
                else if (extension === '.json' && p_options.json) {
                    traverse2json[name] = require(newPath);
                }
            } else if (stat.isDirectory() && p_options.deep) {
                name = file;
                traverse2json[name] = this.traverse(newPath, p_options);
            }
        });
        return traverse2json;
    }

    /**
     * main:
     * 1.autoLoad.run(`path`)
     * @param p_baseDirectory
     * @param p_options
     * @returns {*}
     */
    run(p_baseDirectory, p_options) {

        let options = p_options || {};

        if (options.deep === undefined) {
            options.deep = true;
        }
        if (options.js === undefined) {
            options.js = true;
        }
        if (options.json === undefined) {
            options.json = true;
        }

        let normalized = systemPath.normalize(p_baseDirectory).replace(/[\/|\\]$/, '');
        if (systemPath.resolve(p_baseDirectory) !== normalized) {
            p_baseDirectory = process.cwd() + '/' + p_baseDirectory;
        }

        return this.traverse(p_baseDirectory, options);
    }
}

module.exports = new autoLoad();