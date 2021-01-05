import template from './template.mod.js'

const [ symbolsFile, inputFolder , outputFolder ] = Deno.args;

const head = ([ head ]) => head

const Ok = x => ({
    map: (f) => Ok(f(x)),
    onErr: () => {}
})

const Err = (e) => ({
    map: () => Err(e),
    onErr: (f) => f(e)
})

const validateDefined = (values) => {
    const validation = Object.entries(values).map(
        ([ key , value ]) => [ key , value !== undefined ]
    )
    return validation.every(([, valid]) => valid) ? 
        Ok(values) : 
        Err(validation.filter(([, valid]) => !valid).map(head))
}

validateDefined({
    symbols: symbolsFile,
    input: inputFolder,
    output: outputFolder,
    debug: false,
    dry: false
})
.map(template)
.map(temp => temp.run())
.onErr(invalid => {
    console.error(`Some arguments missing: ${invalid}. \nUsage:\n\ttemplate <symbolFile> <inputFolder> <outputFolder>`)
})