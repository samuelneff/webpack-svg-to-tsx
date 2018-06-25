const fs = require('fs');
const os = require('os');
const path = require('path');

function defaultHeader(propsInterfaceName) {
    return `/* tslint:disable:max-line-length jsx-alignment */
import React from 'react';

interface ${propsInterfaceName} {
    className:string;
}`
}

function createSvgComponent(componentName, propsInterfaceName, svgContent) {
  return `export const ${componentName}:React.StatelessComponent<${propsInterfaceName}> = props => (
  ${svgContent}
);`;
}

const defaults = {
    outFile: 'index.tsx',
    directories: [
        'src/images'
    ],
    header: defaultHeader,
    propsInterfaceName: 'SvgProps',
    EOL: os.EOL,
    addClassName: true,
    templateFn: createSvgComponent,
    uniqueClassNames: true,
    uniqueId: true
};

class WebpackSvgToTsx {

    constructor(options) {
        this.options = Object.assign({}, defaults, options);
        this.apply = this.apply.bind(this);
        this.lastBuildTime = 0;
        this.validateOptions();
    }

    validateOptions() {
        const {
            outFile,
            directories,
            header,
            propsInterfaceName,
            EOL,
            templateFn
        } = this.options;
        if (typeof outFile !== 'string') {
            throw new Error('WebpackSvgToTsx invalid options: outFile must be string, received: ' + String(outFile));
        }
        if (!Array.isArray(directories)) {
            throw new Error('WebpackSvgToTsx invalid options: directories must be an array of strings, received: ' + String(directories));
        }
        if (directories.length === 0) {
            options.directories = defaults.directories.slice();
        }
        if (directories.some(d => typeof d !== 'string')) {
            throw new Error('WebpackSvgToTsx invalid options: directories must be an array of strings, received: ' + directories.map(d => typeof d).join(','));
        }
        const headerType = typeof header;
        if (headerType === 'string') {
            this.options.header = () => header;
        } else if (headerType !== 'function') {
            throw new Error('WebpackSvgToTsx invalid options: header must be string or function, received: ' + String(header));
        }
        if (typeof propsInterfaceName !== 'string') {
            throw new Error('WebpackSvgToTsx invalid options: propsInterfaceName must be string, received: ' + String(propsInterfaceName));
        }
        if (typeof EOL !== 'string') {
            throw new Error('WebpackSvgToTsx invalid options: EOL must be string, received: ' + String(EOL));
        }
        if (typeof templateFn !== 'function') {
            throw new Error('WebpackSvgToTsx invalid options: templateFn must be function, received: ' + String(templateFn));
        }
    }

    apply(compiler) {
        compiler.plugin('watch-run', this.watchRunHandler.bind(this));
        compiler.plugin('run', this.runHandler.bind(this));
        compiler.plugin('done', this.compileDoneHandler.bind(this));
    }

    watchRunHandler(watching, callback) {
        const { lastBuildTime, options } = this;
        const { compiler } = watching;
        const { context, fileTimestamps } = compiler;
        const directories = options.directories.map(directory => path.join(context, directory));
        const filePaths = Object.keys(fileTimestamps);
        const svgs = filePaths.filter(f => f.endsWith('.svg'));
        const svgTs = {};
        svgs.forEach(s => svgTs[s] = fileTimestamps[s]);
        const doRun = filePaths.length === 0 ||
            filePaths.some(
                filePath =>
                    directories.some(directory => filePath.startsWith(directory)) &&
                    (fileTimestamps[filePath] > lastBuildTime));

        if (doRun) {
            this.lastBuildTime = Date.now();
            this.runHandler(watching.compiler, callback);
        } else {
            callback();
        }
    }

    runHandler(compiler, callback) {
        this.rebuildAll(compiler.context).then(() => callback());
    }

    compileDoneHandler(stats) {

        const { directories } = this.options;
        const { compilation } = stats;
        const { compiler, contextDependencies } = compilation;
        const { context } = compiler;

        directories.forEach(directory => contextDependencies.push(path.join(context, directory)));
    }

    rebuildAll(rootDirectory) {
        return Promise.all(
            this.options.directories.map(
                directory => this.rebuildDirectory(path.join(rootDirectory, directory))));
    }

    rebuildDirectory(directory) {
        return new Promise( (resolve, reject) => {
            fs.readdir(directory, {encoding: 'utf8'}, (err, files) => {
                if (err) {
                    reject(`Error reading directory '${directory}': ${err.toString()}`);
                    return;
                }

                let rejected = false;
                files = files.filter(file => file.endsWith('.svg') || file === this.options.outFile);
                let pendingCount = files.length;
                const contents = {};
                files.forEach(file => {
                    const fileFullPath = path.join(directory, file);
                    fs.readFile(fileFullPath, {encoding: 'utf8'}, (fileErr, content) => {
                        if (rejected) {
                            return;
                        }
                        if (fileErr) {
                            rejected = true;
                            reject(`Error reading file '${fileFullPath}': ${fileErr.toString()}`);
                            return;
                        }
                        contents[file] = content;
                        if (--pendingCount === 0) {
                            const indexContent = this.createIndexFile(contents);
                            if (indexContent === null) {
                                resolve();
                                return;
                            }
                            const indexPath = path.join(directory, this.options.outFile);
                            fs.writeFile(indexPath, indexContent, err => err ? reject(err) : resolve());
                        }
                    });
                });
            });
        });
    }

    createIndexFile(contents) {
        const { EOL, header, outFile, propsInterfaceName } = this.options;
        const parts = [ header(propsInterfaceName) ];
        const oldIndexContent = contents[outFile];
        Object.keys(contents).sort().forEach(file => {
            const content = contents[file].trim();
            if (!content || file === outFile) {
                return;
            }
            // convert filename like abc-def.svg to AbcDef
            // abcDef.svg and abc_def.svg works too
            const componentName = file.substr(0, file.length - 4)
                                      .replace(/^[^a-zA-Z0-9]+/, '')
                                      .replace(/[^a-zA-Z0-9]+$/, '')
                                      .replace(/^([a-zA-Z])|[^a-zA-Z0-9]+([a-zA-Z0-9])/g, (ignore, w1, w2) => (w1 || w2).toUpperCase());

            const className = componentName.replace(/([a-z])([A-Z])/g, (ignore, w1, w2) => w1 + '-' + w2).toLowerCase();

            parts.push(this.svgToComponent(componentName, className, content));
        });

        const newIndexContent = (parts.join('\n\n') + '\n').replace(/\r?\n/g, EOL);
        return newIndexContent === oldIndexContent
               ? null
               : newIndexContent;
    }

    svgToComponent(componentName, className, content) {
        try {
            const {addClassName, EOL, propsInterfaceName, templateFn, uniqueClassNames, uniqueId} = this.options;

            if (uniqueId) {
                content = this.makeIdUnique(className, content);
            }
            if (uniqueClassNames) {
                content = this.makeClassesUnique(className, content);
            }
            if (addClassName) {
                content = this.addClassName(className, content);
            }
            content = this.adjustClassAttributes(content);
            content = this.adjustStyleContent(content);
            if (EOL !== null) {
                content = this.adjustEOL(EOL, content);
            }
            return templateFn(componentName, propsInterfaceName, content);
        } catch (err) {
            return `/*\nERROR converting SVG to TSX: ${componentName}\n${err.stack}\n*/`;
        }
    }

    makeIdUnique(className, svgText) {
        return svgText.replace(/( id=['"])([^'"]+)(['"])/g, (ignore, start, prevId, end) => `${start}${className}-${prevId}${end}`);
    }

    makeClassesUnique(componentClassName, svgText) {

        const classNames = {};
        const classRegEx = /class\s*=\s*['"]([-_a-zA-Z0-9\s]+)['"]/g;

        const classRefsReplaced = svgText.replace(classRegEx, replaceClassRefs);
        if (classRefsReplaced === svgText) {
            return svgText;
        }

        const styleStart = classRefsReplaced.indexOf('<style');
        const styleEnd = classRefsReplaced.indexOf('</style');

        if (styleStart === -1 || styleEnd === -1) {
            return svgText;
        }
        return (
            classRefsReplaced.substr(0, styleStart) +
            classRefsReplaced.substring(styleStart, styleEnd).replace(/\.([-_a-zA-Z0-9]+)/g, replaceClassDefs) +
            classRefsReplaced.substr(styleEnd)
        );

        function replaceClassRefs(match, classes) {

            return 'class="' +
                classes
                    .split(/\s+/)
                    .map(className =>
                         {
                             const newClass = componentClassName + '--' + className;
                             classNames[className] = newClass;
                             return newClass;
                         })
                    .join(' ') +
                '"';
        }

        function replaceClassDefs(match, clas) {
            return '.' + (classNames[clas] || clas);
        }
    }

    addClassName(componentClassName, svgText) {
        return svgText.replace(/<svg/, `<svg className={\`${componentClassName} \${props.className || ''}\`}`);
    }

    adjustClassAttributes(svgText) {
        return svgText.replace(/ class=/g, ' className=');
    }

    adjustStyleContent(svgText) {
        return svgText.replace(/<style>/g, '<style dangerouslySetInnerHTML={{__html: `')
                      .replace(/<\/style>/g, '`}} />');
    }

    adjustEOL(eol, svgText) {
        return svgText.replace(/\r?\n/g, eol + '  ');
    }
}

module.exports = WebpackSvgToTsx;
