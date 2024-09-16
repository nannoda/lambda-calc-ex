
// AST Node types
type Variable = {
    type: 'variable';
    name: string;
};

type Abstraction = {
    type: 'abstraction';
    param: Variable;
    body: Expression;
};

type Application = {
    type: 'application';
    func: Expression;
    argument: Expression;
};
// Expression can be any of these three types
type Expression = Variable | Abstraction | Application;

// Token types
type Token = { type: 'lambda' | 'dot' | 'paren-open' | 'paren-close' } |
{ type: "variable", name: string };

// function isValidName(char: string) {

// }

// Tokenizer function
export function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
        const char = input[i];

        if (/\s/.test(char)) {
            // Ignore whitespace
            i++;
        } else if (char === 'λ') {
            tokens.push({ type: 'lambda' });
            i++;
        } else if (char === '.') {
            tokens.push({ type: 'dot' });
            i++;
        } else if (char === '(') {
            tokens.push({ type: 'paren-open' });
            i++;
        } else if (char === ')') {
            tokens.push({ type: 'paren-close' });
            i++;
        } else if (/[a-zA-Z_][a-zA-Z0-9_]*/.test(char)) {
            // Match variables (alphanumeric strings)
            let variable = '';
            while (i < input.length && /[a-zA-Z_][a-zA-Z0-9_]*/.test(input[i])) {
                variable += input[i];
                i++;
            }
            tokens.push({ type: 'variable', name: variable });
        } else {
            throw new Error(`Unexpected character: ${char}`);
        }
    }

    return tokens;
}