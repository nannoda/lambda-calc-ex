import { Accessor, Component } from "solid-js"
import { normalizeTokens, parseAST, tokenize, tokensToString } from "./parser";
import { monad } from "./monad";
import { LambdaAstComponent } from "./lambda-ast-component";


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
        const [ast, astErr] = monad(parseAST, [ts]);

        if (astErr) {
            console.log(astErr);
            return astErr;
        }
        return ast;
    }

    const astComponent = () => {
        const node = ast();
        if (node instanceof Error) {
            return <>Error: {node.message}</>
        }
        return <LambdaAstComponent
            node={node}
        ></LambdaAstComponent>
    }

    const astText = () => {
        const a = ast();
        if (a instanceof Error) {
            return <p>{JSON.stringify(a)}</p>
        }
        return <pre>AST: {JSON.stringify(a, null, 2)}</pre>
    }

    return (
        <div>
            {tokens()[0] && <p>Tokens: {JSON.stringify(tokens()[0], null, 2)}</p>}
            {tokens()[1] && <p>{String(tokens()[1])}</p>}

            <p>Lambda: {lambda()}</p>
            <p>Normalized Tokens: {JSON.stringify(normalizedTokens())}</p>
            <p>{tokensToString(normalizedTokens())}</p>
            {astText()}
            {/* {astLines()} */}
            {astComponent()}
        </div>
    )
}