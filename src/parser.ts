

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
    let curr = 0;
    function isEnd() {
        return curr >= tokens.length
    }

    function currToken(): Token {
        return tokens[curr];
    }

    function advance(): Token {
        return tokens[curr++];
    }

    function match(...types: TokenType[]): boolean {
        if (!isEnd() && types.includes(currToken().type)) {
            console.log("Matched: ", advance(), types);
            return true;
        }
        return false;
    }

    function logCurrState() {
        console.log({
            curr, tokens
        });

    }

    function parseExpression(): Expression {
        if (match("lambda")) {
            return parseAbstraction();
        } else {
            return parseApplication();
        }
    }

    function parseAbstraction(): Abstraction {
        if (match("variable")) {
            const param = parseVariable();
            console.log("param", param);
            if (!match("dot")) {
                logCurrState();
                throw new Error("Expected '.' after lambda parameter");
            }
            logCurrState();
            const body: Expression = parseExpression();
            return { type: 'abstraction', param, body };
        } else {
            throw new Error("Expect variable")
        }

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
            throw new Error(`Unexpected token ${JSON.stringify(currToken())}`);
        }
    }

    function parseVariable(): Variable {
        const token = currToken();
        if (!token) {
            throw new Error(`Index [${curr}] is out of bound`);
        }
        if (token.type !== "variable") {
            logCurrState();
            throw new Error(`Token "${JSON.stringify(token)}} " is not a variable`);
        };
        return { type: 'variable', name: token.name };
    }
    return parseExpression();
}

export function parse(src: string) {
    return parseAST(tokenize(src));
}