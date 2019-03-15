define("dataset", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Base data source for applying operations
     */
    class DataSet {
        constructor(expressions) {
            this.expressions = expressions;
        }
        getExpressions() {
            return this.expressions;
        }
        /**
         * fetches data as array from source.
         * @param expressions specifies events that will operate on the resource.
         */
        get(...expressions) {
            return Promise.reject('not implement');
        }
        /**
         * adds element to source
         * @param element
         */
        add(element) {
            return Promise.reject('not implement');
        }
        /**
         * deletes element from source
         * @param element
         */
        delete(element) {
            return Promise.reject('not implement');
        }
        /**
         * updates element
         * @param element
         */
        update(element) {
            return Promise.reject('not implement');
        }
        /**
         * creates a new dataset after it applied expression on it
         * @param expressions specifies events that will operate on the resource.
         */
        query(...expressions) {
            return this;
        }
        /**
         * fetches data as array from source.
         * @returns Promise
         */
        then(callback, errorCallback) {
            return this.get.apply(this, []).then(callback, errorCallback);
        }
        map(mapFn) {
            return this.then((response) => (response || []).map(mapFn));
        }
        insertTo(params) {
            if (params == null)
                return Promise.resolve(null);
            return this.then((response) => {
                if (Array.isArray(params) && Array.isArray(response)) {
                    response.forEach((item) => {
                        params.push(item);
                    });
                    return params;
                }
                if (Array.isArray(params) && !Array.isArray(response)) {
                    params.push(response);
                    return params;
                }
                if (!Array.isArray(params) && !Array.isArray(response)) {
                    for (let i in response) {
                        params[i] = response[i];
                    }
                    return params;
                }
                throw new Error('not support');
            });
        }
        static is(dataSetable) {
            if (dataSetable == null)
                return false;
            let name = "DataSet";
            if (dataSetable.constructor == null)
                return false;
            if (dataSetable.constructor.name === name)
                return true;
            return this.is(dataSetable.__proto__);
        }
    }
    exports.DataSet = DataSet;
    class DecorateSet extends DataSet {
        constructor(dataSet, observer) {
            super(dataSet.getExpressions());
            this.dataSet = dataSet;
            this.observer = observer;
            this.dataSet = dataSet;
        }
        get(...expressions) {
            if (this.observer.get == null)
                return this.dataSet.get.apply(this.dataSet, arguments);
            let self = this;
            let arg = arguments;
            return this.observer.get.apply({
                dataset: this.dataSet,
                next: function (value) {
                    value = value || arg;
                    return self.dataSet.get.apply(self.dataSet, value);
                }
            }, arguments);
        }
        map(mapFn) {
            return this.dataSet.map(mapFn);
        }
        insertTo(params) {
            return this.dataSet.insertTo(params);
        }
        add(element) {
            if (this.observer.add == null && this.observer.addUpdate == null)
                return this.dataSet.add.apply(this.dataSet, arguments);
            if (this.observer.add != null)
                return this.observer.add.apply(this.dataSet, arguments);
            let arg = arguments;
            let self = this;
            return this.observer.addUpdate.apply({ dataset: this.dataSet, next: function (value) {
                    value = value || arg;
                    return self.dataSet.add.apply(self.dataSet, value);
                } }, arguments);
        }
        delete(element) {
            if (this.observer.delete == null)
                return this.dataSet.delete.apply(this.dataSet, arguments);
            let self = this;
            let arg = arguments;
            return this.observer.delete.apply({
                dataset: this.dataSet,
                next: function () {
                    return self.dataSet.delete.apply(self.dataSet, arg);
                }
            }, arguments);
        }
        update(element) {
            if (this.observer.update == null && this.observer.addUpdate == null)
                return this.dataSet.update.apply(this.dataSet, arguments);
            if (this.observer.update != null)
                return this.observer.update.apply(this.dataSet, arguments);
            let arg = arguments;
            let self = this;
            return this.observer.addUpdate.apply({ dataset: this.dataSet, next: function (value) {
                    value = value || arg;
                    return self.dataSet.update.apply(self.dataSet, value);
                } }, arguments);
        }
        query(...expressions) {
            return new DecorateSet(this.dataSet.query.apply(this.dataSet, arguments), this.observer);
        }
    }
    exports.DecorateSet = DecorateSet;
});
/*export enum Edm {
    Null,
    Binary,
    Boolean,
    Byte,
    DateTime,
    Decimal,
    Double,
    Single,
    Guid,
    Int16,
    Int32,
    Int64,
    String,
    Time
}
*/
define("schema", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Guid {
        constructor(value) {
            this.value = value;
            if (value == null)
                return;
            if (typeof value != "string")
                throw new Error('value is not guid. Please check');
        }
        toString() {
            return this.value;
        }
        valueOf() {
            return this.value;
        }
        static new() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return new Guid(s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
        }
        static newString() {
            return this.new().toString();
        }
        static parse(value) {
            if (value instanceof Guid)
                return value;
            let any = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
            if (any)
                return new Guid(value);
            throw new Error(value + " is could not parse for guid");
        }
        static tryParse(value) {
            if (value instanceof Guid)
                return value;
            let any = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
            if (any)
                return new Guid(value);
            return null;
        }
    }
    exports.Guid = Guid;
    class Float {
    }
    exports.Float = Float;
});
define("expressions", ["require", "exports", "schema"], function (require, exports, schema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            if (value instanceof Date)
                return true;
            if (value instanceof schema_1.Guid)
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
                return this.root(host);
            if (host instanceof This)
                return this.this(host);
            if (host instanceof Property)
                return this.property(host);
            if (host instanceof Operation)
                return this.operation(host);
            if (host instanceof Select)
                return this.select(host);
            if (host instanceof SelectMany)
                return this.selectMany(host);
            if (host instanceof Filter)
                return this.filter(host);
            if (host instanceof Find)
                return this.find(host);
            if (host instanceof Count)
                return this.count(host);
            if (host instanceof Order)
                return this.order(host);
            if (host instanceof Expand)
                return this.expand(host);
            if (host instanceof Top)
                return this.top(host);
            if (host instanceof Skip)
                return this.skip(host);
            if (host instanceof InlineCount)
                return this.inlineCount(host);
            if (host instanceof Method)
                return this.method(host);
            if (host instanceof Value)
                return this.value(host);
            if (Value.isValid(host))
                return this.value(new Value(host));
            if (host instanceof ModelMethod)
                return this.modelMethod(host);
            if (host instanceof EqBinary)
                return this.eqBinary(host);
            if (host instanceof It)
                return this.it(host);
            if (host instanceof GlobalMethod)
                return this.globalMethod(host);
            if (host instanceof Action)
                return this.action(host);
            if (host instanceof Func)
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
});
define("visitors/selectPropertyFinder", ["require", "exports", "expressions"], function (require, exports, expressions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SelectPropertyFinder extends expressions_1.ExpressionVisitor {
        constructor() {
            super(...arguments);
            this.properties = [];
        }
        filter(filter) {
            this.visit(filter.expression);
        }
        addProperty(property) {
            if ([null, ''].some((a) => property.name == a))
                return;
            this.properties.push(property);
        }
        getAsExpressions() {
            let getExpand = function (property) {
                let allProps = [];
                let p = property;
                while (p != null) {
                    allProps.push(p.name);
                    p = p.parent;
                }
                allProps.reverse();
                return new expressions_1.Expand([{
                        property: new expressions_1.Property(allProps[0]),
                        expressions: [new expressions_1.Select(allProps.splice(1, allProps.length).map(a => {
                                return {
                                    property: a,
                                };
                            }))]
                    }]);
            };
            let expands = this.properties.filter(x => x.parent != null);
            return [].concat(expands.map(getExpand)).concat([new expressions_1.Select(this.properties.filter(x => x.parent == null).map(a => {
                    return {
                        property: a,
                        expressions: []
                    };
                }))]);
        }
        order(order) {
            this.addProperty(order.property);
        }
        eqBinary(binary) {
            this.visit(binary.left);
            this.visit(binary.op);
            this.visit(binary.right);
        }
        property(propery) {
            this.addProperty(propery);
        }
        selectMany(selectManay) {
            this.addProperty(new expressions_1.Property(selectManay.name, selectManay.parent));
        }
        modelMethod(method) {
            method.args.forEach((i) => {
                this.addProperty(i);
            });
        }
    }
    exports.SelectPropertyFinder = SelectPropertyFinder;
});
define("lazyarrayvisitor", ["require", "exports", "expressions", "dataset", "schema"], function (require, exports, expressions_2, dataset_1, schema_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LazyArrayVisitor extends expressions_2.ExpressionVisitor {
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
                    let result = LazyArrayVisitor.createEmptyObjectFor(element);
                    newResult.push(result);
                    let args = select.args.length == 0 ? Object.keys(element).map(x => {
                        return {
                            property: new expressions_2.Property(x),
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
        static createEmptyObjectFor(element) {
            let newResult = {};
            Object.getOwnPropertySymbols(element).forEach((prop) => {
                newResult[prop] = element[prop];
            });
            return newResult;
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
                if (typeof value !== "object" || (value instanceof schema_2.Guid)) {
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
                        if (l === r)
                            return 0;
                        if (order.type === null || order.type === "asc")
                            return l > r ? 1 : -1;
                        return r > l ? 1 : -1;
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
            let filters = this.filterExpressions(expressions, expressions_2.Filter);
            filters = filters.length > 1 ? [new expressions_2.Filter(filters.reduce((accumulator, current) => {
                    if (accumulator instanceof expressions_2.Filter) {
                        return new expressions_2.EqBinary(accumulator.expression, new expressions_2.Operation('and'), current.expression);
                    }
                    return new expressions_2.EqBinary(accumulator, new expressions_2.Operation('and'), current.expression);
                }))] : filters; // combine as one
            let orders = this.filterExpressions(expressions, expressions_2.Order);
            let skips = this.filterExpressions(expressions, expressions_2.Skip);
            let tops = this.filterExpressions(expressions, expressions_2.Top);
            let selects = this.filterExpressions(expressions, expressions_2.Select);
            let select = selects.length == 0 ? null : selects.reduce((accumlator, c) => {
                return new expressions_2.Select(accumlator.args.concat(c.args));
            });
            let expands = this.filterExpressions(expressions, expressions_2.Expand);
            let expand = expands.length == 0 ? null : expands.reduce((accumulator, c) => {
                return new expressions_2.Expand(accumulator.args.concat(c.args));
            });
            let finds = this.filterExpressions(expressions, expressions_2.Find);
            let counts = this.filterExpressions(expressions, expressions_2.Count);
            let result = {
                expandAndSelects: [].concat(expand, select).filter(x => x != null),
                others: filters.concat(orders, skips, tops, counts, finds)
            };
            return result;
        }
        static getOnlyStucts(element) {
            if (element == null)
                return;
            let validsStructs = ["string", "boolean", "number", "function", "symbol"];
            let validsObject = [Date, schema_2.Guid];
            let newResult = LazyArrayVisitor.createEmptyObjectFor(element);
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
            return dataset_1.DataSet.is(dataSetable);
        }
        static get(source, ...expressions) {
            if (Array.isArray(expressions) && expressions.length === 1 && expressions[0] && Array.isArray(expressions[0]))
                expressions = expressions[0];
            let rangeExpressions = this.rangeExpressions(expressions);
            return this._pruneAndGet(source, rangeExpressions.others.reverse()).then((response) => {
                let expand = this.filterExpressions(rangeExpressions.expandAndSelects, expressions_2.Expand)[0];
                let select = this.filterExpressions(rangeExpressions.expandAndSelects, expressions_2.Select)[0];
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
            if (o instanceof dataset_1.DataSet)
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
});
define("memarrayvisitor", ["require", "exports", "schema", "lazyarrayvisitor", "expressions", "dataset"], function (require, exports, schema_3, lazyarrayvisitor_1, expressions_3, dataset_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MemArrayVisitor extends expressions_3.ExpressionVisitor {
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
    class MemSet extends dataset_2.DataSet {
        constructor(source, expressions = []) {
            super(expressions);
            this.source = source;
            this.expressions = expressions || [];
            this.trackingId = Symbol.for(schema_3.Guid.newString().toString());
            (Array.isArray(source) ? source : []).forEach((item) => {
                this.addTrackingId(item);
            });
        }
        get trackingId() {
            return this._trackingId;
        }
        ;
        set trackingId(newValue) {
            this._trackingId = newValue;
        }
        addTrackingId(element) {
            if (element != null)
                element[this.trackingId] = schema_3.Guid.newString();
        }
        query(...expressions) {
            let result = new MemSet([], this.expressions.map(x => x).concat(expressions));
            result.source = this.source;
            result.trackingId = this.trackingId;
            return result;
        }
        get(...expressions) {
            let expression = this.expressions.map(x => x).concat(expressions);
            return lazyarrayvisitor_1.LazyArrayVisitor.get(this.source, expression).then((response) => {
                return response;
            });
        }
        add(element) {
            this.addTrackingId(element);
            this.source.push(element);
            return Promise.resolve(element);
        }
        __getValueOf(value) {
            return value != null && typeof value.valueOf === "function" ? value.valueOf() : value;
        }
        __is(base, element) {
            let ids = ["ID", "id", "Id", "iD", this.trackingId];
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
    }
    exports.MemSet = MemSet;
});
define("branchset", ["require", "exports", "visitors/selectPropertyFinder", "memarrayvisitor", "expressions", "dataset"], function (require, exports, selectPropertyFinder_1, memarrayvisitor_1, expressions_4, dataset_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BranchContext {
        constructor(source, branchName, expressions) {
            this.source = source;
            this.branchName = branchName;
            this.expressions = expressions;
        }
    }
    class BrachsetUtility {
        /**
         * Eğer alınan sonuç array ise tek bir array olarak birleştirilir. Eğer object ise array olarak toplanıp dönülür.
         * @param context
         * @param response
         */
        static getPropertyAndGuaranteeResultIsArray(propName, response) {
            if (response == null)
                return [];
            let results = [];
            if (Array.isArray(response)) {
                response.forEach((item) => {
                    let propValue = item[propName];
                    if (propValue == null)
                        return true;
                    if (Array.isArray(propValue)) {
                        results.push.apply(results, propValue);
                        return true;
                    }
                    results.push(propValue);
                    return true;
                });
                return results;
            }
            let propValue = response[propName];
            if (Array.isArray(propValue))
                return propValue;
            return [propValue];
        }
        static getSelectOrExpandByUsedProperies(expressions) {
            let results = [];
            expressions.forEach((exp) => {
                let visitor = new selectPropertyFinder_1.SelectPropertyFinder();
                visitor.visit(exp);
                results.push.apply(results, visitor.getAsExpressions());
            });
            return results;
        }
        static isWillObject(expressions) {
            if (expressions == null)
                return false;
            return expressions.some(a => a instanceof expressions_4.Find);
        }
    }
    /**
     * Bütün işlemleri expand üzerinde yapar.
     */
    class DirectStrategy {
        constructor() {
            this.afterExpressions = [expressions_4.Find];
        }
        escapeAfterExpressions(expressions) {
            return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
        }
        get(context) {
            let exps = this.escapeAfterExpressions(context.expressions);
            let expsWithUsedExpressions = exps.concat(BrachsetUtility.getSelectOrExpandByUsedProperies(exps));
            return context.source.get.apply(context.source, [new expressions_4.Expand([{
                        property: new expressions_4.Property(context.branchName),
                        expressions: expsWithUsedExpressions
                    }])]).then((response) => {
                return new memarrayvisitor_1.MemSet(BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response), expsWithUsedExpressions).get();
            });
        }
    }
    exports.DirectStrategy = DirectStrategy;
    /**
     * Single Side Collector
     * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
     */
    class SSCollectorStrategy {
        getExpandAndSelect(expressions) {
            let items = [expressions_4.Select, expressions_4.Expand];
            return expressions.filter(a => items.some(i => a instanceof i));
        }
        get(context) {
            // let exps =  this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions));
            return context.source.get(new expressions_4.Expand([{
                    property: new expressions_4.Property(context.branchName),
                    expressions: this.getExpandAndSelect(context.expressions)
                }]))
                .then((response) => {
                let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
                // let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
                return new memarrayvisitor_1.MemSet(items || [], //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
                context.expressions).then((r) => {
                    return r;
                });
            });
        }
    }
    /**
     * Double side filter collector.
     * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
     */
    class DSFCollectorStrategy {
        constructor() {
            this.afterExpressions = [expressions_4.Order, expressions_4.Top, expressions_4.Skip, expressions_4.Filter, expressions_4.Find];
            this.usesDoubleSourceExpressions = [expressions_4.Filter];
        }
        /**
         *
         * @param expressions
         */
        escapeAfterExpressions(expressions) {
            return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
        }
        getDoubleSourceExpressions(expressions) {
            return expressions.filter(x => this.usesDoubleSourceExpressions.some(a => x instanceof a));
        }
        get(context) {
            let exps = this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions));
            return context.source.get(new expressions_4.Expand([{
                    property: new expressions_4.Property(context.branchName),
                    expressions: exps
                }]))
                .then((response) => {
                let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
                // let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
                return new memarrayvisitor_1.MemSet(items, //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
                context.expressions).then((r) => {
                    return r;
                });
            });
        }
    }
    class SmartStrategy {
        getStrategy(context) {
            if (context.source.getExpressions().some(x => x instanceof expressions_4.Find))
                return new DirectStrategy();
            return new SSCollectorStrategy();
        }
        get(context) {
            return this.getStrategy(context).get(context);
        }
    }
    /**
     * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
     *
     */
    class Branchset extends dataset_3.DataSet {
        constructor(source, branchName, expressions = [], strategy = new SmartStrategy()) {
            super(expressions);
            this.source = source;
            this.branchName = branchName;
            this.strategy = strategy;
        }
        get(...expressions) {
            return this.getOn(expressions);
        }
        getOn(expressions) {
            let items = this.expressions.concat.apply(this.expressions, expressions);
            return this.strategy.get(new BranchContext(this.source, this.branchName, items));
        }
        add(element) {
            return this.source.add(element);
        }
        delete(element) {
            return this.source.delete(element);
        }
        update(element) {
            return this.source.update(element);
        }
        query(...expressions) {
            return new Branchset(this.source, this.branchName, this.expressions.concat.apply(this.expressions, expressions), this.strategy);
        }
    }
    /**
     * Double side filter collector.
     * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
     */
    Branchset.DoubleSideCollector = new DSFCollectorStrategy();
    /**
     * Single Side Collector
     * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
    */
    Branchset.SingleSideCollector = new SSCollectorStrategy();
    /**
     * Bütün işlemleri expand üzerinde yapar.
     */
    Branchset.Direct = new DirectStrategy();
    Branchset.SmartStrategy = new SmartStrategy();
    exports.Branchset = Branchset;
});
define("logs/ILogger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ConsoleLogger {
        info(message) {
            return Promise.resolve(console.info(message));
        }
        error(message) {
            return Promise.resolve(console.error(message));
        }
        warn(message) {
            return Promise.resolve(console.error(message));
        }
    }
    exports.ConsoleLogger = ConsoleLogger;
});
define("restclient", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HttpResponse {
        constructor(responseText, headers, status) {
            this.responseText = responseText;
            this.headers = headers;
            this.status = status;
        }
        get isSuccess() {
            return this.status >= 200 && this.status < 300;
        }
        json() {
            if (this.responseText === null || this.responseText === "")
                return this.responseText;
            return JSON.parse(this.responseText);
        }
    }
    exports.HttpResponse = HttpResponse;
    class RestClient {
        constructor(creator) {
            this.creator = creator;
            this.headers = {};
            this.pipes = [];
        }
        /**
         * manipules Response
         */
        pipe(fn) {
            this.pipes.push(fn);
            return this;
        }
        get(url, headers) {
            return this.create('GET', url, null, headers);
        }
        post(url, data, headers) {
            return this.create('POST', url, data, headers);
        }
        put(url, data, headers) {
            return this.create('PUT', url, data, headers);
        }
        delete(url, headers) {
            return this.create('DELETE', url, null, headers);
        }
        cloneHeaderOrEmpty(headers) {
            if (headers == null)
                return Object.assign({}, this.headers);
            return Object.assign(Object.assign({}, this.headers), headers);
        }
        invokePipe(response) {
            let result = response;
            this.pipes.forEach((fn) => {
                result = fn(this, result);
            });
            return result;
        }
        create(method, url, data, headers) {
            let self = this;
            return new Promise((resolve, reject) => {
                let xhttp = '';
                if (this.creator != null)
                    xhttp = this.creator.create();
                try {
                    xhttp.open(method, url, true);
                    let cloneHeader = this.cloneHeaderOrEmpty(headers);
                    for (let i in cloneHeader) {
                        xhttp.setRequestHeader(i, cloneHeader[i]);
                    }
                    xhttp.timeout = 240000; // 4dk
                    xhttp.ontimeout = function (e) {
                        // XMLHttpRequest timed out. Do something here.
                        reject(self.invokePipe(new HttpResponse("Request Timeout", self.getHeaders(this.getAllResponseHeaders()), this.status)));
                    };
                    xhttp.onreadystatechange = function () {
                        if (this.readyState != 4)
                            return;
                        if (this.status >= 200 && this.status < 300) {
                            resolve(self.invokePipe(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status)));
                            return;
                        }
                        reject(self.invokePipe(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status)));
                    };
                    xhttp.send(data);
                }
                catch (ex) {
                    reject(ex);
                    return;
                }
            });
        }
        getHeaders(headers) {
            var arr = headers.trim().split(/[\r\n]+/);
            let headerMap = {};
            arr.forEach(function (line) {
                var parts = line.split(': ');
                var header = parts.shift();
                var value = parts.join(': ');
                headerMap[header] = value;
            });
            return headerMap;
        }
    }
    exports.RestClient = RestClient;
    class TrackingClient extends RestClient {
        constructor(restClient, logger) {
            super(restClient.creator);
            this.restClient = restClient;
            this.logger = logger;
        }
        calculateTimeString(interval) {
            let minutes = Math.floor(interval / 60000);
            let seconds = parseInt(((interval % 60000) / 1000).toFixed(0));
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }
        create(method, url, data, headers) {
            let now = Date.now();
            return this.logger.info({
                "id": now,
                "type": "request",
                [method]: {
                    url,
                    data,
                    headers
                }
            }).then(() => {
                return this.restClient.create(method, url, data, headers).then((response) => {
                    return this.logger.info({
                        "id": now,
                        "type": "response",
                        time: this.calculateTimeString(Date.now() - now),
                        [method]: {
                            url,
                            data,
                            headers,
                            response
                        }
                    }).then(() => {
                        return response;
                    });
                }, (errors) => {
                    return this.logger.error({
                        "id": now,
                        "type": "error",
                        time: this.calculateTimeString(Date.now() - now),
                        [method]: {
                            url,
                            data,
                            headers,
                            errors
                        }
                    }).then(() => {
                        return errors;
                    });
                });
            });
        }
    }
    exports.TrackingClient = TrackingClient;
});
define("http", ["require", "exports", "restclient"], function (require, exports, restclient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Http extends restclient_1.RestClient {
        constructor() {
            super({
                create: function () {
                    if (XMLHttpRequest != null) {
                        return new XMLHttpRequest();
                    }
                },
            });
        }
    }
    exports.Http = Http;
});
define("odata", ["require", "exports", "dataset", "schema", "expressions", "http"], function (require, exports, dataset_4, schema_4, expressions_5, http_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ODataVisitor extends expressions_5.ExpressionVisitor {
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
            if (expressions_5.Value.isValid(find.value)) {
                str = getAsStruct(new expressions_5.Value(find.value));
            }
            else {
                let props = [];
                let obj = find.value;
                for (let prop in obj) {
                    let value = obj[prop];
                    if (expressions_5.Value.isValid(value)) {
                        props.push(prop + "=" + getAsStruct(new expressions_5.Value(value)));
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
            else if (v instanceof Date)
                r = v.toISOString();
            else if (v instanceof schema_4.Guid)
                r = "" + v.toString() + "";
            else if (v instanceof Object) {
                let params = [];
                for (let i in v) {
                    let value = v[i];
                    if (!(value instanceof expressions_5.Value))
                        value = new expressions_5.Value(value);
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
    class ODataCombineVisitor extends expressions_5.ExpressionVisitor {
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
                key: schema_4.Guid.new().toString(),
                value: value
            });
        }
        select(select) {
            let self = this;
            this.set('select', () => new expressions_5.Select([].concat(select.args)), (item) => new expressions_5.Select(self.distinct(item.args.concat(select.args))));
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
                let result = new expressions_5.Expand(args);
                return result;
            });
        }
        filter(filter) {
            this.set("filter", () => filter, (f) => {
                if (f.expression == null)
                    return new expressions_5.Filter(filter.expression);
                return new expressions_5.Filter(new expressions_5.EqBinary(f.expression, new expressions_5.Operation('and'), filter.expression));
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
    class ODataSet extends dataset_4.DataSet {
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
            if (expressions[0] instanceof expressions_5.Find) { // filter after find. filter is not necassary
                optExpressions = optExpressions.filter(x => !(x instanceof expressions_5.Filter) && !(x instanceof expressions_5.Order));
            }
            ;
            return Array.isArray(optExpressions) ? optExpressions.map(x => x).concat(expressions) : expressions.map(x => x);
        }
        getBody(expressions) {
            let body = expressions.filter(x => x instanceof expressions_5.Action).map(x => x.parameters).reduce((c, n) => {
                return c.concat(n);
            }, []).reduce((c, n) => {
                return new expressions_5.Value(Object.assign({}, c.value, n.value));
            }, new expressions_5.Value({}));
            return body.value;
        }
        anyBody(expressions) {
            return expressions.some(a => a instanceof expressions_5.Action);
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
            let anyCount = optExpressions.some((exp) => exp instanceof expressions_5.Count);
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
                if (dataset_4.DataSet.is(value[i]))
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
            if (values instanceof schema_4.Guid)
                return values.value;
            if (values instanceof Date)
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
                visitor.visit(new expressions_5.Value(this.getIdsValue(element)));
                return "(" + visitor.result + ")";
            }
            let v = element[this.options.primary.name];
            let type = this.options.primary.type;
            if (type === schema_4.Guid && typeof v === "string") {
                v = new schema_4.Guid(v);
            }
            else if (type === Date && typeof v === "string") {
                v = new Date(v);
            }
            let visitor = new ODataVisitor();
            visitor.visit(new expressions_5.Value(v));
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
                    if (expression instanceof expressions_5.Method)
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
});
define("cacheset", ["require", "exports", "dataset", "odata"], function (require, exports, dataset_5, odata_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CacheSet extends dataset_5.DataSet {
        constructor(dataset) {
            if (dataset == null)
                throw new Error('dataset is null for caching');
            super(dataset.getExpressions());
            this.dataset = dataset;
        }
        update(value) {
            return this.dataset.update.apply(this.dataset, arguments);
        }
        add(value) {
            return this.dataset.add.apply(this.dataset, arguments);
        }
        delete(value) {
            return this.dataset.delete.apply(this.dataset, arguments);
        }
        get(expressions) {
            let query = odata_1.QuerySet.get(expressions);
            if (CacheSet.caches[query] != null) {
                return Promise.resolve(CacheSet.caches[query]);
            }
            return this.dataset.get.apply(this.dataset, arguments).then((response) => {
                CacheSet.caches[query] = response;
                return response;
            });
        }
        query() {
            let result = new CacheSet(this.dataset.query.apply(this.dataset, arguments));
            return result;
        }
    }
    CacheSet.caches = {};
    exports.CacheSet = CacheSet;
});
define("core", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Emitter {
        /**
         *
         * @param {string} type is sync or async. if async emits values as asynchronously otherwise synchronously
         */
        constructor(type) {
            this.type = type;
            this._events = [];
            this._async = (events, args) => {
                events.forEach(function (event) {
                    setTimeout(function () {
                        event.apply(window, args);
                    }, 0);
                });
                return true;
            };
            this._sync = (events, args) => {
                let result = true;
                events.forEach(function (event) {
                    if (event.apply(window, args) === false) {
                        result = false;
                        return false;
                    }
                    return true;
                });
                return result;
            };
            this._strategy = type === 'sync' ? this._sync : this._async;
        }
        /**
         * hooks to actions
         * @param {Function} callbackFn
         */
        hook(callbackFn) {
            if (typeof callbackFn !== "function")
                throw new Error('callbackFn is not function');
            this._events.push(callbackFn);
        }
        /**
         * Creates new emitter builder for observing.
         * @param {Object} obj object to be watched
         */
        for(obj) {
            return new EmitterObjectBuilder(obj, this);
        }
        /**
         * emits to all observers . if strategy is sync, result can break value. if returns false it must be break
         * @returns {Boolean}  break value. if true continue otherwise break.
         */
        emit(...params) {
            return this._strategy(this._events, arguments);
        }
    }
    exports.Emitter = Emitter;
    class EmitterObjectBuilder {
        /**
         *
         * @param {Object} obj
         * @param {Emitter} emitter
         */
        constructor(obj, emitter) {
            this.obj = obj;
            this.emitter = emitter;
        }
        /**
         * When props change. It emits changed object
         * @param {Array} props properties
         */
        peek(props) {
            if (!Array.isArray(props))
                throw new Error('EmitterObjectBuilder in on method : argument is not valid');
            let self = this;
            props.forEach((prop) => {
                Object.defineProperty(this.obj, prop, {
                    get: () => {
                        return self.obj[prop];
                    },
                    set: (newValue) => {
                        self.obj[prop] = newValue;
                        self.emitter.emit(self.obj);
                    }
                });
            });
        }
    }
    exports.EmitterObjectBuilder = EmitterObjectBuilder;
    class Utility {
        static ObjectDefineProperty(o, p, attributes) {
            let set = attributes.set;
            let oldAttributes = Object.getOwnPropertyDescriptor(o, p) || {};
            // let oldGet = oldAttributes.get;
            let oldSet = oldAttributes.set;
            attributes.set = function (newValue) {
                if (oldSet != null)
                    oldSet.apply(oldAttributes, [newValue]);
                set.apply(attributes, [newValue]);
            };
            Object.defineProperty(o, p, attributes);
            /**
             *        configurable:attributes.configurable,
                writable:attributes.writable,
                enumerable:attributes.enumerable
             */
        }
    }
    exports.Utility = Utility;
    class TaskHandler {
        static runSequent(items, fn, force = false) {
            return new SequentTaskHandler(items, fn, force).run();
        }
        static runAsync(items, fn, taskCount = 0, timeout = 0) {
            return new AsyncTaskHandler(items, fn, taskCount, timeout).run();
        }
        static runFirstSuccess(items, fn) {
            return new TaskHandlerFirstSuccess(items, fn);
        }
        /**
         *
         * @param timeout task can cancel in timeout(ms)
         */
        static createCancellable(timeout = 0) {
            return new CancellableTaskHandler(timeout);
        }
    }
    exports.TaskHandler = TaskHandler;
    class SequentTaskHandlerEvent {
        constructor() {
            this.isCancelled = false;
        }
        cancel() {
            this.isCancelled = true;
        }
    }
    class SequentTaskHandler {
        constructor(items, fn, force = false) {
            this.items = items;
            this.fn = fn;
            this.force = force;
        }
        run() {
            this.arg = new SequentTaskHandlerEvent();
            if (this.noPromise())
                return Promise.resolve();
            let self = this;
            let newItems = this.createNewCollectionPromise();
            return new Promise((resolve, reject) => {
                self.bind(resolve, reject, newItems, newItems.pop());
            });
        }
        bind(resolve, reject, items, value) {
            this.returnPromise = this.fn(value, this.arg);
            if (this.arg.isCancelled) {
                reject("cancelled");
                return;
            }
            let self = this;
            self.returnPromise.then(() => {
                if (items.length == 0) {
                    resolve();
                    return;
                }
                if (this.arg.isCancelled) {
                    reject("cancelled");
                    return;
                }
                self.bind(resolve, reject, items, items.pop());
            }, (error) => {
                if (self.force) {
                    if (items.length == 0) {
                        resolve();
                        return;
                    }
                    if (this.arg.isCancelled) {
                        reject("cancelled");
                        return;
                    }
                    self.bind(resolve, reject, items, items.pop());
                    return;
                }
                reject(error);
            });
        }
        createNewCollectionPromise() {
            return this.items.map(x => x);
        }
        noPromise() {
            return this.items.length == 0;
        }
    }
    class AsyncTaskHandler {
        constructor(items, fn, taskCount = 0, timeout = 0) {
            this.items = items;
            this.fn = fn;
            this.taskCount = taskCount;
            this.timeout = timeout;
            if (!this.isTaskCountValid())
                throw new Error("taskCount is not valid for operation");
        }
        isTaskCountValid() {
            if (this.taskCount < 0)
                return false;
            return true;
        }
        getCount() {
            if (this.taskCount === 0)
                return this.items.length;
            if (this.taskCount > this.items.length)
                return this.items.length;
            return this.taskCount;
        }
        run() {
            let parts = this.getAllParts();
            if (parts.length == 0)
                return Promise.resolve();
            return new SequentTaskHandler(parts.reverse(), (items) => {
                if (items.length == 0)
                    return Promise.resolve();
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        let ps = items.map(x => this.fn(x));
                        Promise.all(ps).then(r => {
                            resolve(r);
                        }, (error) => {
                            reject(error);
                        });
                    }, this.timeout);
                });
            }, true).run();
        }
        isEmpty() {
            return this.items.length == 0;
        }
        getParts() {
            if (this.isEmpty())
                return [];
            let returns = new Array();
            for (let i = 0; i < this.getCount(); i++) {
                if (this.isEmpty())
                    break;
                returns.push(this.items.pop());
            }
            return returns;
        }
        getAllParts() {
            let results = new Array();
            while (!this.isEmpty())
                results.push(this.getParts());
            return results;
        }
    }
    class CancellableTaskMediator {
        constructor() {
            this._isCancel = false;
        }
        get isCancelled() {
            return this._isCancel;
        }
        cancel() {
            this._isCancel = true;
        }
    }
    class CancellableTaskHandler {
        /**
         *
         * @param timeout invoke time
         */
        constructor(timeout) {
            this.timeout = timeout;
            this.mediators = [];
        }
        /**
         * adds new actions and cancels before actions
         * @param fn new action
         */
        runOnly(fn) {
            this.cancel();
            this.insertAction(fn);
        }
        insertAction(fn) {
            var mediator = this.pullMediator();
            setTimeout(() => {
                if (mediator.isCancelled)
                    return;
                fn();
            }, this.timeout);
        }
        /**
         * cancels all actions
         */
        cancel() {
            this.mediators.forEach(mediator => {
                mediator.cancel();
            });
        }
        pullMediator() {
            var mediator = new CancellableTaskMediator();
            this.mediators.push(mediator);
            return mediator;
        }
    }
    exports.CancellableTaskHandler = CancellableTaskHandler;
    class TaskHandlerFirstSuccess {
        constructor(items, fn) {
            this.items = items;
            this.fn = fn;
        }
        run() {
            let self = this;
            let errorCount = 0;
            return new Promise((resolve, reject) => {
                new SequentTaskHandler(self.items.map(x => x), (item, ev) => {
                    return self.fn(item).then((response) => {
                        ev.cancel();
                        resolve(response);
                        return response;
                    }, (error) => {
                        errorCount++;
                        if (errorCount == self.items.length) {
                            reject(); // hepsi fail olursa 
                            return;
                        }
                        return error;
                    });
                }, true).run().catch(() => {
                    //ignore
                });
            });
        }
    }
});
define("changeset", ["require", "exports", "core", "dataset"], function (require, exports, core_1, dataset_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ChangeSet extends dataset_6.DataSet {
        constructor(source) {
            super(source.getExpressions());
            this.source = source;
            this.onAdding = new core_1.Emitter('sync');
            this.onAdded = new core_1.Emitter('async');
            this.onDeleting = new core_1.Emitter('sync');
            this.onDeleted = new core_1.Emitter('async');
            this.onUpdating = new core_1.Emitter('sync');
            this.onUpdated = new core_1.Emitter('async');
        }
        onAdd(callback) {
            this.onAdding.hook(callback);
            return this;
        }
        whenAdded(callback) {
            this.onAdded.hook(callback);
            return this;
        }
        whenDeleted(callback) {
            this.onDeleted.hook(callback);
            return this;
        }
        whenUpdated(callback) {
            this.onUpdated.hook(callback);
            return this;
        }
        onDelete(callback) {
            this.onDeleting.hook(callback);
            return this;
        }
        onUpdate(callback) {
            this.onUpdating.hook(callback);
            return this;
        }
        getEmitValue(obj) {
            return Object.assign({
                source: this.source,
                changeset: this,
            }, obj);
        }
        getInterrupted(message) {
            return new ChangeSetinterruptedArgs(this, message);
        }
        query(...expressions) {
            return new ChangeSet(this.source.query.apply(this.source, arguments));
        }
        add(value) {
            if (this.onAdding.emit(this.getEmitValue({ value })) == false)
                return Promise.reject(this.getInterrupted('adding is interrupted'));
            return this.source.add(value).then((response) => {
                this.onAdded.emit(this.getEmitValue({ value, response }));
                return response;
            });
        }
        update(value) {
            if (this.onUpdating.emit(this.getEmitValue({ value })) == false)
                return Promise.reject(this.getInterrupted('updating is interrupted'));
            return this.source.update(value).then((response) => {
                this.onUpdated.emit(this.getEmitValue({ value, response }));
                return response;
            });
        }
        delete(value) {
            if (this.onDeleting.emit(this.getEmitValue({ value })) == false)
                return Promise.reject(this.getInterrupted('deleting is interrupted'));
            return this.source.delete(value).then((response) => {
                this.onDeleted.emit(this.getEmitValue({ value, response }));
                return response;
            });
        }
        get() {
            return this.source.get.apply(this.source, arguments);
        }
    }
    exports.ChangeSet = ChangeSet;
    class ChangeSetinterruptedArgs {
        constructor(changeset, message) {
            this.changeset = changeset;
            this.message = message;
        }
    }
    exports.ChangeSetinterruptedArgs = ChangeSetinterruptedArgs;
});
define("mapset", ["require", "exports", "dataset", "memarrayvisitor", "expressions"], function (require, exports, dataset_7, memarrayvisitor_2, expressions_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapSet extends dataset_7.DataSet {
        constructor(source, mapFn, expressions = [], mapFnEx) {
            super(expressions);
            this.source = source;
            this.mapFn = mapFn;
            this.mapFnEx = mapFnEx;
        }
        createMemset(expressions) {
            if (typeof this.mapFn === "function") {
                let filters = expressions.filter(this.onlySortandElimination);
                return this.source.query.apply(this.source, expressions.filter(this.onlyRange))
                    .then((response) => {
                    let result = Array.isArray(response) ? response.map(this.mapFn) : this.mapFn(response, -1, null);
                    let set = new memarrayvisitor_2.MemSet(result);
                    set = set.query.apply(set, expressions.filter(this.onlySelect));
                    let memset = filters.length != 0 ? set.query.apply(set, filters) : set;
                    return {
                        set: memset
                    };
                });
            }
            if (typeof this.mapFn === "string") {
                let filters = expressions.filter(this.onlySortandElimination);
                let exps = expressions.filter(this.onlyRange).concat([new expressions_6.Expand([{
                            property: new expressions_6.Property(this.mapFn),
                            expressions: expressions.filter(this.onlySelect)
                        }])]);
                return this.source.query.apply(this.source, exps).then((response) => {
                    let result = Array.isArray(response) ? response.map((x, i, array) => {
                        let result = x[this.mapFn];
                        if (this.mapFnEx == null)
                            return result;
                        return this.mapFnEx(result, x, i, array);
                    }) : () => {
                        let result = response[this.mapFn];
                        if (this.mapFnEx != null) {
                            return this.mapFnEx(result, response, -1, null);
                        }
                        return result;
                    };
                    let set = new memarrayvisitor_2.MemSet(result);
                    return {
                        set: (filters.length != 0 ? set.query.apply(set, filters) : set)
                    };
                });
            }
            throw new Error('Not support');
        }
        query(...expression) {
            return new MapSet(this.source, this.mapFn, [].concat(this.expressions).concat(expression || []));
        }
        onlySelect(x) {
            let types = [expressions_6.Select, expressions_6.Expand];
            return types.some(t => x instanceof t);
        }
        onlyRange(x) {
            let types = [expressions_6.Skip, expressions_6.Top];
            return types.some(t => x instanceof t);
        }
        onlySortandElimination(x) {
            let types = [expressions_6.Filter, expressions_6.Order];
            return types.some(t => x instanceof t);
        }
        add(item) {
            return Promise.reject('Mapset: not support add');
        }
        update(item) {
            return Promise.reject('Mapset: not support update');
        }
        delete(item) {
            return Promise.reject('Mapset: not support delete');
        }
        get(...expression) {
            let allExpressions = [].concat(this.expressions || []).concat(expression || []);
            return this.createMemset(allExpressions).then((e) => {
                return e.set.then((response) => {
                    return response;
                });
            });
        }
    }
    exports.MapSet = MapSet;
});
define("memoperation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MemOperation {
    }
    exports.MemOperation = MemOperation;
    /**Distincts */
    /**
     * Checks all properties
     */
    class FullMatchDistinctOp extends MemOperation {
        pipe(array) {
            return Promise.resolve(array.filter((item, index, arr) => {
                return arr.findIndex((a) => {
                    if (a == null)
                        return false;
                    for (let i in a) {
                        if (item[i] !== a[i])
                            return false;
                    }
                    return true;
                }) === index;
            }));
        }
    }
    /**
     * Checks  only equality of references
     */
    class ReferenceDistinctOp extends MemOperation {
        pipe(array) {
            return Promise.resolve(array.filter((item, index, arr) => {
                return arr.findIndex((a) => a === item) === index;
            }));
        }
    }
    /**
     * Checks only selected properties
     */
    class OneProperyDistinctOp extends MemOperation {
        constructor(properties) {
            super();
            this.properties = properties;
        }
        pipe(array) {
            return Promise.resolve(array.filter((item, index, arr) => {
                return arr.findIndex((a) => {
                    if (a == null)
                        return false;
                    return this.properties.every((prop) => {
                        return item[prop] === a[prop];
                    });
                }) === index;
            }));
        }
    }
    class Distincs {
    }
    /**
    * Checks all properties
    */
    Distincs.fullMatch = new FullMatchDistinctOp();
    /**
     * Checks  only equality of references
     */
    Distincs.referenceMatch = new ReferenceDistinctOp();
    /**
     * Checks only selected properties
     */
    Distincs.propertyMatch = function (...properties) {
        let props = properties.length === 0 && Array.isArray(properties[0]) ? properties[0] : properties;
        return new OneProperyDistinctOp(props);
    };
    exports.Distincs = Distincs;
    /**
     * Distinct model
     * @param algorithm
     */
    function distinct(algorithm = Distincs.referenceMatch) {
        if (typeof algorithm === "string")
            return Distincs.propertyMatch(algorithm);
        if (Array.isArray(algorithm))
            return Distincs.propertyMatch.apply(null, algorithm);
        return algorithm;
    }
    exports.distinct = distinct;
    /**
     * Checks all properties
     */
    function fullDistinct() {
        return Distincs.fullMatch;
    }
    exports.fullDistinct = fullDistinct;
    class NotNullOp extends MemOperation {
        pipe(array) {
            return Promise.resolve(array.filter(x => x != null));
        }
    }
    function notNull() {
        return new NotNullOp();
    }
    exports.notNull = notNull;
    class MapOp extends MemOperation {
        constructor(mapFn) {
            super();
            this.mapFn = mapFn;
        }
        pipe(array) {
            return Promise.resolve(array.map(this.mapFn));
        }
    }
    /**
        * Returns the elements of an array that meet the condition specified in a callback function.
     * @param mapFn
     */
    function map(mapFn) {
        return new MapOp(mapFn);
    }
    exports.map = map;
});
define("trackingmemset", ["require", "exports", "core", "expressions", "memarrayvisitor"], function (require, exports, core_2, expressions_7, memarrayvisitor_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TrackingMemset extends memarrayvisitor_3.MemSet {
        constructor(memset) {
            super(memset["source"], memset.getExpressions());
            this.memset = memset;
            this.trackingId = memset.trackingId;
        }
        trackObject(index, object) {
            let element = (Array.isArray(this.source) ? this.source : [this.source])[index];
            let newResult = {
                test: 'timeout'
            };
            for (let i in object) {
                let _value = object[i];
                core_2.Utility.ObjectDefineProperty(newResult, i, {
                    get: function () {
                        return _value;
                    },
                    set: function (newValue) {
                        _value = newValue;
                        element[i] = newValue;
                    },
                    configurable: true,
                    enumerable: true
                });
            }
            Object.getOwnPropertySymbols(object).forEach((prop) => {
                newResult[prop] = object[prop];
            });
            return newResult;
        }
        query(...expressions) {
            return new TrackingMemset(this.memset.query.apply(this.memset, expressions));
        }
        then(callback, errorCallback) {
            return this.memset.then.apply(this.memset, arguments);
        }
        add(value) {
            return this.memset.add.apply(this.memset, arguments);
        }
        update(value) {
            return this.memset.update.apply(this.memset, arguments);
        }
        delete(value) {
            return this.memset.delete.apply(this.memset, arguments);
        }
        selectTrackId(expressionsArr) {
            let expressions = [].concat(expressionsArr);
            let indexOfLast = expressions.lastIndexOf(x => x instanceof expressions_7.Select);
            if (indexOfLast < 0) {
                return expressions; // gets all
            }
            expressions[indexOfLast] = new expressions_7.Select([].concat(expressions[indexOfLast].args, {
                property: new expressions_7.Property(this.trackingId)
            }));
            return expressions;
        }
        get(...expressions) {
            expressions = this.selectTrackId(expressions);
            return this.memset.get.apply(this.memset, expressions).then((response) => {
                if (typeof response === "number")
                    return response;
                return (Array.isArray(response) ? response : [response]).map(x => {
                    let indexOfItem = (Array.isArray(this.source) ? this.source : [this.source]).findIndex(a => a[this.trackingId] === x[this.trackingId]);
                    if (indexOfItem < 0)
                        return x;
                    let result = this.trackObject(indexOfItem, x);
                    return result;
                });
            });
        }
    }
    exports.TrackingMemset = TrackingMemset;
});
define("pointset", ["require", "exports", "memarrayvisitor", "dataset", "memoperation"], function (require, exports, memarrayvisitor_4, dataset_8, memoperation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Ne kadar Expression eklenirse eklenirsin WhenMemorized kısmı sonra çalışır.  Pipesetde ise MemOperationdan sonra işlemler memory üzerinden gerçekleşir.
     */
    class Pointset extends dataset_8.DataSet {
        constructor(datasource, expressions = [], memOperations = []) {
            super(expressions);
            this.datasource = datasource;
            this.memOperations = memOperations;
        }
        getExpressions() {
            return this.expressions.map(x => x);
        }
        static insureAsPromise(value) {
            return value instanceof Promise ? value : Promise.resolve(value);
        }
        /**
         * Hafıza alındığında yapılacak işlemler.
         * @param expressions MemOperation ya da expressions
         */
        whenMemorized(...expressions) {
            this.memOperations = this.memOperations.concat(expressions);
            return this;
        }
        applyMemOps(ops, response) {
            if (!Array.isArray(response) || ops.length === 0)
                return Pointset.insureAsPromise(response);
            let operations = [].concat(ops);
            let pipe = operations.pop();
            if (typeof pipe === "function") {
                return Pointset.insureAsPromise(pipe(response)).then((response) => {
                    return this.applyMemOps(operations, response).then((resp) => {
                        return resp;
                    });
                });
            }
            if (pipe instanceof memoperation_1.MemOperation)
                return Pointset.insureAsPromise(pipe.pipe(response)).then((response) => {
                    return this.applyMemOps(operations, response).then((resp) => {
                        return resp;
                    });
                });
            //expression da olabilir.
            return new memarrayvisitor_4.MemSet(response, [pipe]).then((resp) => {
                return resp;
            });
        }
        withOwnExpressions(expressions) {
            let exps = expressions || [];
            if (this.expressions == null)
                return exps.concat();
            if (!Array.isArray(this.expressions)) {
                throw new Error('expressions are not support');
            }
            return this.expressions.concat.apply(this.expressions, exps);
        }
        get(...expressions) {
            let exps = this.withOwnExpressions(expressions);
            return this.datasource.get.apply(this.datasource, exps)
                .then((response) => {
                return this.applyMemOps(this.memOperations, response);
            });
        }
        add(element) {
            return this.datasource.add(element);
        }
        delete(element) {
            return this.datasource.delete(element);
        }
        update(element) {
            return this.datasource.update(element);
        }
        query(...expressions) {
            return new Pointset(this.datasource, this.withOwnExpressions(expressions), this.memOperations.map(x => x));
        }
    }
    exports.Pointset = Pointset;
});
define("pipeset", ["require", "exports", "memarrayvisitor", "dataset", "memoperation"], function (require, exports, memarrayvisitor_5, dataset_9, memoperation_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
     */
    class Pipeset extends dataset_9.DataSet {
        constructor(source, expressions = []) {
            super(expressions);
            this.source = source;
        }
        query(...expression) {
            return new Pipeset(this.source, [].concat(this.expressions).concat(expression));
        }
        getExpressions() {
            return this.expressions.filter(this.notPipeQuery);
        }
        notPipeQuery(item) {
            return !((item instanceof memoperation_2.MemOperation) || typeof item === "function");
        }
        isPipeQuery(item) {
            return ((item instanceof memoperation_2.MemOperation) || typeof item === "function");
        }
        splitExpressionsByPipeQuery(expressions) {
            let indexOfItem = expressions.findIndex(this.isPipeQuery);
            if (indexOfItem < 0)
                return {
                    left: expressions,
                    pipeQuery: null,
                    right: []
                };
            let left = expressions.slice(0, indexOfItem);
            let pipeQuery = expressions[indexOfItem];
            let right = expressions.slice(indexOfItem + 1, expressions.length);
            return {
                left,
                pipeQuery,
                right
            };
        }
        add(item) {
            return this.source.add(item);
        }
        update(item) {
            return this.source.update(item);
        }
        delete(item) {
            return this.source.delete(item);
        }
        isFunction(funcable) {
            return typeof funcable === "function";
        }
        get(...expression) {
            let getResultFromPipesAsPromise = function (pipes, value) {
                let pArray = [].concat(Array.isArray(pipes) ? pipes : [pipes]).filter(fn => typeof fn === "function");
                let valuePromise = (value instanceof Promise) ? value : Promise.resolve(value);
                if (pArray.length === 0)
                    return valuePromise;
                return valuePromise.then((v) => {
                    let pipefunc = pArray.pop();
                    let funcResult = pipefunc(v);
                    return getResultFromPipesAsPromise(pArray, funcResult);
                });
            };
            let expressions = this.splitExpressionsByPipeQuery([].concat(this.expressions).concat(expression));
            return this.source.query.apply(this.source, expressions.left).then((r) => {
                if (expressions.pipeQuery == null)
                    return r;
                if (expressions.right.length === 0)
                    return r;
                let pipeResult = !this.isFunction(expressions.pipeQuery) ?
                    expressions.pipeQuery.pipe(r)
                    : expressions.pipeQuery(r);
                if (pipeResult instanceof Promise) {
                    return pipeResult.then((response) => {
                        return new Pipeset(new memarrayvisitor_5.MemSet(response, expressions.right)).then((response) => {
                            return response;
                        });
                    });
                }
                return new Pipeset(new memarrayvisitor_5.MemSet(pipeResult, expressions.right)).then((response) => {
                    return response;
                });
            });
        }
    }
    exports.Pipeset = Pipeset;
});
define("operations", ["require", "exports", "trackingmemset", "changeset", "pointset", "mapset", "schema", "memarrayvisitor", "odata", "expressions", "dataset", "cacheset", "branchset", "pipeset"], function (require, exports, trackingmemset_1, changeset_1, pointset_1, mapset_1, schema_5, memarrayvisitor_6, odata_2, expressions_8, dataset_10, cacheset_1, branchset_1, pipeset_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EqBinaryExtend extends expressions_8.EqBinary {
        constructor(eqBinary) {
            super(eqBinary.left, eqBinary.op, eqBinary.right);
        }
        create(op, value) {
            let v = value;
            if (expressions_8.Value.isValid(value)) {
                v = new expressions_8.Value(value);
            }
            return new EqBinaryExtend(new expressions_8.EqBinary(this, new expressions_8.Operation(op), v));
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
    class ModelMethodExtend extends expressions_8.ModelMethod {
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
        return new odata_2.ODataSet(options);
    };
    const method = function (name, ...properties) {
        let props = [];
        properties.forEach((elem) => {
            if (expressions_8.Value.isValid(elem))
                props.push(new expressions_8.Value(elem));
            else
                props.push(elem);
        });
        return new ModelMethodExtend(name, this, props);
    };
    class PropertyExtend extends expressions_8.Property {
        create(op, value) {
            let v = value;
            if (!(value instanceof expressions_8.Property)) {
                v = new expressions_8.Value(value);
            }
            return new EqBinaryExtend(new expressions_8.EqBinary(this, new expressions_8.Operation(op), v));
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
    class SelectManyExtend extends expressions_8.SelectMany {
        constructor(name, property) {
            super(name, property);
        }
        create(op, value) {
            let v = value;
            if (expressions_8.Value.isValid(value))
                v = new expressions_8.Value(value);
            return new EqBinaryExtend(new expressions_8.EqBinary(this, new expressions_8.Operation(op), v));
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
    class CountExtend extends expressions_8.Count {
        create(op, value) {
            let v = value;
            if (expressions_8.Value.isValid(value))
                v = new expressions_8.Value(value);
            return new EqBinaryExtend(new expressions_8.EqBinary(this, new expressions_8.Operation(op), v));
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
    class RootExtend extends expressions_8.Root {
        create(op, value) {
            let v = value;
            if (!(value instanceof expressions_8.Root)) {
                v = new expressions_8.Value(value);
            }
            return new EqBinaryExtend(new expressions_8.EqBinary(this, new expressions_8.Operation(op), v));
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
    class ItExtend extends expressions_8.It {
        constructor() {
            super();
        }
        create(op, value) {
            let v = value;
            if (!(value instanceof expressions_8.Root)) {
                v = new expressions_8.Value(value);
            }
            return new EqBinaryExtend(new expressions_8.EqBinary(this, new expressions_8.Operation(op), v));
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
        return new expressions_8.Count(null);
    }
    exports.count = count;
    function o(left, op, right) {
        let opValue = op;
        let leftValue = left;
        if (typeof op === "string")
            opValue = new expressions_8.Operation(op);
        if (typeof left === "string")
            leftValue = new expressions_8.Property(left);
        let r = right;
        if (expressions_8.Value.isValid(right))
            r = new expressions_8.Value(right);
        return new EqBinaryExtend(new expressions_8.EqBinary(leftValue, opValue, r));
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
        return new expressions_8.Filter(expression);
    }
    exports.filter = filter;
    function select(...args) {
        let results = [];
        let appendAsString = function () {
            args.forEach(function (arg) {
                results.push({
                    property: arg instanceof expressions_8.Property ? arg : prop(arg)
                });
            });
        };
        let singleProperty = function () {
            results.push({
                property: args[0] instanceof expressions_8.Property ? args[0] : prop(args[0]),
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
                let isProperty = item instanceof expressions_8.Property;
                return !(isString || isProperty);
            });
            if (indexOfNonString >= 0) {
                throw new Error('argument index of ' + indexOfNonString + " is not property");
            }
            appendAsString();
        }
        return new expressions_8.Select(results);
    }
    exports.select = select;
    function top(value) {
        return new expressions_8.Top(value);
    }
    exports.top = top;
    function skip(value) {
        return new expressions_8.Skip(value);
    }
    exports.skip = skip;
    function value(value) {
        return new expressions_8.Value(value);
    }
    exports.value = value;
    function it() {
        return new ItExtend();
    }
    exports.it = it;
    class FindExtend extends expressions_8.Find {
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
        if (!(propem instanceof expressions_8.Property))
            throw new Error('order :property is not valid');
        if (type == null)
            return new expressions_8.Order(propem);
        let validTypes = ["asc", "desc"];
        if (!validTypes.some(x => x == type)) {
            throw new Error('order: type is not valid');
        }
        return new expressions_8.Order(propem, type);
    }
    exports.order = order;
    function orderDesc(propery) {
        return order(propery, 'desc');
    }
    exports.orderDesc = orderDesc;
    function expand(property, ...expression) {
        let prop = property;
        if (typeof property == "string")
            prop = new expressions_8.Property(property);
        if (!(prop instanceof expressions_8.Property))
            throw new Error("property is not valid");
        return new expressions_8.Expand([{
                property: prop,
                expressions: expression
            }]);
    }
    exports.expand = expand;
    function inlineCount() {
        return new expressions_8.InlineCount();
    }
    exports.inlineCount = inlineCount;
    function find(value) {
        return new FindExtend(value);
    }
    exports.find = find;
    class GlobalExtend {
        get maxdatetime() {
            return new expressions_8.GlobalMethod("maxdatetime");
        }
        get mindatetime() {
            return new expressions_8.GlobalMethod("mindatetime");
        }
        get now() {
            return new expressions_8.GlobalMethod("now");
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
        return new memarrayvisitor_6.MemSet(r, baseFilter);
    }
    exports.memset = memset;
    /**
     * creates new Guid
     * @param {String} raw
     * @returns {Guid}
     */
    function guid(raw) {
        if (raw instanceof schema_5.Guid)
            return raw;
        return new schema_5.Guid(raw);
    }
    exports.guid = guid;
    function action(name, ...params) {
        let args = [];
        params.forEach((param) => {
            if (param instanceof expressions_8.Value) {
                args.push(param);
                return true;
            }
            args.push(new expressions_8.Value(param));
            return true;
        });
        return new expressions_8.Action(name, args);
    }
    exports.action = action;
    function func(name, ...params) {
        let args = [];
        params.forEach((param) => {
            if (param instanceof expressions_8.Value) {
                args.push(param);
                return true;
            }
            args.push(new expressions_8.Value(param));
            return true;
        });
        return new expressions_8.Func(name, args);
    }
    exports.func = func;
    /**
     *
     * DecorateSet
     * @param source source dataset for processing
     * @param observer operations on source
     */
    function dataset(source, observer) {
        return new dataset_10.DecorateSet(source, observer);
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
                let anyFirst = exp.find(a => a instanceof expressions_8.Find);
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
});
//import { select, filter, prop, order, expand } from "./Operations";
/*
class Context {
    customers = new ODataDataSet<any>('url');
    test(): void {
        this.customers.get(
            select('ID', 'Name'),
            filter(prop('ID').lt(5)),
            order('ID'),
            expand('Orders',select('ID')))
            .then((response) => {
               
            });
         this.customers.add({}).then(() => {

        });
    }
}
*/ 
