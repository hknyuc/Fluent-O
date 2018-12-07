"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("./Expressions");
const Dataset_1 = require("./Dataset");
const Schema_1 = require("./Schema");
class LazyArrayVisitor extends Expressions_1.ExpressionVisitor {
    constructor(array, root) {
        super();
        this.source = array;
        this.result = [];
        this.rootValue = root;
    }
    _getSource() {
        if (this.source instanceof Promise)
            return this.source;
        return Promise.resolve(this.source);
    }
    getSource() {
        return this._getSource().then((source) => {
            return source;
        });
    }
    /*
    private getWithExpands(element){
        if(element == null) return element;
        let newResult = {};
        for(let i in element){
            let value = element[i];
            if(value == null) continue;
            if(Array.isArray(value) || typeof value === "object")
                newResult[i] = value;
        }
        return newResult
    }
    */
    select(select) {
        return this.getSource().then((source) => {
            let fn = (source, result, property) => {
                let baseValue = this.__getNestedProperty(source, property);
                /*
                if(baseValue instanceof DataSet){
                    this.__createNestedProperty(result, property)
                    .set({});
                }
                */
                if (baseValue instanceof Promise) {
                    return baseValue.then((response) => {
                        this.__createNestedProperty(result, property).set(response);
                    });
                }
                return Promise.resolve(this.__createNestedProperty(result, property)
                    .set(this.__getNestedProperty(source, property)));
            };
            let allPromise = [];
            let newResult = [];
            let aSource = new Arrayable(source);
            aSource.forEach(element => {
                let result = {};
                newResult.push(result);
                let args = select.args.length == 0 ? Object.keys(element).map(x => {
                    return {
                        property: new Expressions_1.Property(x),
                        expression: null
                    };
                }) : select.args;
                args.forEach(arg => {
                    allPromise.push(fn(element, result, arg.property));
                });
            });
            return Promise.all(allPromise).then(() => aSource.ifArrayReturn(newResult));
        });
    }
    filter(filter) {
        return this.getSource().then((source) => {
            let result = [];
            let allPromise = [];
            source.forEach(element => {
                let visitor = this.createMemVisitor(element);
                allPromise.push(visitor.visit(filter.expression).then(x => {
                    if (x === true)
                        result.push(element);
                }));
            });
            return Promise.all(allPromise).then(() => {
                return result;
            });
        });
    }
    _selectManyArray(selectMany, source) {
        let fn = (s) => {
            let rs = [];
            s.forEach(element => {
                let arr = element[selectMany.name];
                if (!Array.isArray(arr)) {
                    rs.push(arr);
                    return true;
                }
                for (let i = 0; i < arr.length; i++)
                    rs.push(arr[i]);
                return true;
            });
            return rs;
        };
        if (selectMany.parent != null) {
            let visitor = this.createMemVisitor(source);
            return visitor.visit(selectMany.parent).then((result) => {
                if (!Array.isArray(result))
                    return result;
                return fn(result);
            });
        }
        return Promise.resolve(fn(source));
    }
    _selectManyObject(selectMany, source) {
        let fn = (s) => {
            if (Array.isArray(s)) // array i nested
             {
                let rs = [];
                s.forEach(element => {
                    let arr = element[selectMany.name];
                    if (!Array.isArray(arr)) { // is object
                        rs.push(arr);
                        return true;
                    }
                    for (let i = 0; i < arr.length; i++) // is Array 
                        rs.push(arr[i]);
                    return true;
                });
                return rs;
            }
            for (let i in s) { // object
                if (i === selectMany.name)
                    return s[i];
            }
        };
        if (selectMany.parent != null) {
            let visitor = this.createMemVisitor(source);
            return visitor.visit(selectMany.parent).then((result) => fn(result));
        }
        return Promise.resolve(fn(source));
        // throw new Error(selectMany.name + " is not found in object");
    }
    selectMany(selectMany) {
        return this.getSource().then((source) => {
            if (Array.isArray(source))
                return this._selectManyArray(selectMany, source);
            return this._selectManyObject(selectMany, source);
        });
    }
    skip(skip) {
        return this.getSource().then((source) => {
            return source.slice(skip.value, source.length);
        });
    }
    top(top) {
        return this.getSource().then((source) => {
            return source.slice(0, top.value);
        });
    }
    find(find) {
        let getValueOf = function (value) {
            return value != null && value.valueOf instanceof Function ? value.valueOf() : value;
            ;
        };
        return this.getSource().then((source) => {
            let value = find.value;
            let result;
            if (typeof value !== "object" || (value instanceof Schema_1.Guid)) {
                let v = getValueOf(value);
                let findedResult = source.find(x => getValueOf(x.id) === v || getValueOf(x.ID) === v || getValueOf(x.Id) === v);
                if (findedResult != null)
                    result = Object.assign({}, findedResult);
            }
            else {
                let firstValueofObject = null;
                for (let i in find.value) {
                    firstValueofObject = { name: i, value: find.value[i] };
                    break;
                }
                if (firstValueofObject == null)
                    throw new Error('empty find selector');
                let findedResult = source.find(x => getValueOf(x[firstValueofObject.name]) === getValueOf(firstValueofObject.value));
                if (findedResult != null)
                    result = Object.assign({}, findedResult);
            }
            if (find.expression != null) {
                return this.createMemVisitor(result).visit(find.expression);
            }
            return result;
        });
    }
    createMemVisitor(source) {
        return new LazyArrayVisitor(source, this.rootValue);
    }
    count(count) {
        return this.getSource().then((source) => {
            if (count.expression != null) {
                let memVisitor = this.createMemVisitor(source);
                return memVisitor.visit(count.expression).then((respone) => {
                    return respone.length;
                });
            }
            return source.length;
        });
    }
    expendProperties(source, properties) {
        let all = [];
        source.forEach((item) => {
            properties.forEach((prop) => {
                all.push(this.createMemVisitor(item)
                    .visit(prop)
                    .then((value) => {
                    let applier = this.__createNestedProperty(item, prop);
                    applier.set(value);
                    return value;
                }));
            });
        });
        return Promise.all(all).then(() => source);
    }
    order(order) {
        return this.getSource().then((source) => {
            if (!Array.isArray(source))
                throw new Error("order: order support only array");
            return this.expendProperties(source, [order.property]).then((source) => {
                return source.map(x => x).sort((left, right) => {
                    let l = this.__getNestedProperty(left, order.property);
                    let r = this.__getNestedProperty(right, order.property);
                    if (order.type === null || order.type === "asc")
                        return l - r;
                    return r - l;
                });
            });
        });
    }
    property(property) {
        return this.getSource().then((source) => {
            return this.__getNestedProperty(source, property);
        });
    }
    __createNestedProperty(source, property) {
        if (source == null)
            return null;
        let props = [];
        let parent = property.parent;
        while (parent != null) {
            props.push(parent.name);
            parent = parent.parent;
        }
        props = props.reverse();
        props.push(property.name);
        let current = source;
        props.forEach((name) => {
            current[name] = current[name] == null ? {} : current[name];
            current = current[name];
        });
        return {
            /**
             * sets value to created property
             */
            set: (value) => {
                let current = source;
                for (let i = 0; i < props.length; i++) {
                    if (i === (props.length - 1)) {
                        if (current[props[i]] == null)
                            throw new Error(props[i] + " is undefined for set in model");
                        current[props[i]] = value;
                    }
                    current = current[props[i]];
                }
            }
        };
    }
    __getNestedProperty(source, property) {
        let props = [];
        let parent = property.parent;
        while (parent != null) {
            props.push(parent.name);
            parent = parent.parent;
        }
        props = props.reverse();
        props.push(property.name);
        //props = props.reverse();
        let current = source;
        props.forEach((name) => {
            if (current == null) {
                return null;
                // throw new Error("source is null for getting " + name + " property");
            }
            current = current[name];
        });
        return current;
    }
    it(it) {
        return this.getSource();
    }
    getModelMethod() {
        let stringFuncs = {
            contains: function (value) {
                return this.context.indexOf(value) >= 0;
            },
            endswith: function (value) {
                return this.context.endsWith(value);
            },
            indexof: function (value) {
                return this.context.indexOf(value);
            },
            length: function () {
                return this.context.length;
            },
            startswith: function (value) {
                return this.context.startsWith(value);
            },
            substring: function (start, end) {
                return this.context.substring(start, end);
            },
            tolower: function () {
                return this.context.toLowerCase();
            },
            toupper: function () {
                return this.context.toUpperCase();
            },
            trim: function () {
                return this.context.trim();
            }
        };
        let dateFuncs = {
            date: function () {
                return this.context.getDate();
            },
            day: function () {
                return this.context.getDay();
            },
            fractionalseconds: function () {
                return this.context.getDate();
            },
            hour: function () {
                return this.context.getHour();
            },
            minute: function () {
                return this.context.getMinutes();
            },
            month: function () {
                return this.context.getMonth() + 1;
            },
            second: function () {
                return this.context.getSeconds();
            },
            time: function () {
                return this.cotnext.getTime();
            },
            year: function () {
                return this.context.getFullYear();
            }
        };
        let arrayFuncs = {
            all: function (value) {
                return this.context.every(value);
            },
            any: function (value) {
                return this.context.some(value);
            }
        };
        return {
            string: stringFuncs,
            date: dateFuncs,
            array: arrayFuncs
        };
    }
    globalMethod(globalMethod) {
        return this.getSource().then((source) => {
            let methods = {
                maxdatetime: function () {
                    return new Date(8640000000000000);
                },
                mindatetime: function () {
                    return new Date(-8640000000000000);
                },
                now: function () {
                    return new Date(Date.now());
                },
                ceiling: function (value) {
                    return Math.ceil(value);
                },
                floor: function (x) {
                    return Math.floor(x);
                },
                round: function (x) {
                    return Math.round(x);
                }
            };
            if (methods[globalMethod.name] == null)
                throw new Error(globalMethod.name + " is not exists in global method");
            let props = [];
            globalMethod.args.forEach((elem) => {
                let visitor = this.createMemVisitor(source);
                props.push(visitor.visit(elem));
            });
            return Promise.all(props).then(() => {
                return methods[globalMethod.name].apply(null, props);
            });
        });
    }
    /**
     * todo : bu metotun refactoring'e ihtiyaçı var
     * @param modelMethod
     */
    modelMethod(modelMethod) {
        return this.getSource().then((source) => {
            return this.createMemVisitor(source).visit(modelMethod.property).then((value) => {
                if (value == null)
                    return Promise.resolve(null);
                if (value instanceof Array) {
                    let methods = this.getModelMethod().array;
                    methods["context"] = value;
                    //parameterlerin hep expression olduğunu varsaydık.
                    return methods[modelMethod.name].apply(value, modelMethod.args.map(prop => {
                        return (x) => {
                            this.createMemVisitor(x).visit(prop);
                        };
                    }));
                }
                let allProps = [];
                let self = this;
                modelMethod.args.forEach(function (arg) {
                    allProps.push(self.createMemVisitor(self.source).visit(arg));
                });
                return Promise.all(allProps).then((props) => {
                    if (typeof value === "string") {
                        let methods = this.getModelMethod().string;
                        methods["context"] = value;
                        if (methods[modelMethod.name] != null) {
                            return methods[modelMethod.name].apply(methods, props);
                        }
                        return value[modelMethod.name].apply(value, props);
                    }
                    if (value instanceof Date) {
                        let methods = this.getModelMethod().date;
                        methods["context"] = value;
                        if (methods[modelMethod.name] != null) {
                            return methods[modelMethod.name].apply(methods, props);
                        }
                        return value[modelMethod.name].apply(value, props);
                    }
                    if (value[modelMethod.name] == null) {
                        return null;
                        // throw new Error(modelMethod.name + " method not found in context");
                    }
                    return value[modelMethod.name].apply(value, props);
                });
            });
        });
    }
    value(value) {
        let fn = (v) => {
            return v;
            /*
            if(typeof v === "function") return fn(v());
            return v;
            */
        };
        if (value.value instanceof Promise)
            return fn(value.value);
        return Promise.resolve(fn(value.value));
    }
    /**
   * İlk önce
   */
    static rangeExpressions(expressions) {
        let filters = this.filterExpressions(expressions, Expressions_1.Filter);
        filters = filters.length > 1 ? [new Expressions_1.Filter(filters.reduce((accumulator, current) => {
                if (accumulator instanceof Expressions_1.Filter) {
                    return new Expressions_1.EqBinary(accumulator.expression, new Expressions_1.Operation('and'), current.expression);
                }
                return new Expressions_1.EqBinary(accumulator, new Expressions_1.Operation('and'), current.expression);
            }))] : filters; // combine as one
        let orders = this.filterExpressions(expressions, Expressions_1.Order);
        let skips = this.filterExpressions(expressions, Expressions_1.Skip);
        let tops = this.filterExpressions(expressions, Expressions_1.Top);
        let selects = this.filterExpressions(expressions, Expressions_1.Select);
        let select = selects.length == 0 ? null : selects.reduce((accumlator, c) => {
            return new Expressions_1.Select(accumlator.args.concat(c.args));
        });
        let expands = this.filterExpressions(expressions, Expressions_1.Expand);
        let expand = expands.length == 0 ? null : expands.reduce((accumulator, c) => {
            return new Expressions_1.Expand(accumulator.args.concat(c.args));
        });
        let finds = this.filterExpressions(expressions, Expressions_1.Find);
        let counts = this.filterExpressions(expressions, Expressions_1.Count);
        let result = {
            expandAndSelects: [].concat(expand, select).filter(x => x != null),
            others: filters.concat(orders, skips, tops, counts, finds)
        };
        return result;
    }
    static getOnlyStucts(element) {
        if (element == null)
            return;
        let validsStructs = ["string", "boolean", "number", "function"];
        let validsObject = [Date, Schema_1.Guid];
        let newResult = {};
        for (let i in element) {
            let isStruct = validsStructs.some(v => typeof element[i] === v);
            let isObject = validsObject.some(v => element[i] instanceof v);
            if (!isStruct && !isObject)
                continue;
            if (typeof element[i] === "function") { // fonksiyon varsa kopyalasın
                newResult[i] = function () {
                    return element[i].apply(newResult, arguments);
                };
            }
            else {
                newResult[i] = element[i];
            }
        }
        return newResult;
    }
    static __invokeExpandAndSelects(expand, select, index, element) {
        let allp = [];
        if (expand != null)
            allp.push(this._get(element, [expand]));
        if (expand == null)
            allp.push(Promise.resolve({}));
        if (select != null)
            allp.push(this._get(this.getOnlyStucts(element), [select]));
        if (select == null)
            allp.push(Promise.resolve(this.getOnlyStucts(element)));
        return Promise.all(allp).then((respones) => {
            return { model: Object.assign({}, respones[0], respones[1]), index };
        });
    }
    static filterExpressions(expressions, type) {
        return expressions.filter(a => a instanceof type);
    }
    isDataSet(dataSetable) {
        return Dataset_1.DataSet.is(dataSetable);
    }
    static get(source, ...expressions) {
        if (Array.isArray(expressions) && expressions.length === 1 && expressions[0] && Array.isArray(expressions[0]))
            expressions = expressions[0];
        let rangeExpressions = this.rangeExpressions(expressions);
        return this._pruneAndGet(source, rangeExpressions.others.reverse()).then((response) => {
            let expand = this.filterExpressions(rangeExpressions.expandAndSelects, Expressions_1.Expand)[0];
            let select = this.filterExpressions(rangeExpressions.expandAndSelects, Expressions_1.Select)[0];
            if (Array.isArray(response)) {
                return Promise.all(response.map((element, index) => this.__invokeExpandAndSelects(expand, select, index, element))).then((resp) => {
                    return resp.sort((b, n) => b.index - n.index).map(x => x.model);
                });
            }
            if (response == null)
                return response;
            if (typeof response === "number")
                return response; // count gelirse
            return this.__invokeExpandAndSelects(expand, select, 0, response).then((resp) => {
                if (resp == null)
                    return resp;
                return resp.model;
            });
        });
        // console.log({source});
    }
    static _get(source, expressions) {
        if (expressions.length == 0)
            return Promise.resolve(source);
        let result = source;
        let cloneExpressions = expressions.map(x => x);
        let expression = cloneExpressions.pop();
        return new LazyArrayVisitor(result, source).visit(expression).then((response) => {
            return this._get(response, cloneExpressions);
        });
    }
    static _pruneAndGet(source, expr) {
        return this._get(source, expr).then((result) => {
            if (result == null)
                return null;
            if (Array.isArray(result))
                return result.map(x => this._prune(x));
            if (typeof result === "object")
                return this._prune(result);
            return result;
        });
    }
    static _prune(o) {
        if (o == null)
            return null;
        if (o instanceof Dataset_1.DataSet)
            return null;
        if (Array.isArray(o))
            return o;
        if (typeof o === "object") {
            for (let i in o) {
                o[i] = this._prune(o[i]);
                if (o[i] == null) {
                    delete o[i];
                }
            }
        }
        return o;
    }
    expand(expand) {
        return this.getSource().then((source) => {
            let addValue = (baseValue, arg, oldValue, allExpands, applier) => {
                if (this.isDataSet(baseValue)) {
                    allExpands.push(baseValue.get.apply(baseValue, arg.expressions).then((response) => {
                        applier.set(response);
                        return response;
                    }));
                    return true;
                }
                if (baseValue instanceof Promise) {
                    allExpands.push(baseValue.then((response) => {
                        return LazyArrayVisitor.get(response, arg.expressions).then((response) => {
                            applier.set(response);
                        });
                    }));
                    return true;
                }
                if (arg.expressions != null && arg.expressions.length != 0) {
                    allExpands.push(LazyArrayVisitor.get(baseValue, arg.expressions).then((response) => {
                        applier.set(response);
                        return response;
                    }));
                    return true;
                }
                allExpands.push(Promise.resolve(applier.set(baseValue)));
            };
            let all = [];
            let sourceIsArray = Array.isArray(source);
            source = sourceIsArray ? source : [source];
            let newSource = source.map(x => {
                return {};
            });
            source.forEach((element, index) => {
                let allExpands = [];
                let applierElement = newSource[index];
                expand.args.forEach((arg) => {
                    let oldValue = this.__getNestedProperty(applierElement, arg.property);
                    let baseValue = this.__getNestedProperty(element, arg.property);
                    if (baseValue == null)
                        return true;
                    let applier = this.__createNestedProperty(applierElement, arg.property);
                    // console.log({arg: arg.property.name,baseValue,oldValue,applier});
                    addValue(baseValue, arg, oldValue, allExpands, applier);
                    return true;
                });
                all.push(Promise.all(allExpands));
            });
            return Promise.all(all).then(() => sourceIsArray ? newSource : newSource[0]);
        });
    }
    operation(operation) {
    }
    eqBinary(eqBinary) {
        return this.getSource().then((source) => {
            let leftVisitor = this.createMemVisitor(source);
            let rightVisitor = this.createMemVisitor(source);
            let all = [];
            all.push(leftVisitor.visit(eqBinary.left));
            all.push(rightVisitor.visit(eqBinary.right));
            return Promise.all(all).then((items) => {
                let left = items[0];
                let right = items[1];
                let result = null;
                switch (eqBinary.op.type) {
                    case "or":
                        result = left || right;
                        break;
                    case "and":
                        result = left && right;
                        break;
                    case "eq":
                        result = left === right;
                        break;
                    case "ne":
                        result = left !== right;
                        break;
                    case "lt":
                        result = left < right;
                        break;
                    case "le":
                        result = left <= right;
                        break;
                    case "gt":
                        result = left > right;
                        break;
                    case "ge":
                        result = left >= right;
                        break;
                    default:
                        throw new Error(eqBinary.op.type + " is not support yet");
                }
                return result;
            });
        });
    }
    root(root) {
        return Promise.resolve(this.rootValue);
    }
    refExpression(refExpression) {
        return this.getSource().then((source) => this.createMemVisitor(source).visit(refExpression.expression).then((result) => {
            if (refExpression.next != null) {
                let visitorNext = this.createMemVisitor(result);
                return visitorNext.visit(refExpression.next);
            }
            return result;
        }));
    }
}
exports.LazyArrayVisitor = LazyArrayVisitor;
class Arrayable {
    get isArray() {
        return Array.isArray(this.value);
    }
    constructor(value) {
        this.value = value;
    }
    static is(value) {
        return new Arrayable(value);
    }
    ifArrayReturn(value) {
        if (this.isArray)
            return value;
        return value[0];
    }
    toArray() {
        if (this.isArray)
            return this.value;
        return [this.value];
    }
    forEach(callbackfn) {
        return this.toArray().forEach(callbackfn);
    }
    map(callbackfn) {
        return this.toArray().map(callbackfn);
    }
}
//# sourceMappingURL=LazyArrayVisitor.js.map