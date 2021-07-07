// @ts-nocheck
import Reader from './Reader.mod.ts';

type Config = { 
    typeInput: string, 
    typeOutput: string, 
    files: [string,string][],
    dry: boolean,
    [x: string]: unknown
}

const configReader = Reader.of(({ typeInput, typeOutput, files, dry=false }: Config) => ({ typeInput, typeOutput, files, dry }));

const copyTypes = configReader.map(({ typeInput, typeOutput, files, dry }) => {
    Deno.copyFileSync(typeInput, typeOutput);
    files.forEach(([ file, typeDefs ]) => {
        const typeImport = `// @deno-types="${typeDefs}"\n`
        const fileData = Deno.readTextFileSync(file);
        if( dry ){
            console.log(`>>>>> ${file} <<<<<`)
            console.log(typeImport + fileData)
            console.log(`<<<<< ${file} end >>>>>`)
        } else {
            Deno.writeTextFileSync(file,typeImport + fileData);
        }
    })
})

export default copyTypes;