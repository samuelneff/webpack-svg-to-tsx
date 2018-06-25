function customTemplateFn(componentName, propsInterfaceName, svgContent) {
    return `export const ${componentName}:React.StatelessComponent<${propsInterfaceName}> = props => ${svgContent};`;
}

function postProcessSvgToTsxOptions(options) {
    options.templateFn = customTemplateFn;
    return options;
}

module.exports = {
    postProcessSvgToTsxOptions
};
