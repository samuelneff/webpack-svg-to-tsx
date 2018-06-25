const { matcherHint, printExpected, printReceived } = require('jest-matcher-utils');
const { inspect } = require('util');

expect.extend(
    {
        toHaveKey
    }
);

function toHaveKey(received, key) {
    if (typeof received !== 'object') {
        throw new Error(
            matcherHint('[.not].toHaveKey', 'received', 'key') +
            '\n\n' +
            `Expected value to be an object with a ${printExpected(key)} key. ` +
            `Received:\n` +
            `  ${printReceived(received)}\n`);
    }
    if (received === null) {
        throw new Error(
            matcherHint('[.not].toHaveKey', 'received', 'key') +
            '\n\n' +
            `Expected value to be an object with a ${printExpected(key)} key. ` +
            `Received:\n` +
            `  ${printReceived(received)}\n`);
    }
    const pass = received[key] !== undefined;
    const message = () =>
                        matcherHint(`${pass ? '.not' : ''}.toHaveKey`, 'received', 'key') +
                        '\n\n' +
                        `Expected value to be an object with a ${printExpected(key)} key:\n` +
                        `Received:\n` +
                        `  ${printReceived(inspect(received, { depth: 2, colors: true }))}\n`;
    return {message, pass};
}
