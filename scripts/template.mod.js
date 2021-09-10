import { dirname, resolve } from "https://deno.land/std@0.83.0/path/mod.ts"
import { walk, ensureDir } from "https://deno.land/std@0.83.0/fs/mod.ts";

const last = arr => arr[arr.length - 1];

const replaceTemplate = (symbolTable,debug=false) => (code) => {
  return Object.entries(symbolTable).reduce((acc,[value,replace]) => {
    return acc.replaceAll(value,replace)
  },code)
}

const isNotLineComment = x => !x.startsWith("#");
const isIgnored = file => Boolean(file.path.match("__"))

const loadSymbols = (symbolPath) => {
    const text = Deno.readTextFileSync(symbolPath);
    return text
      .split("\n")
      .filter(isNotLineComment)
      .map(x => x.split(":=").map(x => x.trim() ))
      .reduce((acc,[key,value]) => ({ ...acc , [key] : value }),{})
}

const fixImports = (data) => {
  return data.replaceAll(/from ["'].*["'];?\s?/gm,(str) => {
    const path = last(str.trim().replaceAll(/["';]/g,"").split("from "));
    const isFile = Boolean(path.match(/(\/[a-z][^\/]*)$/))
    const isFolder = Boolean(path.match(/(\/[A-Z_][^\/]*)$/))
    const isUrl = Boolean(path.startsWith("https"))
    if( isUrl ){
      return path.match(/.[jt]s;$/gm) ? `from "${path}";\n` : `from "${path}.js";\n`
    } else {
      if( isFolder ){
        return `from "${path}/mod.js";\n`
      }
      if( isFile ){
        return `from "${path}.js";\n`
      }
    }
  })
}

const template = ({
    symbols,
    input,
    output,
    debug,
    dry
}) => {
    const srcPath = resolve(input)
    const outPath = resolve(output)
    const symbs = loadSymbols(symbols)
    const interpolate = replaceTemplate(symbs,debug)
    const replaceDestination = file => file.replace(srcPath,last(outPath.split("/")))
    if(debug){
      console.log({
        source: srcPath,
        output: outPath,
      })
      console.log("Symbols: \n", symbs)
    }
    return {
        run: async (onEnd = () => {}) => {
            const files = walk(input);
            for await (const file of files){
              if( file.isFile && !isIgnored(file) ){
                if( debug ){
                  console.log("Porcessing: ", file.path)
                }
                const rawData = await Deno.readTextFile(file.path)
                const data = fixImports(interpolate(rawData))
                const target = replaceDestination(resolve(file.path)).replace("index","mod");
                if(debug){
                  console.log("Writing: ", target)
                }
                if( !dry ){
                  await ensureDir(dirname(target));
                  await Deno.writeTextFile(target,data);
                }
              }
            }
            if(debug){
              console.log("Finished interpolation process")
            }
            onEnd()
        }
    }
}

export default template