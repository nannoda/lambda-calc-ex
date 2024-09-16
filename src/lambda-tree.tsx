import { Accessor, Component } from "solid-js"
import { parseAST, tokenize } from "./parser";
import { monad } from "./monad";


export interface LambdaTreeProps {
    lambda: Accessor<string>
}

export const LambdaTree: Component<LambdaTreeProps> = (props) => {
    // Replace all \ with lambda
    const lambda = () => props.lambda().replaceAll("\\", "λ");
    const tokens = () => monad(tokenize, [lambda()]);
    const ast = () => {
        const [ts, err] = tokens();
        if (err) {
            return err;
        }

        const [ast, astErr] = monad(parseAST, [ts]);

        if (astErr){
            console.log(astErr);
            
            return err;
        }

        return ast;
    }
    return (
        <div>
            <p>Lambda: {lambda()}</p>
            {tokens()[0] && <p>Tokens: {JSON.stringify(tokens()[0], null, 2)}</p>}
            {tokens()[1] && <p>{String(tokens()[1])}</p>}
            <p>AST: {JSON.stringify(ast(), null, 2)}</p>
        </div>
    )
}