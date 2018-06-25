const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const svgToTsxPlugin = require('..');

require('./expect-extensions');

const cases = process.env.CASES ? process.env.CASES.split(',') : fs.readdirSync(path.join(__dirname, 'cases'));

describe('Webpack Integration Tests', () => cases.forEach(testCase => describe(testCase, () => runCase(testCase))));


function runCase(testCase) {

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

    it(
        'Should run webpack on test case',
        done =>
            webpack(
                webpackOptions,
                (err, stats) => {
                    if (err) {
                        return done(err);
                    }
                    if (stats.hasErrors()) {
                        return done(new Error(stats.toString()));
                    }
                    done();
                }
            )
    );

    testExpectedDirectory(testDirectory, path.join(testDirectory, 'expected'));

    function testExpectedDirectory(actualDirectory, expectedDirectory) {

        let actualSubs;
        const expectedSubs = readdirStatsSync(expectedDirectory);

        it(
            `should initialize actual directory listing for '${actualDirectory.substr(testDirectory.length + 1)}'`,
            () => (actualSubs = readdirStatsSync(actualDirectory)) && undefined);

        Object.keys(expectedSubs).forEach(testExpectedSub);

        function testExpectedSub(sub) {

            const expected = expectedSubs[sub];
            const expectsFile = expected.isFile();
            const expectType = expectsFile ? 'file' : 'directory';
            const expectedSubPath = path.join(expectedDirectory, sub);

            let actual;
            const actualSubPath = path.join(actualDirectory, sub);
            const actualRelative = actualSubPath.substr(testDirectory.length + 1);

            it(
                `should initialize actual entry for '${actualRelative}'`,
                () => (actual = actualSubs[sub]) && undefined);
            it(
                `should have created '${actualRelative}'`,
                () => expect(actualSubs).toHaveKey(sub));
            it(
                `'${actualRelative}' should also be a ${expectType}`,
                () => expect(actual && actual.isFile()).toBe(expectsFile));

            if (expectsFile) {
                it(
                    `'${actualRelative}' contents should match expected`,
                    () =>
                        expect(
                            actual && actual.isFile()
                                ? fs.readFileSync(actualSubPath, 'utf-8')
                                : ''
                        ).toEqual(fs.readFileSync(expectedSubPath, 'utf-8')));
            } else {
                testExpectedDirectory(actualSubPath, expectedSubPath);
            }
        }
    }
}

function readdirStatsSync(directory) {
    const subs = fs.readdirSync(directory);
    const lookup = {};
    subs.forEach(sub => lookup[sub] = fs.statSync(path.join(directory, sub)));
    return lookup;
}
