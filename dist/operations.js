"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trackingmemset_1 = require("./trackingmemset");
const changeset_1 = require("./changeset");
const pointset_1 = require("./pointset");
const mapset_1 = require("./mapset");
const schema_1 = require("./schema");
const memarrayvisitor_1 = require("./memarrayvisitor");
const odata_1 = require("./odata");
const expressions_1 = require("./expressions");
const dataset_1 = require("./dataset");
const cacheset_1 = require("./cacheset");
const branchset_1 = require("./branchset");
const pipeset_1 = require("./pipeset");
const core_1 = require("./core");
class EqBinaryExtend extends expressions_1.EqBinary {
    constructor(eqBinary) {
        super(eqBinary.left, eqBinary.op, eqBinary.right);
    }
    create(op, value) {
        let v = value;
        if (expressions_1.Value.isValid(value)) {
            v = new expressions_1.Value(value);
        }
        return new EqBinaryExtend(new expressions_1.EqBinary(this, new expressions_1.Operation(op), v));
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
class ModelMethodExtend extends expressions_1.ModelMethod {
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
    return new odata_1.ODataSet(options);
};
const method = function (name, ...properties) {
    let props = [];
    properties.forEach((elem) => {
        if (expressions_1.Value.isValid(elem))
            props.push(new expressions_1.Value(elem));
        else
            props.push(elem);
    });
    return new ModelMethodExtend(name, this, props);
};
class PropertyExtend extends expressions_1.Property {
    create(op, value) {
        let v = value;
        if (!(core_1.Utility.instanceof(value, expressions_1.Property))) {
            v = new expressions_1.Value(value);
        }
        return new EqBinaryExtend(new expressions_1.EqBinary(this, new expressions_1.Operation(op), v));
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    and(value) {
        return this.create('and', value);
    }
    all(expression) {
        return this.createMethod('all', expression);
    }
    any(expression) {
        return this.createMethod('any', expression);
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
class SelectManyExtend extends expressions_1.SelectMany {
    constructor(name, property) {
        super(name, property);
    }
    create(op, value) {
        let v = value;
        if (expressions_1.Value.isValid(value))
            v = new expressions_1.Value(value);
        return new EqBinaryExtend(new expressions_1.EqBinary(this, new expressions_1.Operation(op), v));
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    any(expression) {
        return this.createMethod('any', expression);
    }
    all(expression) {
        return this.createMethod('all', expression);
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
class CountExtend extends expressions_1.Count {
    create(op, value) {
        let v = value;
        if (expressions_1.Value.isValid(value))
            v = new expressions_1.Value(value);
        return new EqBinaryExtend(new expressions_1.EqBinary(this, new expressions_1.Operation(op), v));
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
class RootExtend extends expressions_1.Root {
    create(op, value) {
        let v = value;
        if (!(core_1.Utility.instanceof(value, expressions_1.Root))) {
            v = new expressions_1.Value(value);
        }
        return new EqBinaryExtend(new expressions_1.EqBinary(this, new expressions_1.Operation(op), v));
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
class ItExtend extends expressions_1.It {
    constructor() {
        super();
    }
    create(op, value) {
        let v = value;
        if (!(core_1.Utility.instanceof(value, expressions_1.Root))) {
            v = new expressions_1.Value(value);
        }
        return new EqBinaryExtend(new expressions_1.EqBinary(this, new expressions_1.Operation(op), v));
    }
    createMethod(name, ...properties) {
        return method.apply(this, arguments);
    }
    and(value) {
        return this.create('and', value);
    }
    prop(name) {
        return prop(name, this);
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
    return new expressions_1.Count(null);
}
exports.count = count;
function o(left, op, right) {
    let opValue = op;
    let leftValue = left;
    if (typeof op === "string")
        opValue = new expressions_1.Operation(op);
    if (typeof left === "string")
        leftValue = new expressions_1.Property(left);
    let r = right;
    if (expressions_1.Value.isValid(right))
        r = new expressions_1.Value(right);
    return new EqBinaryExtend(new expressions_1.EqBinary(leftValue, opValue, r));
}
exports.o = o;
function p(name, parent) {
    return prop(name, parent);
}
exports.p = p;
function prop(name, parent) {
    if (name == null)
        throw new Error('property name could not null');
    if (typeof name != "string")
        throw new Error('property name must string');
    if (name.indexOf('.') >= 0) {
        let current = parent;
        name.split('.').forEach(function (item) {
            if (current == null)
                current = new PropertyExtend(item);
            else
                current = new PropertyExtend(item, current);
        });
        return current;
    }
    return new PropertyExtend(name, parent);
}
exports.prop = prop;
function filter(expression) {
    return new expressions_1.Filter(expression);
}
exports.filter = filter;
function select(...args) {
    let results = [];
    let appendAsString = function () {
        args.forEach(function (arg) {
            results.push({
                property: core_1.Utility.instanceof(arg, expressions_1.Property) ? arg : prop(arg)
            });
        });
    };
    let singleProperty = function () {
        results.push({
            property: core_1.Utility.instanceof(args[0], expressions_1.Property) ? args[0] : prop(args[0]),
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
            let isProperty = core_1.Utility.instanceof(item, expressions_1.Property);
            return !(isString || isProperty);
        });
        if (indexOfNonString >= 0) {
            throw new Error('argument index of ' + indexOfNonString + " is not property");
        }
        appendAsString();
    }
    return new expressions_1.Select(results);
}
exports.select = select;
function top(value) {
    return new expressions_1.Top(value);
}
exports.top = top;
function skip(value) {
    return new expressions_1.Skip(value);
}
exports.skip = skip;
function value(value) {
    return new expressions_1.Value(value);
}
exports.value = value;
function it() {
    return new ItExtend();
}
exports.it = it;
class FindExtend extends expressions_1.Find {
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
    if (!(core_1.Utility.instanceof(propem, expressions_1.Property)))
        throw new Error('order :property is not valid');
    if (type == null)
        return new expressions_1.Order(propem);
    let validTypes = ["asc", "desc"];
    if (!validTypes.some(x => x == type)) {
        throw new Error('order: type is not valid');
    }
    return new expressions_1.Order(propem, type);
}
exports.order = order;
function orderDesc(propery) {
    return order(propery, 'desc');
}
exports.orderDesc = orderDesc;
function expand(property, ...expression) {
    let prop = property;
    if (typeof property == "string")
        prop = new expressions_1.Property(property);
    if (!(core_1.Utility.instanceof(prop, expressions_1.Property)))
        throw new Error("property is not valid");
    return new expressions_1.Expand([{
            property: prop,
            expressions: expression
        }]);
}
exports.expand = expand;
function inlineCount() {
    return new expressions_1.InlineCount();
}
exports.inlineCount = inlineCount;
function find(value) {
    return new FindExtend(value);
}
exports.find = find;
class GlobalExtend {
    get maxdatetime() {
        return new expressions_1.GlobalMethod("maxdatetime");
    }
    get mindatetime() {
        return new expressions_1.GlobalMethod("mindatetime");
    }
    get now() {
        return new expressions_1.GlobalMethod("now");
    }
}
exports.GlobalExtend = GlobalExtend;
/**
 * creates memory data set for operations
 * @param {Array} source source is array
 * @param baseFilter is start filter
 */
function memset(source, baseFilter) {
    let r = source == null ? [] : source;
    return new memarrayvisitor_1.MemSet(r, baseFilter);
}
exports.memset = memset;
/**
 * creates new Guid
 * @param {String} raw
 * @returns {Guid}
 */
function guid(raw) {
    if (core_1.Utility.instanceof(raw, schema_1.Guid))
        return raw;
    return new schema_1.Guid(raw);
}
exports.guid = guid;
function action(name, ...params) {
    let args = [];
    params.forEach((param) => {
        if (core_1.Utility.instanceof(param, expressions_1.Value)) {
            args.push(param);
            return true;
        }
        args.push(new expressions_1.Value(param));
        return true;
    });
    return new expressions_1.Action(name, args);
}
exports.action = action;
function func(name, ...params) {
    let args = [];
    params.forEach((param) => {
        if (core_1.Utility.instanceof(param, expressions_1.Value)) {
            args.push(param);
            return true;
        }
        args.push(new expressions_1.Value(param));
        return true;
    });
    return new expressions_1.Func(name, args);
}
exports.func = func;
/**
 *
 * DecorateSet
 * @param source source dataset for processing
 * @param observer operations on source
 */
function dataset(source, observer) {
    return new dataset_1.DecorateSet(source, observer);
}
exports.dataset = dataset;
/**
 *
 * caches data. After fetching it is working in local.
 * @param dataset source dataset for processing
 */
function cacheset(dataset) {
    return new cacheset_1.CacheSet(dataset);
}
exports.cacheset = cacheset;
/**
 * maps data after data fetched.
 * @param source source dataset for processing
 * @param mapFn invokes map function after data fetched
 */
function mapset(source, mapFn, mapExFn) {
    return new mapset_1.MapSet(source, mapFn, [], mapExFn);
}
exports.mapset = mapset;
/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 * @param force provides order,skip,top,filter expression after data fetching
 */
function branchset(source, branchName, strategy) {
    return new branchset_1.Branchset(source, branchName, [], strategy || branchset_1.Branchset.SmartStrategy);
}
exports.branchset = branchset;
/**
 * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
 */
function pipeset(source) {
    return new pipeset_1.Pipeset(source);
}
exports.pipeset = pipeset;
/**
 * Query
 * @param source
 */
function pointset(source) {
    return new pointset_1.Pointset(source);
}
exports.pointset = pointset;
/**
  *Observes when element is adding,added,updating,updated,deleting,deleted.
 * @param source which is will observe
 * @returns {ChangeSet}
 */
function changeset(source) {
    return new changeset_1.ChangeSet(source);
}
exports.changeset = changeset;
function trackingMemset(source) {
    return new trackingmemset_1.TrackingMemset(memset(source));
}
exports.trackingMemset = trackingMemset;
/**
 * get first data from source
 * @param source datasource
 */
function first(source) {
    source = Array.isArray(source) ? memset(source) : source;
    return dataset(source, {
        get: function (expressions) {
            expressions = expressions || [];
            let exp = this.dataset.getExpressions().concat(expressions);
            let anyFirst = exp.find(a => core_1.Utility.instanceof(a, expressions_1.Find));
            if (anyFirst) { // eğer find yazılmışşsa tek gelecek demek zaten
                return this.next();
            }
            return this.next(exp.concat(top(1))).then((response) => {
                if (Array.isArray(response))
                    return response[0];
                return response;
            });
        }
    });
}
exports.first = first;
