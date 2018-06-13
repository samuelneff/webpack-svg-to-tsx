const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const svgToTsxPlugin = require('..');

const cases = process.env.CASES ? process.env.CASES.split(',') : fs.readdirSync(path.join(__dirname, 'cases'));

describe('Webpack Integration Tests', () => cases.forEach(testCase => it(testCase, done => runTest(testCase, done))));


function runTest(testCase, done) {

    const testDirectory = path.join(__dirname, 'cases', testCase);
    const outputDirectory = path.join(testDirectory, 'test-out');
    const svgToTsxOptionsFile = path.join(testDirectory, 'svg-to-tsx-options.json');

    const svgToTsxOptions =
        fs.existsSync(svgToTsxOptionsFile)
            ? JSON.parse(fs.readFileSync(svgToTsxOptionsFile, 'utf-8'))
            : {};

    if (svgToTsxOptions.directories === undefined) {
        svgToTsxOptions.directories = [ './' ];
    }

    const webpackOptions = {
        context: testDirectory,
        entry: {
            test: './index.js'
        },
        module: {
            loaders: []
        },
        output: {
            filename: '[name].js',
            path: outputDirectory
        },
        plugins: [
            new svgToTsxPlugin(svgToTsxOptions)
        ]
    };

    webpack(webpackOptions, (err, stats) => {
        if (err) return done(err);
        if (stats.hasErrors()) return done(new Error(stats.toString()));

        const actualFile = path.join(testDirectory, 'index.tsx');

        if (!fs.existsSync(actualFile)) {
            return done(new Error('index.tsx not created where expected: ' + actualFile));
        }
        const actualContent = fs.readFileSync(actualFile, 'utf-8');

        const expectedFile = path.join(testDirectory, 'expected/index.tsx');
        const expectedContent = fs.readFileSync(expectedFile, 'utf-8');

        expect(actualContent).toEqual(expectedContent);
        done();
    });
}
