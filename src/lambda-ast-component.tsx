import { Accessor, Component } from "solid-js";
import { Expression } from "./parser";

function getRandomNiceColor(): string {
    // Generate a random number between 128 and 255 to ensure a light color (bright).
    const randomChannel = () => Math.floor(Math.random() * 128 + 128);

    // Convert the number to hexadecimal and pad with 0 if needed.
    const toHex = (value: number) => value.toString(16).padStart(2, '0');

    // Get random values for red, green, and blue.
    const red = randomChannel();
    const green = randomChannel();
    const blue = randomChannel();

    // Return the color in hexadecimal format.
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export interface LambdaAstComponentProps {
    node: Expression
}

export const LambdaAstComponent: Component<LambdaAstComponentProps> = (props) => {
    const node = props.node;
    switch (node.type) {
        case "variable": return (
            <div
                style={
                    {
                        background: getRandomNiceColor(),
                        padding: "10px"
                    }
                }
            >{node.name}</div>
        );
        case "abstraction": return (
            <div
                style={
                    {
                        background: getRandomNiceColor(),
                        display: "flex",
                        "flex-direction": "row",
                        padding: "10px"
                    }
                }
            >
                <LambdaAstComponent
                    node={node.param}
                ></LambdaAstComponent>
                <div>.</div>
                <LambdaAstComponent
                    node={node.body}
                ></LambdaAstComponent>
            </div>
        )
        case "application": return (
            <div
                style={
                    {
                        background: getRandomNiceColor(),
                        display: "flex",
                        "flex-direction": "row",
                        padding: "10px"
                    }
                }
            >
                <LambdaAstComponent
                    node={node.func}
                ></LambdaAstComponent>
                <div>(</div>
                <LambdaAstComponent
                    node={node.argument}
                ></LambdaAstComponent>
                <div>)</div>
            </div>
        )
    }

    return (<>UNKNOWN NODE</>)
}