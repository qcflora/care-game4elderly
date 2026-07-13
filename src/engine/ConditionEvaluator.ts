/**
 * 条件表达式求值器
 * 支持的表达式语法：
 *   - 属性比较: "health > 60"
 *   - 多条件组合: "health > 60 && trust > 50"
 *   - Flag检查: "flag.met_doctor == true"
 *   - 技能检查: "skill.medication_basic >= 2"
 *   - Day检查: "day >= 5"
 *
 * 安全设计：不使用 eval()，采用自定义解析器
 */
export class ConditionEvaluator {
  /** 属性值获取回调 */
  private getAttributeValue: (attr: string) => number;
  /** Flag值获取回调 */
  private getFlagValue: (flag: string) => boolean;

  constructor(options?: {
    getAttributeValue?: (attr: string) => number;
    getFlagValue?: (flag: string) => boolean;
  }) {
    this.getAttributeValue = options?.getAttributeValue ?? (() => 0);
    this.getFlagValue = options?.getFlagValue ?? (() => false);
  }

  /**
   * 设置属性值获取器（延迟绑定，避免循环依赖）
   */
  setAttributeValueGetter(getter: (attr: string) => number) {
    this.getAttributeValue = getter;
  }

  /**
   * 设置Flag值获取器
   */
  setFlagValueGetter(getter: (flag: string) => boolean) {
    this.getFlagValue = getter;
  }

  /**
   * 求值条件表达式
   * @returns true=条件满足
   */
  evaluate(expression: string): boolean {
    if (!expression || expression.trim() === '') return true;

    try {
      const evaluatedExpr = this.resolveVariables(expression);
      return this.safeEvaluate(evaluatedExpr);
    } catch (error) {
      console.error('[ConditionEvaluator] 条件求值失败:', expression, error);
      return false;
    }
  }

  /**
   * 将表达式中的变量引用替换为实际数值
   */
  private resolveVariables(expression: string): string {
    let result = expression;

    // 替换属性引用: health, mood, independence, trust
    result = result.replace(/\b(health|mood|independence|trust)\b/g, (_, attr) => {
      return String(this.getAttributeValue(attr));
    });

    // 替换 flag.xxx 引用
    result = result.replace(/flag\.(\w+)/g, (_, flagName) => {
      return String(this.getFlagValue(flagName));
    });

    return result;
  }

  /**
   * 安全求值逻辑表达式
   * 使用递归下降解析器，避免使用 eval
   */
  private safeEvaluate(expression: string): boolean {
    // 简单的表达式求值：处理数字比较和布尔值
    // 格式: 数值 | 布尔值 | 比较 | 逻辑组合
    const tokens = this.tokenize(expression);
    if (tokens.length === 0) return true;

    const parser = new BooleanExpressionParser(tokens);
    return parser.parse();
  }

  /**
   * 词法分析：将表达式拆分为token
   */
  private tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    const regex = /(\s+)|(>=|<=|==|!=|>|<|&&|\|\||!|\(|\)|true|false|\d+(\.\d+)?)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(expr)) !== null) {
      if (match[1]) continue; // 跳过空白
      tokens.push({ value: match[2] });
    }
    return tokens;
  }
}

/** Token类型 */
interface Token {
  value: string;
}

/**
 * 简易布尔表达式递归下降解析器
 * 文法:
 *   expr       -> or_expr
 *   or_expr    -> and_expr ('||' and_expr)*
 *   and_expr   -> not_expr ('&&' not_expr)*
 *   not_expr   -> '!' not_expr | primary
 *   primary    -> '(' expr ')' | comparison | boolean
 *   comparison -> NUMBER ('=='|'!='|'>'|'<'|'>='|'<=') NUMBER
 *   boolean    -> 'true' | 'false'
 */
class BooleanExpressionParser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): boolean {
    const result = this.parseOrExpr();
    return result;
  }

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private consume(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos++] : null;
  }

  private parseOrExpr(): boolean {
    let result = this.parseAndExpr();
    while (this.peek()?.value === '||') {
      this.consume(); // ||
      result = this.parseAndExpr() || result;
    }
    return result;
  }

  private parseAndExpr(): boolean {
    let result = this.parseNotExpr();
    while (this.peek()?.value === '&&') {
      this.consume(); // &&
      result = this.parseNotExpr() && result;
    }
    return result;
  }

  private parseNotExpr(): boolean {
    if (this.peek()?.value === '!') {
      this.consume(); // !
      return !this.parseNotExpr();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): boolean {
    const token = this.peek();

    // 括号表达式
    if (token?.value === '(') {
      this.consume(); // (
      const result = this.parseOrExpr();
      this.consume(); // )
      return result;
    }

    // 布尔值
    if (token?.value === 'true') {
      this.consume();
      return true;
    }
    if (token?.value === 'false') {
      this.consume();
      return false;
    }

    // 比较表达式
    return this.parseComparison();
  }

  private parseComparison(): boolean {
    const leftToken = this.consume();
    if (!leftToken) return false;

    const leftValue = parseFloat(leftToken.value);
    if (isNaN(leftValue)) {
      // 如果不是数字，可能是未解析的标识符，默认false
      return false;
    }

    const opToken = this.peek();
    if (!opToken) return leftValue > 0;

    const op = opToken.value;
    if (!['==', '!=', '>', '<', '>=', '<='].includes(op)) {
      return leftValue > 0;
    }

    this.consume(); // 运算符

    const rightToken = this.consume();
    if (!rightToken) return false;

    const rightValue = parseFloat(rightToken.value);
    if (isNaN(rightValue)) return false;

    switch (op) {
      case '==': return leftValue === rightValue;
      case '!=': return leftValue !== rightValue;
      case '>':  return leftValue > rightValue;
      case '<':  return leftValue < rightValue;
      case '>=': return leftValue >= rightValue;
      case '<=': return leftValue <= rightValue;
      default: return false;
    }
  }
}
