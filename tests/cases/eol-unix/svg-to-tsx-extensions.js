
function postProcessExpectedContent(expected) {
    return expected.replace(/\r?\n/g, '\n');
}

module.exports = {
    postProcessExpectedContent
};
