"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("./Expressions");
class MemArrayVisitor extends Expressions_1.ExpressionVisitor {
    constructor(array, root) {
        super();
        this.source = array;
        this.result = [];
        this.rootValue = root;
    }
    select(select) {
        if (Array.isArray(this.source)) {
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
        }
    }
    filter(filter) {
        let result = [];
        this.source.forEach(element => {
            let visitor = this.createMemVisitor(element);
            visitor.visit(filter.expression);
            if (visitor.result === true)
                result.push(element);
        });
        this.result = result;
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
        if (Array.isArray(this.source))
            this.result = this._selectManyArray(selectMany, this.source);
        else
            this.result = this._selectManyObject(selectMany, this.source);
    }
    skip(skip) {
        this.result = this.source.slice(skip.value, this.source.length);
    }
    top(top) {
        this.result = this.source.slice(0, top.value);
    }
    find(find) {
        this.result = this.source.find((x => x.id == find.value));
        let visitor = new MemArrayVisitor(this.result, this.source);
        if (find.expression != null) {
            visitor.visit(find.expression);
            this.result = visitor.result;
        }
    }
    createMemVisitor(source) {
        return new MemArrayVisitor(source, this.rootValue);
    }
    count(count) {
        this.result = this.source.length;
        if (count.expression != null) {
            let memVisitor = this.createMemVisitor(this.source);
            memVisitor.visit(count.expression);
            this.result = memVisitor.result.length;
        }
    }
    order(order) {
        if (!Array.isArray(this.source))
            throw new Error("order: order support only array");
        this.result = this.source.sort((left, right) => {
            let leftVisitor = this.createMemVisitor(left);
            let rightVisitor = this.createMemVisitor(right);
            leftVisitor.visit(order.property);
            rightVisitor.visit(order.property);
            if (order.type === null || order.type === "asc")
                return leftVisitor.result - rightVisitor.result;
            return rightVisitor.result - leftVisitor.result;
        });
    }
    property(property) {
        this.result = this.__getNestedProperty(this.source, property);
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
                throw new Error("source is null for getting " + name + " property");
            }
            current = current[name];
        });
        return current;
    }
    it(it) {
        this.result = this.source;
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
            let visitor = this.createMemVisitor(this.source);
            visitor.visit(elem);
            props.push(visitor.result);
        });
        this.result = methods[globalMethod.name].apply(null, props);
    }
    modelMethod(modelMethod) {
        let visitor = this.createMemVisitor(this.source);
        visitor.visit(modelMethod.property);
        let props = [];
        let self = this;
        modelMethod.args.forEach(function (arg) {
            let v = self.createMemVisitor(self.source);
            v.visit(arg);
            props.push(v.result);
        });
        if (typeof visitor.result === "string") {
            let methods = this.getModelMethod().string;
            methods["context"] = visitor.result;
            if (methods[modelMethod.name] != null) {
                this.result = methods[modelMethod.name].apply(methods, props);
                return;
            }
        }
        else if (visitor.result instanceof Date) {
            let methods = this.getModelMethod().date;
            methods["context"] = visitor.result;
            if (methods[modelMethod.name] != null) {
                this.result = methods[modelMethod.name].apply(methods, props);
                return;
            }
        }
        if (visitor.result[modelMethod.name] == null)
            throw new Error(modelMethod.name + " method not found in context");
        this.result = visitor.result[modelMethod.name].apply(visitor.result, props);
    }
    value(value) {
        this.result = value.value;
    }
    expand(expand) {
        this.source.forEach(element => {
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
            this.result = this.source;
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
class MemSet {
    constructor(source) {
        this.source = source;
    }
    get(...expressions) {
        return Promise.resolve(MemSet._get(this.source, expressions));
    }
    add(element) {
        this.source.push(element);
        return Promise.resolve(element);
    }
    delete(element) {
        let indexOfItem = this.source.find((elem) => elem === element);
        if (indexOfItem === -1)
            return Promise.reject('element not found');
        return Promise.resolve();
    }
    update(element) {
        let indexOfItem = this.source.find((elem) => elem === element);
        if (indexOfItem === -1)
            return Promise.reject('element not found');
        this.source[indexOfItem] = element;
    }
    static get(source, ...expressions) {
        return this._get(source, expressions);
    }
    static _get(source, expressions) {
        let result = source;
        expressions.forEach((expression) => {
            let visitor = new MemArrayVisitor(result, source);
            visitor.visit(expression);
            result = visitor.result;
        });
        return result;
    }
}
exports.MemSet = MemSet;
//# sourceMappingURL=MemArrayVisitor.js.map