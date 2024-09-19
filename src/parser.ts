

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
        } else if (char === 'λ' || char === "\\") {
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

export function normalizeTokens(tokens: Token[]): Token[] {
    if (tokens.length <= 1) {
        return tokens;
    }

    tokens = [...tokens];  // Copy tokens to avoid mutating the original array



    let mode: "param" | "body" = "body";  // Start in the right mode (function body)
    let parenCount = 0;  // Track the number of open parentheses

    let hasDot = false;
    for (const token of tokens){
        if (token.type === "dot"){
            hasDot = true;
            break;
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        let curr = tokens[i];
        let next = tokens[i + 1];

        if (curr.type === "lambda") {
            mode = "param";  // Switch to left mode (lambda parameters)
            continue;
        }

        if (curr.type === "dot") {
            mode = "body";  // Switch back to right mode (lambda body)
            continue;
        }

        if (mode === "param") {
            if(!hasDot){
                throw new Error("Expect body");
            }

            // Ensure that variables in the left mode are followed by a dot if another variable appears
            if (curr.type === "variable" && next && next.type === "variable") {
                tokens.splice(i + 1, 0, { type: "dot" });
                i++;  // Skip to the next token after insertion
            }
        } else if (mode === "body") {
            // Ensure that variables in the right mode (function application) are properly parenthesized case 
            // a b => a (b)
            if (curr.type === "variable" && next && next.type === "variable"
            ) {
                // Insert open parenthesis before the next variable (function application)
                tokens.splice(i + 1, 0, { type: "paren-open" });
                parenCount++;
                i++;  // Skip to the next token after insertion
            }

            if (curr.type === "paren-close" && next && next.type === "variable") {
                // Insert open parenthesis before the next variable (function application)
                tokens.splice(i + 1, 0, { type: "paren-open" });
                parenCount++;
                i++;  // Skip to the next token after insertion
            }

            // If there are parentheses to close, insert paren-close at the correct spot
            if (parenCount > 0 && (!next || next.type !== "variable")) {
                tokens.splice(i + 1, 0, { type: "paren-close" });
                parenCount--;
                i++;  // Skip to the next token after insertion
            };
        }
    }

    // In case there are still unclosed parentheses, close them at the end
    while (parenCount > 0) {
        tokens.push({ type: "paren-close" });
        parenCount--;
    }

    return tokens;
}


export function tokensToString(tokens: Token[]) {
    let res = "";
    for (let i = 0; i < tokens.length; i++) {
        res += " ";
        const curr = tokens[i];
        switch (curr.type) {
            case "lambda": res += "λ"; break;
            case "dot": res += "."; break;
            case "paren-open": res += "("; break;
            case "paren-close": res += ")"; break;
            case "variable": res += (curr as { name: string }).name; break;
        }
    }
    return res;
}


// AST Node types
export type Variable = {
    type: 'variable';
    name: string;
};

export type Abstraction = {
    type: 'abstraction';
    param: Variable;
    body: Expression;
};

export type Application = {
    type: 'application';
    func: Expression;
    argument: Expression;
};
// Expression can be any of these three types
export type Expression = Variable | Abstraction | Application;

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
        console.log("Consume is called on ", nextToken());
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
        console.log("parseApplication()");

        let expr: Expression = parsePrimary();  // Get the first part of the application
        while (match('paren-open')) {
            const arg = parseExpression();  // Parse the argument
            if (!match('paren-close')) {
                throw new Error("Expected ')' after application argument");
            };
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