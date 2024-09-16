import { Accessor, Component } from "solid-js"
import { tokenize } from "./parser";


export interface LambdaTreeProps {
    lambda: Accessor<string>
}

export const LambdaTree: Component<LambdaTreeProps> = (props) => {
    // Replace all \ with lambda
    const lambda = () => props.lambda().replaceAll("\\", "λ");
    const tokens = () => {
        try {
            return tokenize(lambda());
        } catch (e) {
            console.error(e);
            
            return []
        }

    };


    return (
        <div>{JSON.stringify(tokens())}</div>
    )
}