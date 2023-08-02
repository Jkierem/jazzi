import * as A from "https://deno.land/x/jazzi@v4.1.0/Async/mod.ts"
import * as M from "https://deno.land/x/jazzi@v4.1.0/Maybe/mod.ts"

const Decoder = new TextDecoder()
const decode = (x: Uint8Array) => Decoder.decode(x)

type DenoServices = Pick<typeof Deno, "readFile" | "Command" | "args" | "writeTextFile">
type Runtime = { 
    print: Console, 
    ask: typeof prompt,
    deno: DenoServices
};
const usingRuntime = A.require<Runtime>()

const runCmd = (cmd: string, args: string[]) => A.from(async ({ deno }: Runtime) => {
    const command = new deno.Command(cmd, { args })

    const { code, stdout, stderr } = await command.output();

    const fromTyped = M.fromCondition((x: Uint8Array) => Boolean(x.length))

    const decodeOrEmpty = (uint: Uint8Array) => fromTyped(uint)
        ['|>'](M.map(decode))
        ['|>'](M.fold(() => "", x => x))

    if( code === 0 ){
        const a = decodeOrEmpty(stdout)
        console.log(a);
        return a;
    } else {
        const err = decodeOrEmpty(stderr)
        console.error(err);
        return Promise.reject(err)
    }
})

const read = (file: string) => A.from(({ deno }: Runtime) => deno.readFile(file).then(decode))

const write = (file: string) => (content: string) => A.from(({ deno }: Runtime) => deno.writeTextFile(file, content))

const printLn = (str: string) => usingRuntime["|>"](A.map(({ print }) => print.log(str)))

const doPrompt = (msg: string) => usingRuntime["|>"](A.map(({ ask }) => ask(msg,"")))

type DeclineError = { kind: "declinedPrompt" }
type NonInteractiveError = { kind: "notInteractive" }
const confirmation = (msg: string) => printLn(msg)
    ["|>"](A.zipRight(doPrompt("Do you want to continue? [y/N]")))
    ["|>"](A.chain(res => res && ["y", "yes"].includes(res.toLowerCase()) 
        ? A.Succeed(void 0)
        : A.Fail(res !== null 
            ? { kind: "declinedPrompt" } as DeclineError
            : { kind: "notInteractive" } as NonInteractiveError
        )
    ))

type RawVersion = `${number}.${number}.${number}`
type RawPackage = { version: RawVersion }
type ParsedVersion =  [number, number, number]
type Package = { version: ParsedVersion }
type ParsingError = { kind: "parsingError" }
const parsePackage = (str: string): A.AsyncIO<ParsingError, Package> => {
    const pack = JSON.parse(str) as RawPackage;
    if( pack.version ){
        const version = pack.version.split(".").map(Number) as [number, number, number]
        return A.Succeed({ ...pack, version });
    } else {
        return A.Fail({ kind: "parsingError" } as ParsingError)
    }
}

const branch = (branch: string) => runCmd("git", ["branch", branch])

const checkout = (branch: string) => runCmd("git", ["checkout", branch])

const status = runCmd("git", ["status"])

const yarn = (cmd: string) => runCmd("yarn", [cmd])

const move = (src: string, dst: string) => runCmd("mv", [src, dst])

type BumpKind = "major" | "minor" | "patch"
const bump = (kind: BumpKind) => ([ma, mi, pa]: ParsedVersion): ParsedVersion => {
    switch(kind){
        case "major":
            return [ma+1,0,0]
        case "minor":
            return [ma,mi+1,0];
        case "patch":
            return [ma,mi,pa+1];
    }
}

type InvalidBump = { kind: "invalidBump", bump: string }
const makeInvalidBump = (bump: string): InvalidBump => ({ kind: "invalidBump", bump })
const isBumpKind = (str: string): A.AsyncIO<InvalidBump, BumpKind> => {
    if(["major","minor","patch"].includes(str)){
        return A.Succeed(str as BumpKind)
    } else {
        return A.Fail(makeInvalidBump(str))
    }
}

const bumbVersion = usingRuntime
    ["|>"](A.access("deno"))
    ["|>"](A.access("args"))
    ["|>"](A.map(args => args[0]))
    ["|>"](A.chain(isBumpKind))
    ["|>"](A.map(bump))

const packageInfo = read("./package.json")
    ["|>"](A.chain(parsePackage))

const updateVersion = A.do()
    ["|>"](A.bind("pck", () => packageInfo))
    ["|>"](A.bind("bump", () => bumbVersion))
    ["|>"](A.bind("version", ({ pck, bump }) => A.Succeed(bump(pck.version).join(".") as RawVersion)))
    ["|>"](A.tapEffect(({ pck, version }) => confirmation(`About to change version from ${pck.version.join(".")} to ${version}`)))
    ["|>"](A.bind("packageContent", ({ pck, version }) => A.Succeed(JSON.stringify({ ...pck, version }, null, 3))))
    ["|>"](A.bind("_", ({ packageContent }) => write("./package.json")(packageContent)))
    ["|>"](A.access("version"))

const program = A.do()
    ["|>"](A.bind("version", () => updateVersion))
    ["|>"](A.bind("release", ({ version }) => A.Succeed(`release-${version}`)))
    ["|>"](A.tapEffect(({ release }) => branch(release)))
    ["|>"](A.tapEffect(({ release }) => checkout(release)))
    ["|>"](A.chain(({ release }) => confirmation(`Released ${release} prepted`)))
    ["|>"](A.zipLeft(yarn("build")))
    ["|>"](A.zipLeft(move("dist/*", "./")))
    ["|>"](A.zipRight(status))

const env: Runtime = {
    deno: {
        readFile: Deno.readFile,
        writeTextFile: Deno.writeTextFile,
        args: Deno.args,
        Command: Deno.Command,
    },
    ask: prompt,
    print: console
}

program["|>"](A.runWith(env))