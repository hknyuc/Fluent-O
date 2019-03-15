"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
const core_1 = require("./core");
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
    reduce(...params) {
        return params.reduce((ac, c) => {
            return new Select([].concat(ac.args, c.args));
        }, this);
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
class Action {
    constructor(name, parameters) {
        this.name = name;
        this.parameters = parameters;
    }
}
exports.Action = Action;
class Func {
    constructor(name, parameters) {
        this.name = name;
        this.parameters = parameters;
    }
}
exports.Func = Func;
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
        if (core_1.Utility.instanceof(value, Date))
            return true;
        if (core_1.Utility.instanceof(value, schema_1.Guid))
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
        let is = function (a) {
            return core_1.Utility.instanceof(host, a);
        };
        if (is(Root))
            return this.root(host);
        if (is(This))
            return this.this(host);
        if (is(Property))
            return this.property(host);
        if (is(Operation))
            return this.operation(host);
        if (is(Select))
            return this.select(host);
        if (is(SelectMany))
            return this.selectMany(host);
        if (is(Filter))
            return this.filter(host);
        if (is(Find))
            return this.find(host);
        if (is(Count))
            return this.count(host);
        if (is(Order))
            return this.order(host);
        if (is(Expand))
            return this.expand(host);
        if (is(Top))
            return this.top(host);
        if (is(Skip))
            return this.skip(host);
        if (is(InlineCount))
            return this.inlineCount(host);
        if (is(Method))
            return this.method(host);
        if (is(Value))
            return this.value(host);
        if (Value.isValid(host))
            return this.value(new Value(host));
        if (is(ModelMethod))
            return this.modelMethod(host);
        if (is(EqBinary))
            return this.eqBinary(host);
        if (is(It))
            return this.it(host);
        if (is(GlobalMethod))
            return this.globalMethod(host);
        if (is(Action))
            return this.action(host);
        if (is(Func))
            return this.func(host);
        return Promise.reject('not found');
    }
    operation(op) {
    }
    find(find) {
    }
    action(action) {
    }
    func(func) {
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
class Memorize {
}
exports.Memorize = Memorize;
