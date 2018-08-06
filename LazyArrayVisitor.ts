import { ExpressionVisitor, Select, SelectMany, Order, Property, ModelMethod, Value, Expand, Skip, Find, Count, EqBinary, Operation, RefExpression, Root, Filter, It, GlobalMethod } from "./Expressions";
import { DataSet } from './Context';

export class LazyArrayVisitor extends ExpressionVisitor {
    private source: any;
    public result: any;
    private rootValue: any;
    constructor(array: any, root: any) {
        super();
        this.source = array;
        this.result = [];
        this.rootValue = root;
    }
    private getSource() {
        if (this.source instanceof Promise) return this.source;
        return Promise.resolve(this.source);
    }

    select(select: Select) {
        return this.getSource().then((source) => {
            let fn = (source,result,property)=>{
                let baseValue = this.__getNestedProperty(source,property);
                /*
                if(baseValue instanceof DataSet){
                    this.__createNestedProperty(result, property)
                    .set({});
                }
                */
        
                if(baseValue instanceof Promise){
                    return baseValue.then((response)=>{
                        this.__createNestedProperty(result, property).set(response);
                    })
                }
               return Promise.resolve( this.__createNestedProperty(result,property)
                .set(this.__getNestedProperty(source, property)));
            };
            let allPromise = [];
            if (Array.isArray(source)) {
                let newResult = [];
                source.forEach(element => {
                    let result = {} as any;
                    newResult.push(result);
                    let args = select.args.length == 0?Object.keys(element).map(x=> {
                        return {
                            property:new Property(x),
                            expression:null
                        }
                    }):select.args;
                    args.forEach(arg => {
                        allPromise.push(fn(element,result,arg.property));
                    });
                });
                return Promise.all(allPromise).then(()=>newResult);
            } 
            //object
            let result = {};
            let args = select.args.length == 0?Object.keys(result).map(x=> {
                return {
                    property:new Property(x),
                    expression:null
                }
            }):select.args;
            args.forEach((arg) => {
                allPromise.push(fn(source,result,arg.property))
            });
            return Promise.all(allPromise).then(()=>result);
        });
    }

    filter(filter: Filter) {
        return this.getSource().then((source) => {
            let result = [];
            let allPromise = [];
            source.forEach(element => {
                let visitor = this.createMemVisitor(element);
                allPromise.push(visitor.visit(filter.expression).then(x => {
                    if (x === true)
                        result.push(element);
                }))
            });
            return Promise.all(allPromise).then(() => {
                this.result = result;
                return this.result;
            });
        });
    }

    _selectManyArray(selectMany: SelectMany, source: Array<any>) {
        let fn = (s)=>{
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
        }
        if (selectMany.parent != null) {
            let visitor = this.createMemVisitor(source);
           return  visitor.visit(selectMany.parent).then((result)=>{
                if (!Array.isArray(result)) return result;
                return fn(result);
            });
        }

        return Promise.resolve(fn(source));

      
    }
    _selectManyObject(selectMany: SelectMany, source: Object) {
        let fn = (s)=>{
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
                if (i === selectMany.name) return s[i];
            }
        }
        if (selectMany.parent != null) {
            let visitor = this.createMemVisitor(source);
           return visitor.visit(selectMany.parent).then((result)=>fn(result))
        }

        return Promise.resolve(fn(source));
      
       // throw new Error(selectMany.name + " is not found in object");
    }

    selectMany(selectMany: SelectMany) {
        return this.getSource().then((source) => {
            if (Array.isArray(source))
                return this._selectManyArray(selectMany, source);
            return  this._selectManyObject(selectMany, source);
        });
    }

    skip(skip: Skip) {
        return this.getSource().then((source) => {
           return source.slice(skip.value, source.length);
        });
    }

    top(top: Value) {
        return this.getSource().then((source) => {
           return source.slice(0, top.value);
        });
    }

    find(find: Find) {
        return this.getSource().then((source) => {
            let value = find.value;
            let result;
            if (typeof value !== "object") {
                result = source.find((x => x.id === find.value || x.ID === find.value || x.Id === find.value));
            }
            else {
                let firstValueofObject = null;
                for (let i in find.value) {
                    firstValueofObject = { name: i, value: find.value[i] }
                    break;
                }
                result = source.find((x => x[firstValueofObject.name] == firstValueofObject.value));
            }
            let visitor = this.createMemVisitor(result);
            if (find.expression != null) {
                return visitor.visit(find.expression);
            }
            return result;
        });
    }
    createMemVisitor(source: any): LazyArrayVisitor {
        return new LazyArrayVisitor(source, this.rootValue);
    }

    count(count: Count) {
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

    expendProperties(source, properties: Array<Property>) {
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

    order(order: Order) {
        return this.getSource().then((source) => {
            if (!Array.isArray(source)) throw new Error("order: order support only array");
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

    property(property: Property) {
        return this.getSource().then((source) => {
            return this.__getNestedProperty(source, property);
        });
    }

    __createNestedProperty(source, property: Property) {
        if (source == null) return null;
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
                        if (current[props[i]] == null) throw new Error(props[i] + " is undefined for set in model");
                        current[props[i]] = value;
                    }

                    current = current[props[i]];
                }
            }
        }
    }

    __getNestedProperty(source, property: Property) {
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
                throw new Error("source is null for getting " + name + " property");
            }
            current = current[name];
        });
        return current;
    }

    it(it: It) {
        return this.getSource();
    }

    getModelMethod() {
        let stringFuncs = {
            contains: function (value) {
                return this.context.indexOf(value) >= 0;
            },
            endswith: function (value: string) {
                return this.context.endsWith(value);
            },
            indexof: function (value: string) {
                return this.context.indexOf(value);
            },
            length: function () {
                return this.context.length;
            },
            startswith: function (value: string) {
                return this.context.startsWith(value);
            },
            substring: function (start: any, end?: any) {
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
        }

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
        }

        return {
            string: stringFuncs,
            date: dateFuncs
        }
    }

    globalMethod(globalMethod: GlobalMethod) {
        return this.getSource().then((source) => {
            let methods = {
                maxdatetime: function () {
                    return new Date(8640000000000000);
                },
                mindatetime: function () {
                    return new Date(-8640000000000000)
                },
                now: function () {
                    return new Date(Date.now());
                },
                ceiling: function (value) {
                    return Math.ceil(value);
                },
                floor: function (x: number) {
                    return Math.floor(x);
                },
                round: function (x: number) {
                    return Math.round(x);
                }
            }
            if (methods[globalMethod.name] == null) throw new Error(globalMethod.name + " is not exists in global method");
            let props = [];
            globalMethod.args.forEach((elem) => {
                let visitor = this.createMemVisitor(source);
                props.push(visitor.visit(elem))
            })
            return Promise.all(props).then(() => {
                return methods[globalMethod.name].apply(null, props)
            });
        });
    }

    modelMethod(modelMethod: ModelMethod) {
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
                        value[modelMethod.name].apply(value, props);
                    }
                    if (value == null) return null;
                    if (value[modelMethod.name] == null) {
                        return null;
                        throw new Error(modelMethod.name + " method not found in context");
                    }
                    return value[modelMethod.name].apply(value, props);
                });
            });
        });
    }

    value(value: Value) {
        if(value.value instanceof Promise) return value.value;
        return Promise.resolve(value.value);
    }

    private applyExpressions(expressions,value):Promise<any>{
        if(expressions.length === 0) return Promise.resolve(value);
        let cloneExpression = expressions.map(x=>x).reverse();
        let expesssion = cloneExpression.pop();
        return this.createMemVisitor(value).visit(expesssion).then((response)=>this.applyExpressions(cloneExpression,response));
    }

    expand(expand: Expand) {
        return this.getSource().then((source) => {
            let all =[];
            let sourceIsArray = Array.isArray(source);
            source = sourceIsArray?source:[source];
            let newSource =  source.map(x=>Object.assign({},x));
            source.forEach((element,index) => {
                let allExpands = [];
                let applierElement = newSource[index];
                expand.args.forEach((arg) => {
                    let oldValue = this.__getNestedProperty(applierElement, arg.property);
                    let baseValue = this.__getNestedProperty(element,arg.property);
                    let applier = this.__createNestedProperty(applierElement, arg.property);
                    if (baseValue instanceof DataSet) {
                        allExpands.push(baseValue.get.apply(baseValue, arg.expressions).then((response) => {
                            applier.set(response);
                            return response;
                        }));
                        return true;
                    }  
                    if (baseValue instanceof Promise) {
                        allExpands.push(baseValue.then((response) => {
                            return this.applyExpressions(arg.expressions,response).then((response)=>{
                                applier.set(response);
                            });
                        }));
                        return true;
                    }

                    if (arg.expressions != null && arg.expressions.length != 0) {
                        allExpands.push(this.applyExpressions(arg.expressions,oldValue).then((response)=>{
                            applier.set(response);
                            return response;
                        }))
                      return true;
                    } 
                    allExpands.push(Promise.resolve(applier.set(oldValue)));
                    return true;
                });
                all.push(Promise.all(allExpands));
            });
            return Promise.all(all).then(()=>sourceIsArray?newSource:newSource[0]);
        });
    }

    operation(operation: Operation) {

    }

    eqBinary(eqBinary: EqBinary) {
        return this.getSource().then((source)=>{
        let leftVisitor = this.createMemVisitor(source);
        let rightVisitor = this.createMemVisitor(source);
        let all = [];
        all.push(leftVisitor.visit(eqBinary.left));
        all.push(rightVisitor.visit(eqBinary.right));
        return  Promise.all(all).then((items)=>{
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

    root(root: Root) {
        return Promise.resolve(this.rootValue);
    }

    refExpression(refExpression: RefExpression) {
       return this.getSource().then((source)=>this.createMemVisitor(source).visit(refExpression.expression).then((result)=>{
            if (refExpression.next != null) {
                let visitorNext = this.createMemVisitor(result);
                return visitorNext.visit(refExpression.next);
            }
            return result;
        }));
    }
}
