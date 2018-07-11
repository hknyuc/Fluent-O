"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RestClient_1 = require("./RestClient");
const Schema_1 = require("./Schema");
const Expressions_1 = require("./Expressions");
class ODataVisitor extends Expressions_1.ExpressionVisitor {
    constructor() {
        super(...arguments);
        this._result = null;
    }
    get visited() {
        return this._result != null;
    }
    get result() {
        return this._result;
    }
    set(raw) {
        this._result = raw;
    }
    method(method) {
        // console.log(method["prototype"]["consructor"]["name"]);
    }
    find(find) {
        if (find.value == null)
            throw new Error('find: value could not be null or undefined');
        let getAsStruct = function (value) {
            let visitor = new ODataVisitor();
            visitor.visit(value);
            if (!visitor.visited)
                throw new Error('find: value is not valid');
            return visitor.result;
        };
        let str = "";
        if (Expressions_1.Value.isValid(find.value)) {
            str = getAsStruct(new Expressions_1.Value(find.value));
        }
        else {
            let props = [];
            let obj = find.value;
            for (let prop in obj) {
                let value = obj[prop];
                if (Expressions_1.Value.isValid(value)) {
                    props.push(prop + "=" + getAsStruct(new Expressions_1.Value(value)));
                }
            }
            str = props.join(',');
        }
        if (find.expression == null) {
            this.set('(' + str + ")");
            return;
        }
        let beforeVisitor = new ODataVisitor();
        beforeVisitor.visit(find.expression);
        if (!beforeVisitor.visited)
            throw new Error('find: parent expression could not resolved');
        this.set(beforeVisitor.result + '(' + str + ')');
    }
    selectMany(selectMany) {
        if (selectMany.parent != null) {
            let parentVisitor = new ODataVisitor();
            parentVisitor.visit(selectMany.parent);
            if (!parentVisitor.visited)
                throw new Error('selectMany: property is undefined');
            this.set(parentVisitor.result + '/' + selectMany.name);
            return;
        }
        else
            this.set("/" + selectMany.name);
    }
    count(count) {
        if (count.expression != null) {
            let visitor = new ODataVisitor();
            visitor.visit(count.expression);
            if (!visitor.visited)
                throw new Error('count: inner expression could not be resolved');
            this.set(visitor.result + '/$count');
            return;
        }
        this.set('$count=true&$top=0');
    }
    select(select) {
        let results = [];
        select.args.forEach(function (arg) {
            let propertyVisitor = new ODataVisitor();
            propertyVisitor.visit(arg.property);
            if (!propertyVisitor.visited)
                throw new Error("selecrt: property invalid :" + JSON.stringify(arg.property));
            if (arg.expression == null) {
                results.push(propertyVisitor.result);
                return true;
            }
            let expressionVisitor = new ODataVisitor();
            expressionVisitor.visit(arg.expression);
            if (!expressionVisitor.visited) {
                throw new Error("select :" + arg.property.name + "'s expression is invalid");
            }
            results.push(propertyVisitor.result + "(" + expressionVisitor.result + ")");
            return true;
        });
        this.set("$select=" + results.join(','));
    }
    order(order) {
        this.set('$orderby=' + order.property.name + (order.type != null ? " " + order.type : ''));
    }
    top(top) {
        this.set('$top=' + top.value);
    }
    skip(skip) {
        this.set("$skip=" + skip.value);
    }
    inlineCount() {
        this.set("$inlineCount");
    }
    filter(filter) {
        let visitor = new ODataVisitor();
        visitor.visit(filter.expression);
        if (!visitor.visited)
            throw new Error('filter: expression could not be resolved');
        let right = visitor.result;
        if (right.indexOf('/') === 0)
            right = right.substring(1, right.length);
        this.set("$filter=" + right);
    }
    expand(expand) {
        let propertyVisitor = new ODataVisitor();
        let result = expand.args.map(function (arg) {
            propertyVisitor.visit(arg.property);
            if (!propertyVisitor.visited)
                throw new Error("expand: invalid property :" + JSON.stringify(arg.property));
            let expressionArray = [];
            arg.expressions.forEach(function (expression) {
                let expVisitor = new ODataVisitor();
                expVisitor.visit(expression);
                if (expVisitor.visited)
                    expressionArray.push(expVisitor.result);
            });
            return propertyVisitor.result + (expressionArray.length != 0 ? "(" + expressionArray.join(';') + ")" : '');
        });
        this.set('$expand=' + result.join(','));
        return;
    }
    value(value) {
        let v = value.value;
        let type = typeof v;
        let r = "";
        if (v == null)
            r = "null";
        else if (type === "string")
            r = "'" + v + "'";
        else if (type === "number")
            r = v;
        else if (v instanceof Date)
            r = "d'" + v + "'";
        else if (v instanceof Schema_1.Guid)
            r = "g'" + v.toString() + "'";
        this.set(r);
    }
    modelMethod(value) {
        let propertyVisitor = new ODataVisitor();
        propertyVisitor.visit(value.property);
        if (!propertyVisitor.visited)
            throw new Error('modelMethod: property could not be resolved');
        if (value.args.length == 0) {
            this.set(value.name + "(" + propertyVisitor.result + ")");
            return;
        }
        let argsArray = [];
        value.args.forEach(function (arg, index) {
            let argsVisitor = new ODataVisitor();
            argsVisitor.visit(arg);
            if (!argsVisitor.visited)
                throw new Error('modelMethod: argument index of ' + index + ' could not be resolved');
            argsArray.push(argsVisitor.result);
        });
        this.set(value.name + "(" + propertyVisitor.result + "," + argsArray.join(',') + ")");
    }
    property(property) {
        if (property.parent != null) {
            let visitor = new ODataVisitor();
            visitor.visit(property.parent);
            if (!visitor.visited)
                throw new Error('property : expression could not be resolved');
            this.set(visitor.result + "." + property.name);
            return;
        }
        this.set(property.name);
    }
    eqBinary(eqBinary) {
        let leftVisitor = new ODataVisitor();
        leftVisitor.visit(eqBinary.left);
        if (!leftVisitor.visited)
            throw new Error('eqBinary: left expression could not be resolved');
        let rightVisitor = new ODataVisitor();
        rightVisitor.visit(eqBinary.right);
        if (!rightVisitor.visited)
            throw new Error('eqBinary: right expression could not be resolved');
        this.set(leftVisitor.result + " " + eqBinary.op.type + " " + rightVisitor.result);
    }
    it(it) {
        this.set('$it');
    }
    this($this) {
        this.set('$this');
    }
    root(root) {
        this.set('$root');
    }
}
exports.ODataVisitor = ODataVisitor;
/**
 * Combines expression as one
 */
class ODataCombineVisitor extends Expressions_1.ExpressionVisitor {
    constructor() {
        super(...arguments);
        this.expressions = [];
    }
    get result() {
        let result = this.expressions.map(function (elem) {
            return elem.value;
        });
        return result;
    }
    distinct(arr) {
        return arr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }
    set(key, empy, nonEmpty) {
        let indexOfItem = this.expressions.findIndex(function (elem) {
            return elem.key === key;
        });
        if (indexOfItem < 0) {
            this.expressions.push({
                key: key,
                value: empy()
            });
            return;
        }
        this.expressions[indexOfItem] = {
            key: key,
            value: nonEmpty(this.expressions[indexOfItem].value)
        };
    }
    push(value) {
        this.expressions.push({
            key: Schema_1.Guid.new().toString(),
            value: value
        });
    }
    select(select) {
        let self = this;
        this.set('select', () => new Expressions_1.Select([].concat(select.args)), (item) => new Expressions_1.Select(self.distinct(item.args.concat(select.args))));
    }
    count(count) {
        this.set('count', () => count, () => count);
    }
    top(top) {
        this.set('top', () => top, () => top);
    }
    skip(skip) {
        this.set('skip', () => skip, () => skip);
    }
    it(it) {
        this.push(it);
    }
    this($this) {
        this.push($this);
    }
    root(root) {
        this.push(root);
    }
    order(order) {
        this.set('order', () => order, () => order);
    }
    inlineCount(inlineCount) {
        this.set('inlineCount', () => inlineCount, () => inlineCount);
    }
    expand(expand) {
        this.set('expand', () => expand, (elem) => {
            let args = elem.args.concat(expand.args);
            return new Expressions_1.Expand(args);
        });
    }
    filter(filter) {
        this.set("filter", () => filter, (f) => {
            return new Expressions_1.Filter(new Expressions_1.EqBinary(f.expression, new Expressions_1.Operation('or'), filter.expression));
        });
    }
    selectMany(selectMany) {
        this.push(selectMany);
    }
    operation(op) {
        this.push(op);
    }
    find(find) {
        this.push(find);
    }
    method(method) {
        this.push(method);
    }
    value(value) {
        this.push(value);
    }
    modelMethod(value) {
        this.push(value);
    }
    property(property) {
        this.property(property);
    }
    eqBinary(eqBinary) {
        this.push(eqBinary);
    }
    refExpression(refExpression) {
        this.push(refExpression);
    }
}
exports.ODataCombineVisitor = ODataCombineVisitor;
class ODataSet {
    constructor(options) {
        this.options = options;
    }
    get(...expressions) {
        let result = this.createHttp().get(this.options.source + QuerySet.get.apply(QuerySet, arguments));
        if (this.options.arrayable == null || this.options.arrayable === false)
            return result;
        let anyCount = expressions.some((exp) => exp instanceof Expressions_1.Count);
        if (anyCount) {
            return result.then((response) => {
                return response.json()["@odata.count"];
            });
        }
        else {
            return result.then((response) => {
                let r = response.json();
                let isArray = function () {
                    for (let i in r) {
                        if (!(i.startsWith("@odata") || i === "value"))
                            return false;
                    }
                    return r["value"] != null && Array.isArray(r["value"]);
                };
                if (isArray) {
                    return r.value;
                }
                return r;
            });
        }
    }
    add(element) {
        return this.createHttp().post(this.options.source, element);
    }
    delete(element) {
        return this.createHttp().delete(this.options.source, element);
    }
    update(element) {
        return this.createHttp().put(this.options.source, element);
    }
    createHttp() {
        if (this.options.rest != null)
            return this.options.rest;
        return ODataConfig.createHttp();
    }
}
exports.ODataSet = ODataSet;
class QuerySet {
    static get(...expressions) {
        let combineVisitor = new ODataCombineVisitor();
        expressions.forEach(function (expression) {
            combineVisitor.visit(expression);
        });
        let left = [];
        let right = [];
        combineVisitor.result.forEach(function (expression) {
            let visitor = new ODataVisitor();
            visitor.visit(expression);
            if (visitor.visited) {
                if (expression instanceof Expressions_1.Method)
                    right.push(visitor.result);
                else
                    left.push(visitor.result);
            }
        });
        if (left.length == 0 && right.length != 0)
            return "?" + right.join('&');
        if (left.length != 0 && right.length != 0)
            return left.join('') + "?" + right.join('&');
        if (left.length == 0 && right.length == 0)
            return "";
        if (left.length != 0 && right.length == 0)
            return left.join('');
        return '';
    }
}
exports.QuerySet = QuerySet;
exports.entity = function (name) {
    return {
        get: function (...expressions) {
            return {
                asQuery: function () {
                    let result = QuerySet.get.apply(null, expressions);
                    if (result.indexOf('$') == 0)
                        return name + "?" + result;
                    return name + result;
                }
            };
        }
    };
};
class ODataConfig {
    static createHttp() {
        return new RestClient_1.RestClient();
    }
}
exports.ODataConfig = ODataConfig;
//# sourceMappingURL=OData.js.map