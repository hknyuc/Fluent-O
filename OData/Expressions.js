"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./Schema");
class Operation {
    constructor(type) {
        this.type = type;
    }
}
exports.Operation = Operation;
class Method {
}
exports.Method = Method;
class Select extends Method {
    constructor(args = []) {
        super();
        this.args = args;
    }
}
exports.Select = Select;
class Filter extends Method {
    constructor(expression) {
        super();
        this.expression = expression;
    }
}
exports.Filter = Filter;
class InlineCount extends Method {
    constructor() {
        super();
    }
}
exports.InlineCount = InlineCount;
class Order extends Method {
    constructor(property, type) {
        super();
        this.property = property;
        this.type = type;
    }
}
exports.Order = Order;
class Top extends Method {
    constructor(value) {
        super();
        this.value = value;
    }
}
exports.Top = Top;
class Skip extends Method {
    constructor(value) {
        super();
        this.value = value;
    }
}
exports.Skip = Skip;
class Find {
    constructor(value, expression) {
        this.value = value;
        this.expression = expression;
    }
}
exports.Find = Find;
class This {
}
exports.This = This;
class Root {
    constructor() {
    }
}
exports.Root = Root;
class DataSource {
    constructor(name, expression) {
        this.name = name;
        this.expression = expression;
    }
}
exports.DataSource = DataSource;
class SelectMany {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }
}
exports.SelectMany = SelectMany;
class Count extends Method {
    constructor(expression) {
        super();
        this.expression = expression;
    }
}
exports.Count = Count;
class Expand extends Method {
    constructor(args) {
        super();
        this.args = args;
    }
}
exports.Expand = Expand;
class SourceGet {
    constructor(expressions) {
        this.expressions = expressions;
    }
}
exports.SourceGet = SourceGet;
class SourceAdd {
    constructor() {
    }
}
exports.SourceAdd = SourceAdd;
class Value {
    constructor(value) {
        this.value = value;
    }
    static isValid(value) {
        if (value == null)
            return true;
        switch (typeof value) {
            case 'string':
                return true;
            case 'number':
                return true;
            case 'boolean':
                return true;
        }
        if (value instanceof Date)
            return true;
        if (value instanceof Schema_1.Guid)
            return true;
        return false;
    }
}
exports.Value = Value;
class ModelMethod {
    constructor(name, property, args) {
        this.name = name;
        this.property = property;
        this.args = args;
    }
}
exports.ModelMethod = ModelMethod;
class GlobalMethod {
    constructor(name, ...args) {
        this.name = name;
        this.args = [];
        this.args = args;
    }
}
exports.GlobalMethod = GlobalMethod;
class Property {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }
}
exports.Property = Property;
class It {
}
exports.It = It;
class EqBinary {
    constructor(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
    }
}
exports.EqBinary = EqBinary;
class RefExpression {
    constructor(expression, next) {
        this.expression = expression;
        this.next = next;
    }
}
exports.RefExpression = RefExpression;
class ExpressionVisitor {
    visit(host) {
        if (host instanceof Root)
            this.root(host);
        else if (host instanceof This)
            this.this(host);
        else if (host instanceof Property)
            this.property(host);
        else if (host instanceof Operation)
            this.operation(host);
        else if (host instanceof Select)
            this.select(host);
        else if (host instanceof SelectMany)
            this.selectMany(host);
        else if (host instanceof Filter)
            this.filter(host);
        else if (host instanceof Find)
            this.find(host);
        else if (host instanceof Count)
            this.count(host);
        else if (host instanceof Order)
            this.order(host);
        else if (host instanceof Expand)
            this.expand(host);
        else if (host instanceof Top)
            this.top(host);
        else if (host instanceof Skip)
            this.skip(host);
        else if (host instanceof InlineCount)
            this.inlineCount(host);
        else if (host instanceof Method)
            this.method(host);
        else if (host instanceof Value)
            this.value(host);
        else if (host instanceof ModelMethod)
            this.modelMethod(host);
        else if (host instanceof EqBinary)
            this.eqBinary(host);
        else if (host instanceof It)
            this.it(host);
        else if (host instanceof GlobalMethod)
            this.globalMethod(host);
    }
    operation(op) {
    }
    find(find) {
    }
    count(count) {
    }
    it(it) {
    }
    select(select) {
    }
    selectMany(selectMany) {
    }
    filter(filter) {
    }
    order(order) {
    }
    expand(expand) {
    }
    top(top) {
    }
    skip(skip) {
    }
    inlineCount(inlineCount) {
    }
    method(method) {
    }
    value(value) {
    }
    modelMethod(value) {
    }
    property(property) {
    }
    eqBinary(eqBinary) {
    }
    refExpression(refExpression) {
    }
    root(root) {
    }
    this($this) {
    }
    globalMethod(globalMethod) {
    }
}
exports.ExpressionVisitor = ExpressionVisitor;
//# sourceMappingURL=Expressions.js.map