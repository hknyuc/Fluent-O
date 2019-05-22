"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataset_1 = require("./dataset");
const schema_1 = require("./schema");
const expressions_1 = require("./expressions");
const http_1 = require("./http");
const core_1 = require("./core");
class ODataVisitor extends expressions_1.ExpressionVisitor {
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
    globalMethod(global) {
        if (global.args.length == 0) {
            this.set(global.name + ("()"));
        }
        else {
            let args = [];
            global.args.forEach((arg) => {
                let visitor = new ODataVisitor();
                visitor.visit(arg);
                args.push(visitor.result);
            });
            this.set(global.name + "(" + args.join(',') + ")");
        }
    }
    action(action) {
        let result = "/" + action.name;
        /*
        let params = [];
        action.parameters.forEach((param)=>{
            let visitor = new ODataVisitor();
            visitor.visit(visitor.result);
            params.push(param);
        })
        if(params.length != 0)
           result += "("+ params.join(',') +")";
           */
        this.set(result);
    }
    func(func) {
        let result = "/" + func.name;
        let params = [];
        func.parameters.forEach((param) => {
            let visitor = new ODataVisitor();
            visitor.visit(param);
            params.push(visitor.result);
        });
        if (params.length != 0)
            result += "(" + params.join(',') + ")";
        this.set(result);
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
        if (expressions_1.Value.isValid(find.value)) {
            str = getAsStruct(new expressions_1.Value(find.value));
        }
        else {
            let props = [];
            let obj = find.value;
            for (let prop in obj) {
                let value = obj[prop];
                if (expressions_1.Value.isValid(value)) {
                    props.push(prop + "=" + getAsStruct(new expressions_1.Value(value)));
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
        let distinct = (value, index, self) => self.indexOf(value) === index;
        this.set("$select=" + results.filter(distinct).join(','));
    }
    order(order) {
        let odataVisitor = new ODataVisitor();
        odataVisitor.visit(order.property);
        this.set('$orderby=' + odataVisitor.result + (order.type != null ? " " + order.type : ''));
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
            let combineVisitor = new ODataCombineVisitor();
            arg.expressions.forEach(function (expression) {
                combineVisitor.visit(expression);
            });
            combineVisitor.result.forEach(function (expression) {
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
        else if (type === "boolean")
            r = v ? "true" : "false";
        else if (type === "string")
            r = "'" + v + "'";
        else if (type === "number")
            r = v;
        else if (core_1.Utility.instanceof(v, Date))
            r = v.toISOString();
        else if (core_1.Utility.instanceof(v, schema_1.Guid))
            r = "" + v.toString() + "";
        else if (core_1.Utility.instanceof(v, Object)) {
            let params = [];
            for (let i in v) {
                let value = v[i];
                if (!(core_1.Utility.instanceof(value, expressions_1.Value)))
                    value = new expressions_1.Value(value);
                let visitor = new ODataVisitor();
                visitor.visit(value);
                params.push(i + "=" + visitor.result);
            }
            r = params.join(',');
        }
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
                throw new Error('modelMethod: argument index of ' + index + ' could not be resolved :' + JSON.stringify(arg));
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
            this.set(visitor.result + "/" + property.name);
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
        this.set("(" + leftVisitor.result + " " + eqBinary.op.type + " " + rightVisitor.result + ")");
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
class ODataCombineVisitor extends expressions_1.ExpressionVisitor {
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
    action(action) {
        this.set('action', () => action, () => action);
    }
    func(func) {
        this.set('func', () => func, () => func);
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
            key: schema_1.Guid.new().toString(),
            value: value
        });
    }
    select(select) {
        let self = this;
        this.set('select', () => new expressions_1.Select([].concat(select.args)), (item) => new expressions_1.Select(self.distinct(item.args.concat(select.args))));
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
            let args = elem.args.map(x => x).concat(expand.args);
            let result = new expressions_1.Expand(args);
            return result;
        });
    }
    filter(filter) {
        this.set("filter", () => filter, (f) => {
            if (f.expression == null)
                return new expressions_1.Filter(filter.expression);
            return new expressions_1.Filter(new expressions_1.EqBinary(f.expression, new expressions_1.Operation('and'), filter.expression));
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
function idselector(ids) {
    return {
        apply: function (value) {
            for (let i in value) {
                if (ids.some((elem) => elem === i))
                    return value[i];
            }
            return null;
        }
    };
}
exports.idselector = idselector;
class ODataSet extends dataset_1.DataSet {
    constructor(options) {
        super(options.expressions || []);
        this.options = options;
    }
    query(...expressions) {
        let newOptions = {
            url: this.options.url,
            http: this.options.http,
            arrayable: this.options.arrayable,
            expressions: this.appylExpression(expressions),
            primary: this.options.primary
        };
        return new ODataSet(newOptions);
    }
    toString() {
        return QuerySet.get.apply(null, this.options.expressions);
    }
    appylExpression(expressions) {
        let optExpressions = this.options.expressions || [];
        if (core_1.Utility.instanceof(expressions[0], expressions_1.Find)) { // filter after find. filter is not necassary
            optExpressions = optExpressions.filter(x => !(core_1.Utility.instanceof(x, expressions_1.Filter)) && !(core_1.Utility.instanceof(x, expressions_1.Order)));
        }
        ;
        return Array.isArray(optExpressions) ? optExpressions.map(x => x).concat(expressions) : expressions.map(x => x);
    }
    getBody(expressions) {
        let body = expressions.filter(x => core_1.Utility.instanceof(x, expressions_1.Action)).map(x => x.parameters).reduce((c, n) => {
            return c.concat(n);
        }, []).reduce((c, n) => {
            return new expressions_1.Value(Object.assign({}, c.value, n.value));
        }, new expressions_1.Value({}));
        return body.value;
    }
    anyBody(expressions) {
        return expressions.some(a => core_1.Utility.instanceof(a, expressions_1.Action));
    }
    getMethod(expressions) {
        if (this.anyBody(expressions))
            return this.createHttp().post;
        return this.createHttp().get;
    }
    invokeHttpMethod(expressions) {
        let http = this.createHttp();
        let fn = this.anyBody(expressions) ? http.post : http.get;
        let result = fn.apply(http, [this.options.url + QuerySet.get.apply(QuerySet, expressions), this.getBody(expressions)]);
        return result;
    }
    get(...expressions) {
        let optExpressions = this.appylExpression(expressions);
        let result = this.invokeHttpMethod(optExpressions);
        if (this.options.arrayable == null || this.options.arrayable === false)
            return result;
        let anyCount = optExpressions.some((exp) => core_1.Utility.instanceof(exp, expressions_1.Count));
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
                    if (r == null)
                        return false;
                    if (r === "")
                        return false;
                    return r["value"] != null && Array.isArray(r["value"]);
                };
                if (isArray()) {
                    return r.value;
                }
                let prune = function (value) {
                    let result = {};
                    for (let i in value) {
                        if (i.startsWith('@odata.'))
                            continue;
                        result[i] = value[i];
                    }
                    return result;
                };
                let result = prune(r);
                let onlyValue = Object.keys(result).length === 1 && result["value"] != null;
                return onlyValue ? result["value"] : result;
            });
        }
    }
    __convertObject(value) {
        let result = {};
        for (let i in value) {
            if (value[i] == null)
                continue;
            if (dataset_1.DataSet.is(value[i]))
                continue;
            if (this.__isEmptyObject(value[i]))
                continue;
            result[i] = this.__convert(value[i]);
        }
        return result;
    }
    __isEmptyObject(obj) {
        if (obj == null)
            return true;
        if (Array.isArray(obj) && obj.length == 0)
            return true;
        if (Array.isArray(obj))
            return false;
        for (let i in obj) {
            if (obj[i] != null)
                return false;
            if (this.__isEmptyObject(obj[i]))
                return true;
        }
        return false;
    }
    __convertArray(values) {
        let result = [];
        values.forEach((elem) => {
            result.push(this.__convert(elem));
        });
        return result;
    }
    __convert(values) {
        if (values == null)
            return null;
        if (core_1.Utility.instanceof(values, schema_1.Guid))
            return values.value;
        if (core_1.Utility.instanceof(values, Date))
            return ODataSet.__dateToIsoUTC(values);
        if (Array.isArray(values))
            return this.__convertArray(values);
        if (typeof values === "object")
            return this.__convertObject(values);
        return values;
    }
    static __dateToIsoUTC(date) {
        let tzo = -date.getTimezoneOffset(), dif = tzo >= 0 ? '+' : '-', pad = function (num) {
            let norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            dif + pad(tzo / 60) +
            ':' + pad(tzo % 60);
    }
    add(element) {
        return this.createHttp().post(this.options.url, this.__convert(element));
    }
    delete(element) {
        return this.createHttp().delete(this.options.url + this.getPrimaryValue(element));
    }
    update(element) {
        return this.createHttp().put(this.options.url + this.getPrimaryValue(element), this.__convert(element));
    }
    getIdsValue(element) {
        let valids = ["id", "ID", "Id", "iD"];
        for (let i in element)
            if (valids.some((elem) => elem === i))
                return element[i];
        return null;
    }
    getPrimaryValue(element) {
        if (this.options.primary == null) {
            let visitor = new ODataVisitor();
            visitor.visit(new expressions_1.Value(this.getIdsValue(element)));
            return "(" + visitor.result + ")";
        }
        let v = element[this.options.primary.name];
        let type = this.options.primary.type;
        if (type === schema_1.Guid && typeof v === "string") {
            v = new schema_1.Guid(v);
        }
        else if (type === Date && typeof v === "string") {
            v = new Date(v);
        }
        let visitor = new ODataVisitor();
        visitor.visit(new expressions_1.Value(v));
        return "(" + visitor.result + ")";
    }
    createHttp() {
        if (this.options.http != null)
            return this.options.http;
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
                if (core_1.Utility.instanceof(expression, expressions_1.Method))
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
        return new http_1.Http();
    }
}
exports.ODataConfig = ODataConfig;
