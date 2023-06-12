export default {
    symbols: "./scripts/symbols.txt",
    input: "./src",
    output: "./deno",
    typeInput: "types/index.d.ts",
    typeOutput: "deno/mod.d.ts",
    files: [
        ["deno/mod.js","./mod.d.ts"]
    ],
    debug: true,
    dry: false
}