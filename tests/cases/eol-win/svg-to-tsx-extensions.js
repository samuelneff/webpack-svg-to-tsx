
function postProcessExpectedContent(expected) {
    return expected.replace(/\r?\n/g, '\r\n');
}

module.exports = {
    postProcessExpectedContent
};
