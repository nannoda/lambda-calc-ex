import { Accessor, Component } from "solid-js"
import { normalizeTokens, parseAST, tokenize, tokensToString } from "./parser";
import { monad } from "./monad";


export interface LambdaTreeProps {
    lambda: Accessor<string>
}

export const LambdaTree: Component<LambdaTreeProps> = (props) => {
    // Replace all \ with lambda
    // const lambda = () => props.lambda().replaceAll("\\", "λ");
    const tokens = () => monad(tokenize, [props.lambda()]);
    const normalizedTokens = () => {
        const [ts, err] = tokens();
        if (ts)
            return normalizeTokens(ts);
        return []
    }

    const lambda: Accessor<string> = () => {
        const [ts, err] = tokens();
        if (ts)
            return tokensToString(ts);

        return "Error tokenizing...";
    }


    const ast = () => {
        const ts = normalizedTokens();
        // if (err) {
        //     return err;
        // }

        const [ast, astErr] = monad(parseAST, [ts]);

        if (astErr) {
            console.log(astErr);
            return astErr;
        }

        return ast;
    }
    // const astLines = () => {
    //     const lines = JSON.stringify(ast(), null, 2).split("\n");
    //     return lines.map(
    //         (line) => {
    //             return <>
    //                 <br></br>
    //                 <pre>{line}</pre>
    //             </>
    //         }
    //     )
    // }

    return (
        <div>
            {tokens()[0] && <p>Tokens: {JSON.stringify(tokens()[0], null, 2)}</p>}
            {tokens()[1] && <p>{String(tokens()[1])}</p>}

            <p>Lambda: {lambda()}</p>
            <p>Normalized Tokens: {JSON.stringify(normalizedTokens())}</p>
            <p>{tokensToString(normalizedTokens())}</p>
            <pre>AST: {JSON.stringify(ast(), null, 2)}</pre>
            {/* {astLines()} */}
        </div>
    )
}