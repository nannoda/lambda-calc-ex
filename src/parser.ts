

// Token types
type Token = { type: 'lambda' | 'dot' | 'paren-open' | 'paren-close' } |
{ type: "variable", name: string };
type TokenType = Token["type"];

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

export function parseAST(tokens: Token[]) {
    let currIndex = 0;
    function isEnd() {
        return currIndex >= tokens.length
    }

    function nextToken(): Token {
        return tokens[currIndex];
    }

    function currToken(): Token {
        return tokens[currIndex - 1];
    }

    function consume(): Token {
        console.log("Advance is called on ", nextToken());
        return tokens[currIndex++];
    }

    function match(...types: TokenType[]): boolean {
        console.log("Matching ", types);
        if (isEnd()) {
            console.log("Is end ", types);
            return false;
        }
        if (types.includes(nextToken().type)) {
            console.log("Matched: ", consume(), types);
            return true;
        }
        console.log("Unmatched", currToken(), types);

        return false;
    }

    // function logCurrState() {
    //     console.log({
    //         curr, tokens
    //     });

    // }

    function parseExpression(): Expression {
        if (match("lambda")) {
            return parseAbstraction();
        } else {
            return parseApplication();
        }
    }

    function parseAbstraction(): Abstraction {
        if (!match("variable")) {
            throw new Error("Expect variable");
        }
        const param = parseVariable();
        if (!match("dot")) {
            throw new Error("Expect dot");
        }
        const body: Expression = parseExpression();
        return { type: 'abstraction', param, body };
    }

    function parseApplication(): Expression {
        let expr: Expression = parsePrimary();  // Get the first part of the application
        while (match('paren-open')) {
            const arg = parseExpression();  // Parse the argument
            if (!match('paren-close')) {
                throw new Error("Expected ')' after application argument");
            }
            expr = { type: 'application', func: expr, argument: arg };
        }

        return expr;
    }

    function parsePrimary(): Expression {
        if (match("variable")) {
            return parseVariable();
        } else if (match("paren-open")) {
            const expr = parseExpression();
            if (!match("paren-close")) {
                throw new Error("Expected ')' after expression");
            }
            return expr;
        } else {
            throw new Error(`Unexpected token ${JSON.stringify(nextToken())}`);
        }
    }

    function parseVariable(): Variable {
        const token = tokens[currIndex - 1];
        if (!token) {
            throw new Error(`Index [${currIndex}] is out of bound`);
        }
        if (token.type !== "variable") {
            // logCurrState();
            throw new Error(`Token "${JSON.stringify(token)}} " is not a variable`);
        };
        return { type: 'variable', name: token.name };
    }
    return parseExpression();
}

export function parse(src: string) {
    return parseAST(tokenize(src));
}