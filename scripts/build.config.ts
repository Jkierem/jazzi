export default {
    symbols: "./scripts/symbols.txt",
    input: "./src",
    output: "./deno",
    typeInput: "types/index.d.ts",
    typeOutput: "deno/index.d.ts",
    files: [
        ["deno/index.js","./index.d.ts"]
    ],
    debug: false,
    dry: false
}