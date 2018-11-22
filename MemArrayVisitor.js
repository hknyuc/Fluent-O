"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LazyArrayVisitor_1 = require("./LazyArrayVisitor");
const Expressions_1 = require("./Expressions");
const Dataset_1 = require("./Dataset");
class MemArrayVisitor extends Expressions_1.ExpressionVisitor {
    constructor(array, root) {
        super();
        this.source = array;
        this.result = [];
        this.rootValue = root;
    }
    getSource() {
        if (this.source instanceof Promise)
            return this.source;
        return Promise.resolve(this.source);
    }
    select(select) {
        return this.getSource().then((source) => {
            if (Array.isArray(source)) {
                this.result = this.source.map(element => {
                    let result = {};
                    select.args.forEach(arg => {
                        this.__createNestedProperty(result, arg.property)
                            .set(this.__getNestedProperty(element, arg.property));
                    });
                    return result;
                });
            }
            else {
                this.result = {};
                select.args.forEach((arg) => {
                    this.__createNestedProperty(this.result, arg.property).set(this.__getNestedProperty(this.source, arg.property));
                });
                return this.result;
            }
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
                this.result = result;
                return this.result;
            });
        });
    }
    _selectManyArray(selectMany, source) {
        if (selectMany.parent != null) {
            let visitor = this.createMemVisitor(source);
            visitor.visit(selectMany.parent);
            source = visitor.result;
        }
        if (!Array.isArray(source))
            return source;
        let rs = [];
        source.forEach(element => {
            let arr = element[selectMany.name];
            if (!Array.isArray(arr)) {
                rs.push(arr);
                return true;
            }
            for (let i = 0; i < arr.length; i++)
                rs.push(arr[i]);
            return true;
        });
        this.result = rs;
    }
    _selectManyObject(selectMany, source) {
        if (selectMany.parent != null) {
            let visitor = this.createMemVisitor(source);
            visitor.visit(selectMany.parent);
            source = visitor.result;
        }
        if (Array.isArray(source)) // array i nested
         {
            let rs = [];
            source.forEach(element => {
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
        for (let i in source) { // object
            if (i === selectMany.name)
                return source[i];
        }
        throw new Error(selectMany.name + " is not found in object");
    }
    selectMany(selectMany) {
        return this.getSource().then((source) => {
            if (Array.isArray(source))
                this.result = this._selectManyArray(selectMany, source);
            else
                this.result = this._selectManyObject(selectMany, source);
            return this.result;
        });
    }
    skip(skip) {
        return this.getSource().then((source) => {
            this.result = this.source.slice(skip.value, source.length);
            return this.result;
        });
    }
    top(top) {
        return this.getSource().then((source) => {
            this.result = source.slice(0, top.value);
            return this.result;
        });
    }
    find(find) {
        return this.getSource().then((source) => {
            let value = find.value;
            if (typeof value !== "object") {
                this.result = source.find((x => x.id === find.value || x.ID === find.value || x.Id === find.value));
            }
            else {
                let firstValueofObject = null;
                for (let i in find.value) {
                    firstValueofObject = { name: i, value: find.value[i] };
                    break;
                }
                this.result = source.find((x => x[firstValueofObject.name] == firstValueofObject.value));
            }
            let visitor = new MemArrayVisitor(this.result, source);
            if (find.expression != null) {
                visitor.visit(find.expression);
                this.result = visitor.result;
            }
            return this.result;
        });
    }
    createMemVisitor(source) {
        return new MemArrayVisitor(source, this.rootValue);
    }
    count(count) {
        return this.getSource().then((source) => {
            this.result = source.length;
            if (count.expression != null) {
                let memVisitor = this.createMemVisitor(source);
                return memVisitor.visit(count.expression).then((respone) => {
                    this.result = respone.length;
                    return this.result;
                });
            }
            return this.result;
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
                this.result = source.map(x => x).sort((left, right) => {
                    let l = this.__getNestedProperty(left, order.property);
                    let r = this.__getNestedProperty(right, order.property);
                    if (order.type === null || order.type === "asc")
                        return l - r;
                    return r - l;
                });
                return this.result;
            });
        });
    }
    property(property) {
        return this.getSource().then((source) => {
            let result = this.__getNestedProperty(source, property);
            return result;
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
        this.result = this.getSource();
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
        return {
            string: stringFuncs,
            date: dateFuncs
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
    modelMethod(modelMethod) {
        this.getSource().then((source) => {
            let visitor = this.createMemVisitor(source);
            return visitor.visit(modelMethod.property).then((value) => {
                let allProps = [];
                let self = this;
                modelMethod.args.forEach(function (arg) {
                    let v = self.createMemVisitor(self.source);
                    allProps.push(v.visit(arg));
                });
                return Promise.all(allProps).then((props) => {
                    if (typeof value === "string") {
                        let methods = this.getModelMethod().string;
                        methods["context"] = value;
                        if (methods[modelMethod.name] != null) {
                            this.result = Promise.resolve(methods[modelMethod.name].apply(methods, props));
                            return this.result;
                        }
                    }
                    else if (value instanceof Date) {
                        let methods = this.getModelMethod().date;
                        methods["context"] = value;
                        if (methods[modelMethod.name] != null) {
                            this.result = Promise.resolve(methods[modelMethod.name].apply(methods, props));
                            return this.result;
                        }
                    }
                    if (value == null)
                        return this.result;
                    if (value[modelMethod.name] == null) {
                        return this.result;
                        // throw new Error(modelMethod.name + " method not found in context");
                    }
                    this.result = Promise.resolve(value[modelMethod.name].apply(value, props));
                    return this.result;
                });
            });
        });
    }
    value(value) {
        this.result = Promise.resolve(value.value);
        return this.result;
    }
    expand(expand) {
        return this.getSource().then((source) => {
            source.forEach(element => {
                expand.args.forEach((arg) => {
                    let oldValue = this.__getNestedProperty(element, arg.property);
                    let applier = this.__createNestedProperty(element, arg.property);
                    if (arg.expressions != null && arg.expressions.length != 0) {
                        let resultValue = oldValue;
                        arg.expressions.forEach((expression) => {
                            let memVisitor = this.createMemVisitor(resultValue);
                            memVisitor.visit(expression);
                            resultValue = memVisitor.result;
                            return true;
                        });
                        applier.set(resultValue);
                    }
                    else
                        applier.set(oldValue);
                });
            });
            this.result = this.source.map(x => x);
            return this.result;
        });
    }
    operation(operation) {
    }
    eqBinary(eqBinary) {
        let source = this.source;
        let leftVisitor = this.createMemVisitor(source);
        let rightVisitor = this.createMemVisitor(source);
        leftVisitor.visit(eqBinary.left);
        rightVisitor.visit(eqBinary.right);
        let left = leftVisitor.result;
        let right = rightVisitor.result;
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
        this.result = result;
    }
    root(root) {
        this.result = this.rootValue;
    }
    refExpression(refExpression) {
        let visitor = this.createMemVisitor(this.source);
        visitor.visit(refExpression.expression);
        this.result = visitor.result;
        if (refExpression.next != null) {
            let visitorNext = this.createMemVisitor(this.result);
            visitorNext.visit(refExpression.next);
            this.result = visitorNext.result;
        }
    }
}
exports.MemArrayVisitor = MemArrayVisitor;
class MemSet extends Dataset_1.DataSet {
    constructor(source, expressions = []) {
        super(expressions);
        this.source = source;
        this.expressions = expressions || [];
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
        selects = selects.length > 1 ? [selects.reverse().pop()] : selects; // get last
        let expands = this.filterExpressions(expressions, Expressions_1.Expand);
        let finds = this.filterExpressions(expressions, Expressions_1.Find);
        return expands.concat(filters, finds, orders, skips, tops, selects);
    }
    static filterExpressions(expressions, type) {
        return expressions.filter(a => a instanceof type);
    }
    query(...expressions) {
        return new MemSet(this.source, this.expressions.map(x => x).concat(expressions));
    }
    get(...expressions) {
        let expression = this.expressions.map(x => x).concat(expressions);
        return Promise.resolve(MemSet.get(this.source, expression));
    }
    add(element) {
        this.source.push(element);
        return Promise.resolve(element);
    }
    __getValueOf(value) {
        return value != null && typeof value.valueOf === "function" ? value.valueOf() : value;
    }
    __is(base, element) {
        let ids = ["ID", "id", "Id", "iD"];
        return base === element || ids.some(x => element[x] != null && this.__getValueOf(element[x]) === this.__getValueOf(base[x]));
    }
    delete(element) {
        let indexOfItem = this.source.find((elem) => this.__is(elem, element));
        if (indexOfItem === -1)
            return Promise.reject('element not found');
        this.source.splice(indexOfItem, 1);
        return Promise.resolve();
    }
    update(element) {
        let indexOfItem = this.source.findIndex((elem) => this.__is(elem, element));
        if (indexOfItem === -1)
            return Promise.reject('element not found');
        this.source[indexOfItem] = element;
        return Promise.resolve();
    }
    static get(source, ...expressions) {
        if (Array.isArray(expressions) && expressions.length === 1 && expressions[0] && Array.isArray(expressions[0]))
            expressions = expressions[0];
        let expr = expressions.map(x => x).reverse();
        let removeOdataSet = function (o) {
            if (o == null)
                return null;
            if (o instanceof Dataset_1.DataSet)
                return null;
            if (Array.isArray(o))
                return o;
            if (typeof o === "object") {
                for (let i in o) {
                    o[i] = removeOdataSet(o[i]);
                    if (o[i] == null) {
                        delete o[i];
                    }
                }
            }
            return o;
        };
        // console.log({source});
        return this._get(source, expr).then((result) => {
            if (result == null)
                return null;
            if (Array.isArray(result))
                return result.map(x => removeOdataSet(x));
            if (typeof result === "object") {
                return removeOdataSet(result);
            }
            return result;
        }).then((result) => {
            if (result != null)
                return result;
        });
    }
    static _get(source, expressions) {
        /*
        let result = source;
        expressions.forEach((expression) => {
            let visitor = new MemArrayVisitor(result, source);
            visitor.visit(expression);
            result = visitor.result;
        });
        return result;
        */
        if (expressions.length == 0)
            return Promise.resolve(source);
        let result = source;
        let cloneExpressions = this.rangeExpressions(expressions.map(x => x));
        let item = cloneExpressions.pop();
        return new LazyArrayVisitor_1.LazyArrayVisitor(result, source).visit(item).then((response) => {
            return this._get(response, cloneExpressions);
        });
    }
}
exports.MemSet = MemSet;
//# sourceMappingURL=MemArrayVisitor.js.map