"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./Schema");
const MemArrayVisitor_1 = require("./MemArrayVisitor");
const OData_1 = require("./OData");
const Expressions_1 = require("./Expressions");
class EqBinaryExtend extends Expressions_1.EqBinary {
    constructor(eqBinary) {
        super(eqBinary.left, eqBinary.op, eqBinary.right);
    }
    create(op, value) {
        let v = value;
        if (Expressions_1.Value.isValid(value)) {
            v = new Expressions_1.Value(value);
        }
        return new EqBinaryExtend(new Expressions_1.EqBinary(this, new Expressions_1.Operation(op), v));
    }
    and(value) {
        return this.create('and', value);
    }
    or(value) {
        return this.create('or', value);
    }
    eq(value) {
        return this.create('eq', value);
    }
    lt(value) {
        return this.create('lt', value);
    }
    le(value) {
        return this.create('le', value);
    }
    gt(value) {
        return this.create('gt', value);
    }
    ge(value) {
        return this.create("ge", value);
    }
    ne(value) {
        return this.create('ne', value);
    }
}
exports.EqBinaryExtend = EqBinaryExtend;
class ModelMethodExtend extends Expressions_1.ModelMethod {
    constructor(name, property, args) {
        super(name, property, args);
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    create(op, value) {
        return o(this, op, value);
    }
    and(value) {
        return this.create('and', value);
    }
    or(value) {
        return this.create('or', value);
    }
    gt(value) {
        return this.create('gt', value);
    }
    ge(value) {
        return this.create('ge', value);
    }
    lt(value) {
        return this.create('lt', value);
    }
    le(value) {
        return this.create('le', value);
    }
    eq(value) {
        return this.create('eq', value);
    }
    ne(value) {
        return this.create('ne', value);
    }
    count() {
        return new CountExtend(this);
    }
    concat(value) {
        return this.createMethod('concat', value);
    }
    selectMany(name) {
        return selectMany(name, this);
    }
    contains(value) {
        return this.createMethod('contains', value);
    }
    endsWith(value) {
        return this.createMethod('endswith', value);
    }
    indexof(value) {
        return this.createMethod('indexof', value);
    }
    length(value) {
        return this.createMethod('length', value);
    }
    startsWith(value) {
        return this.createMethod('startswith', value);
    }
    substring(start, end) {
        if (end == null)
            return this.createMethod('substring', start);
        return this.createMethod('substring', start, end);
    }
    toLower() {
        return this.createMethod('tolower');
    }
    toUpper() {
        return this.createMethod('toupper');
    }
    trim() {
        return this.createMethod('trim');
    }
    date() {
        return this.createMethod('date');
    }
    day() {
        return this.createMethod('day');
    }
    fractionalseconds() {
        return this.createMethod('fractionalseconds');
    }
    hour() {
        return this.createMethod('hour');
    }
    maxdatetime() {
        return this.createMethod('maxdatetime');
    }
    mindatetime() {
        return this.createMethod('mindatetime');
    }
    minute() {
        return this.createMethod('minute');
    }
    month() {
        return this.createMethod('month');
    }
    now() {
        return this.createMethod('now');
    }
    second() {
        return this.createMethod('second');
    }
    time() {
        return this.createMethod('time');
    }
    totaloffsetminutes() {
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds() {
        return this.createMethod('totalseconds');
    }
    year() {
        return this.createMethod('year');
    }
    ceiling() {
        return this.createMethod('ceiling');
    }
    floor() {
        return this.createMethod('floor');
    }
    round() {
        return this.createMethod('round');
    }
}
exports.ModelMethodExtend = ModelMethodExtend;
/**
 * creates odata data set
 * @param {Object} options options options of data
 * @param {String} options.url url of source.
 * @param {Object} options.http http provider. default is {XMLHttpRequest}
 * @param {Boolean} options.arrayable it changes behaviour of get methods. likes array data structure. Default is false
 * @returns {ODataSet} OData data set
 */
exports.odataset = function (options) {
    return new OData_1.ODataSet(options);
};
const method = function (name, ...properties) {
    let props = [];
    properties.forEach((elem) => {
        if (Expressions_1.Value.isValid(elem))
            props.push(new Expressions_1.Value(elem));
        else
            props.push(elem);
    });
    return new ModelMethodExtend(name, this, props);
};
class PropertyExtend extends Expressions_1.Property {
    create(op, value) {
        let v = value;
        if (!(value instanceof Expressions_1.Property)) {
            v = new Expressions_1.Value(value);
        }
        return new EqBinaryExtend(new Expressions_1.EqBinary(this, new Expressions_1.Operation(op), v));
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    and(value) {
        return this.create('and', value);
    }
    or(value) {
        return this.create('or', value);
    }
    eq(value) {
        return this.create('eq', value);
    }
    lt(value) {
        return this.create('lt', value);
    }
    le(value) {
        return this.create('le', value);
    }
    gt(value) {
        return this.create('gt', value);
    }
    ge(value) {
        return this.create("ge", value);
    }
    ne(value) {
        return this.create('ne', value);
    }
    count() {
        return new CountExtend(this);
    }
    concat(value) {
        return this.createMethod('concat', value);
    }
    selectMany(name) {
        return selectMany(name, this);
    }
    contains(value) {
        return this.createMethod('contains', value);
    }
    endsWith(value) {
        return this.createMethod('endswith', value);
    }
    indexof(value) {
        return this.createMethod('indexof', value);
    }
    length(value) {
        return this.createMethod('length', value);
    }
    startsWith(value) {
        return this.createMethod('startswith', value);
    }
    substring(start, end) {
        if (end == null)
            return this.createMethod('substring', start);
        return this.createMethod('substring', start, end);
    }
    toLower() {
        return this.createMethod('tolower');
    }
    toUpper() {
        return this.createMethod('toupper');
    }
    trim() {
        return this.createMethod('trim');
    }
    date() {
        return this.createMethod('date');
    }
    day() {
        return this.createMethod('day');
    }
    fractionalseconds() {
        return this.createMethod('fractionalseconds');
    }
    hour() {
        return this.createMethod('hour');
    }
    maxdatetime() {
        return this.createMethod('maxdatetime');
    }
    mindatetime() {
        return this.createMethod('mindatetime');
    }
    minute() {
        return this.createMethod('minute');
    }
    month() {
        return this.createMethod('month');
    }
    now() {
        return this.createMethod('now');
    }
    second() {
        return this.createMethod('second');
    }
    time() {
        return this.createMethod('time');
    }
    totaloffsetminutes() {
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds() {
        return this.createMethod('totalseconds');
    }
    year() {
        return this.createMethod('year');
    }
    ceiling() {
        return this.createMethod('ceiling');
    }
    floor() {
        return this.createMethod('floor');
    }
    round() {
        return this.createMethod('round');
    }
}
exports.PropertyExtend = PropertyExtend;
class SelectManyExtend extends Expressions_1.SelectMany {
    constructor(name, property) {
        super(name, property);
    }
    create(op, value) {
        let v = value;
        if (Expressions_1.Value.isValid(value))
            v = new Expressions_1.Value(value);
        return new EqBinaryExtend(new Expressions_1.EqBinary(this, new Expressions_1.Operation(op), v));
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    and(value) {
        return this.create('and', value);
    }
    or(value) {
        return this.create('or', value);
    }
    eq(value) {
        return this.create('eq', value);
    }
    lt(value) {
        return this.create('lt', value);
    }
    le(value) {
        return this.create('le', value);
    }
    gt(value) {
        return this.create('gt', value);
    }
    ge(value) {
        return this.create("ge", value);
    }
    ne(value) {
        return this.create('ne', value);
    }
    count() {
        return new CountExtend(this);
    }
    concat(value) {
        return this.createMethod('concat', value);
    }
    selectMany(name) {
        return selectMany(name, this);
    }
    contains(value) {
        return this.createMethod('contains', value);
    }
    endsWith(value) {
        return this.createMethod('endswith', value);
    }
    indexof(value) {
        return this.createMethod('indexof', value);
    }
    length(value) {
        return this.createMethod('length', value);
    }
    startSwith(value) {
        return this.createMethod('startswith', value);
    }
    substring(start, end) {
        if (end == null)
            return this.createMethod('substring', start);
        return this.createMethod('substring', start, end);
    }
    toLower() {
        return this.createMethod('tolower');
    }
    toUpper() {
        return this.createMethod('toupper');
    }
    trim() {
        return this.createMethod('trim');
    }
    date() {
        return this.createMethod('date');
    }
    day() {
        return this.createMethod('day');
    }
    fractionalseconds() {
        return this.createMethod('fractionalseconds');
    }
    hour() {
        return this.createMethod('hour');
    }
    maxdatetime() {
        return this.createMethod('maxdatetime');
    }
    mindatetime() {
        return this.createMethod('mindatetime');
    }
    minute() {
        return this.createMethod('minute');
    }
    month() {
        return this.createMethod('month');
    }
    now() {
        return this.createMethod('now');
    }
    second() {
        return this.createMethod('second');
    }
    time() {
        return this.createMethod('time');
    }
    totaloffsetminutes() {
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds() {
        return this.createMethod('totalseconds');
    }
    year() {
        return this.createMethod('year');
    }
    ceiling() {
        return this.createMethod('ceiling');
    }
    floor() {
        return this.createMethod('floor');
    }
    round() {
        return this.createMethod('round');
    }
    find(value) {
        return new FindExtend(value, this);
    }
}
exports.SelectManyExtend = SelectManyExtend;
class ThisExtend extends PropertyExtend {
    constructor() {
        super('$this');
    }
}
exports.ThisExtend = ThisExtend;
class CountExtend extends Expressions_1.Count {
    create(op, value) {
        let v = value;
        if (Expressions_1.Value.isValid(value))
            v = new Expressions_1.Value(value);
        return new EqBinaryExtend(new Expressions_1.EqBinary(this, new Expressions_1.Operation(op), v));
    }
    and(value) {
        return this.create('and', value);
    }
    or(value) {
        return this.create('or', value);
    }
    eq(value) {
        return this.create('eq', value);
    }
    lt(value) {
        return this.create('lt', value);
    }
    le(value) {
        return this.create('le', value);
    }
    gt(value) {
        return this.create('gt', value);
    }
    ge(value) {
        return this.create("ge", value);
    }
    ne(value) {
        return this.create('ne', value);
    }
}
exports.CountExtend = CountExtend;
class RootExtend extends Expressions_1.Root {
    create(op, value) {
        let v = value;
        if (!(value instanceof Expressions_1.Root)) {
            v = new Expressions_1.Value(value);
        }
        return new EqBinaryExtend(new Expressions_1.EqBinary(this, new Expressions_1.Operation(op), v));
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    and(value) {
        return this.create('and', value);
    }
    or(value) {
        return this.create('or', value);
    }
    eq(value) {
        return this.create('eq', value);
    }
    lt(value) {
        return this.create('lt', value);
    }
    le(value) {
        return this.create('le', value);
    }
    gt(value) {
        return this.create('gt', value);
    }
    ge(value) {
        return this.create("ge", value);
    }
    ne(value) {
        return this.create('ne', value);
    }
    count() {
        return new CountExtend(this);
    }
    concat(value) {
        return this.createMethod('concat', value);
    }
    selectMany(name) {
        return selectMany(name, this);
    }
    contains(value) {
        return this.createMethod('contains', value);
    }
    endsWith(value) {
        return this.createMethod('endswith', value);
    }
    indexof(value) {
        return this.createMethod('indexof', value);
    }
    length(value) {
        return this.createMethod('length', value);
    }
    startsWith(value) {
        return this.createMethod('startswith', value);
    }
    substring(start, end) {
        if (end == null)
            return this.createMethod('substring', start);
        return this.createMethod('substring', start, end);
    }
    toLower() {
        return this.createMethod('tolower');
    }
    toUpper() {
        return this.createMethod('toupper');
    }
    trim() {
        return this.createMethod('trim');
    }
    date() {
        return this.createMethod('date');
    }
    day() {
        return this.createMethod('day');
    }
    fractionalseconds() {
        return this.createMethod('fractionalseconds');
    }
    hour() {
        return this.createMethod('hour');
    }
    maxdatetime() {
        return this.createMethod('maxdatetime');
    }
    mindatetime() {
        return this.createMethod('mindatetime');
    }
    minute() {
        return this.createMethod('minute');
    }
    month() {
        return this.createMethod('month');
    }
    now() {
        return this.createMethod('now');
    }
    second() {
        return this.createMethod('second');
    }
    time() {
        return this.createMethod('time');
    }
    totaloffsetminutes() {
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds() {
        return this.createMethod('totalseconds');
    }
    year() {
        return this.createMethod('year');
    }
    ceiling() {
        return this.createMethod('ceiling');
    }
    floor() {
        return this.createMethod('floor');
    }
    round() {
        return this.createMethod('round');
    }
}
exports.RootExtend = RootExtend;
class ItExtend extends Expressions_1.It {
    constructor() {
        super();
    }
    create(op, value) {
        let v = value;
        if (!(value instanceof Expressions_1.Root)) {
            v = new Expressions_1.Value(value);
        }
        return new EqBinaryExtend(new Expressions_1.EqBinary(this, new Expressions_1.Operation(op), v));
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    and(value) {
        return this.create('and', value);
    }
    or(value) {
        return this.create('or', value);
    }
    eq(value) {
        return this.create('eq', value);
    }
    lt(value) {
        return this.create('lt', value);
    }
    le(value) {
        return this.create('le', value);
    }
    gt(value) {
        return this.create('gt', value);
    }
    ge(value) {
        return this.create("ge", value);
    }
    ne(value) {
        return this.create('ne', value);
    }
    count() {
        return new CountExtend(this);
    }
    concat(value) {
        return this.createMethod('concat', value);
    }
    selectMany(name) {
        return selectMany(name, this);
    }
    contains(value) {
        return this.createMethod('contains', value);
    }
    endsWith(value) {
        return this.createMethod('endswith', value);
    }
    indexof(value) {
        return this.createMethod('indexof', value);
    }
    length(value) {
        return this.createMethod('length', value);
    }
    startsWith(value) {
        return this.createMethod('startswith', value);
    }
    substring(start, end) {
        if (end == null)
            return this.createMethod('substring', start);
        return this.createMethod('substring', start, end);
    }
    toLower() {
        return this.createMethod('tolower');
    }
    toUpper() {
        return this.createMethod('toupper');
    }
    trim() {
        return this.createMethod('trim');
    }
    date() {
        return this.createMethod('date');
    }
    day() {
        return this.createMethod('day');
    }
    fractionalseconds() {
        return this.createMethod('fractionalseconds');
    }
    hour() {
        return this.createMethod('hour');
    }
    maxdatetime() {
        return this.createMethod('maxdatetime');
    }
    mindatetime() {
        return this.createMethod('mindatetime');
    }
    minute() {
        return this.createMethod('minute');
    }
    month() {
        return this.createMethod('month');
    }
    now() {
        return this.createMethod('now');
    }
    second() {
        return this.createMethod('second');
    }
    time() {
        return this.createMethod('time');
    }
    totaloffsetminutes() {
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds() {
        return this.createMethod('totalseconds');
    }
    year() {
        return this.createMethod('year');
    }
    ceiling() {
        return this.createMethod('ceiling');
    }
    floor() {
        return this.createMethod('floor');
    }
    round() {
        return this.createMethod('round');
    }
}
exports.ItExtend = ItExtend;
exports.othis = new ThisExtend();
exports.$root = new RootExtend();
function count() {
    return new Expressions_1.Count(null);
}
exports.count = count;
function o(left, op, right) {
    let opValue = op;
    let leftValue = left;
    if (typeof op === "string")
        opValue = new Expressions_1.Operation(op);
    if (typeof left == "string")
        leftValue = new Expressions_1.Property(left);
    let r = right;
    if (Expressions_1.Value.isValid(right))
        r = new Expressions_1.Value(right);
    return new EqBinaryExtend(new Expressions_1.EqBinary(leftValue, opValue, r));
}
exports.o = o;
function p(name) {
    return prop(name);
}
exports.p = p;
function prop(name) {
    if (name == null)
        throw new Error('property name could not null');
    if (typeof name != "string")
        throw new Error('property name must string');
    if (name.indexOf('.') >= 0) {
        let current = null;
        name.split('.').forEach(function (item) {
            if (current == null)
                current = new PropertyExtend(item);
            else
                current = new PropertyExtend(item, current);
        });
        return current;
    }
    return new PropertyExtend(name);
}
exports.prop = prop;
function filter(expression) {
    return new Expressions_1.Filter(expression);
}
exports.filter = filter;
function select(...args) {
    let results = [];
    let appendAsString = function () {
        args.forEach(function (arg) {
            results.push({
                property: arg instanceof Expressions_1.Property ? arg : prop(arg)
            });
        });
    };
    let singleProperty = function () {
        results.push({
            property: args[0] instanceof Expressions_1.Property ? args[0] : prop(args[0]),
            expression: args[1]
        });
    };
    if (args.length == 2) {
        let allString = args.every(function (arg) {
            return typeof arg === "string";
        });
        if (allString) {
            appendAsString();
        }
        else {
            singleProperty();
        }
    }
    else {
        let indexOfNonString = args.findIndex(function (item) {
            let isString = typeof item === "string";
            let isProperty = item instanceof Expressions_1.Property;
            return !(isString || isProperty);
        });
        if (indexOfNonString >= 0) {
            throw new Error('argument index of ' + indexOfNonString + " is not property");
        }
        appendAsString();
    }
    return new Expressions_1.Select(results);
}
exports.select = select;
function top(value) {
    return new Expressions_1.Top(value);
}
exports.top = top;
function skip(value) {
    return new Expressions_1.Skip(value);
}
exports.skip = skip;
function value(value) {
    return new Expressions_1.Value(value);
}
exports.value = value;
function it() {
    return new ItExtend();
}
exports.it = it;
class FindExtend extends Expressions_1.Find {
    selectMany(name) {
        return selectMany(name, this);
    }
}
exports.FindExtend = FindExtend;
exports.$it = it();
function selectMany(name, parent) {
    /*
    if(name == null) throw new Error('selectMany:name is invalid');
    if(prop == null) throw new Error('selectMany:property is invalid');
    if(typeof name !== "string") throw new Error('selectMany:name is invalid type');
    */
    if (name == null) {
        throw new Error('selectMany: name is invalid');
    }
    if (name.indexOf('/') >= 0) {
        let sp = name.split('/');
        let current;
        sp.forEach(function (elem) {
            if (current == null)
                current = new SelectManyExtend(elem, parent);
            else
                current = new SelectManyExtend(elem, current);
        });
        return current;
    }
    return new SelectManyExtend(name, parent); //single
}
exports.selectMany = selectMany;
function order(property, type) {
    let propem = property;
    if (typeof property == "string")
        propem = prop(property);
    if (!(propem instanceof Expressions_1.Property))
        throw new Error('order :property is not valid');
    if (type == null)
        return new Expressions_1.Order(propem);
    let validTypes = ["asc", "desc"];
    if (!validTypes.some(x => x == type)) {
        throw new Error('order: type is not valid');
    }
    return new Expressions_1.Order(propem, type);
}
exports.order = order;
function orderDesc(propery) {
    return order(propery, 'desc');
}
exports.orderDesc = orderDesc;
function expand(property, ...expression) {
    let prop = property;
    if (typeof property == "string")
        prop = new Expressions_1.Property(property);
    if (!(prop instanceof Expressions_1.Property))
        throw new Error("property is not valid");
    return new Expressions_1.Expand([{
            property: prop,
            expressions: expression
        }]);
}
exports.expand = expand;
function inlineCount() {
    return new Expressions_1.InlineCount();
}
exports.inlineCount = inlineCount;
function find(value) {
    return new FindExtend(value);
}
exports.find = find;
class GlobalExtend {
    get maxdatetime() {
        return new Expressions_1.GlobalMethod("maxdatetime");
    }
    get mindatetime() {
        return new Expressions_1.GlobalMethod("mindatetime");
    }
    get now() {
        return new Expressions_1.GlobalMethod("now");
    }
}
exports.GlobalExtend = GlobalExtend;
/**
 * creates memory data set for operations
 * @param {Array} source is array for operations
 */
function memset(source) {
    let r = source == null ? [] : source;
    return new MemArrayVisitor_1.MemSet(r);
}
exports.memset = memset;
/**
 * creates new Guid
 * @param {String} raw
 * @returns {Guid}
 */
function guid(raw) {
    return new Schema_1.Guid(raw);
}
exports.guid = guid;
//# sourceMappingURL=Operations.js.map