import { RestClient } from './RestClient';
import { DataSet } from './Context';
import { Guid } from './Schema';

import { ExpressionVisitor, Operation, Method, Expand, Value, InlineCount, Order, Skip, ModelMethod, Property, EqBinary, RefExpression, Select, Top, Filter, Count, Find, SelectMany, This, Root, DataSource, It, Action, Func } from './Expressions';
import { Http } from './Http';
export class ODataVisitor extends ExpressionVisitor {
    private _result: string = null;

    get visited() {
        return this._result != null;
    }

    get result(): string {
        return this._result;
    }

    private set(raw: string) {
        this._result = raw;
    }

    method(method: Method): void {
        // console.log(method["prototype"]["consructor"]["name"]);
    }

    action(action:Action):void{
        let result = "/"+action.name;
        let params = [];
        action.parameters.forEach((param)=>{
            let visitor = new ODataVisitor();
            visitor.visit(visitor.result);
            params.push(param);
        })
        if(params.length != 0)
           result += "("+ params.join(',') +")";
        this.set(result);
    }

    func(func:Func):void{
        let result = "/"+func.name;
        let params = [];
        func.parameters.forEach((param)=>{
            let visitor = new ODataVisitor();
            visitor.visit(param);
            params.push(visitor.result);
        });
        if(params.length != 0)
          result += "(" + params.join(',') +")";

        this.set(result);
    }

    find(find: Find): void {
        if (find.value == null) throw new Error('find: value could not be null or undefined');
        let getAsStruct = function (value) {
            let visitor = new ODataVisitor();
            visitor.visit(value);
            if (!visitor.visited) throw new Error('find: value is not valid');
            return visitor.result;
        }
        let str = "";
        if (Value.isValid(find.value)) {
            str = getAsStruct(new Value(find.value));
        }
        else {
            let props = [];
            let obj = find.value;
            for (let prop in obj) {
                let value = obj[prop];
                if (Value.isValid(value)) {
                    props.push(prop + "=" + getAsStruct(new Value(value)));
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
        if (!beforeVisitor.visited) throw new Error('find: parent expression could not resolved');
        this.set(beforeVisitor.result + '(' + str + ')');
    }

    selectMany(selectMany: SelectMany): void {
        if (selectMany.parent != null) {
            let parentVisitor = new ODataVisitor();
            parentVisitor.visit(selectMany.parent);
            if (!parentVisitor.visited) throw new Error('selectMany: property is undefined');
            this.set(parentVisitor.result + '/' + selectMany.name);
            return;
        }
        else this.set("/" + selectMany.name);
    }

    count(count: Count): void {
        if (count.expression != null) {
            let visitor = new ODataVisitor();
            visitor.visit(count.expression);
            if (!visitor.visited) throw new Error('count: inner expression could not be resolved');
            this.set(visitor.result + '/$count');
            return;
        }
        this.set('$count=true&$top=0');
    }

    select(select: Select): void {
        let results = [];
        select.args.forEach(function (arg) {
            let propertyVisitor = new ODataVisitor();
            propertyVisitor.visit(arg.property);
            if (!propertyVisitor.visited) throw new Error("selecrt: property invalid :" + JSON.stringify(arg.property));
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

    order(order: Order): void {
        this.set('$orderby=' + order.property.name + (order.type != null ? " " + order.type : ''));
    }

    top(top: Top): void {
        this.set('$top=' + top.value);
    }

    skip(skip: Skip): void {
        this.set("$skip=" + skip.value);
    }

    inlineCount(): void {
        this.set("$inlineCount");
    }

    filter(filter: Filter): void {
        let visitor = new ODataVisitor();
        visitor.visit(filter.expression);
        if (!visitor.visited) throw new Error('filter: expression could not be resolved');
        let right = visitor.result;
        if (right.indexOf('/') === 0)
            right = right.substring(1, right.length);
        this.set("$filter=" + right);
    }

    expand(expand: Expand): void {
        let propertyVisitor = new ODataVisitor();
        let result = expand.args.map(function (arg) {
            propertyVisitor.visit(arg.property);
            if (!propertyVisitor.visited) throw new Error("expand: invalid property :" + JSON.stringify(arg.property));
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


    value(value: Value): void {
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
        else if (v instanceof Guid)
            r = "" + v.toString() + "";
        else if (v instanceof Object){
            let params = [];
            for(let i in v){
                let value = v[i];
                if(!(value instanceof Value))
                    value = new Value(value);
                let visitor = new ODataVisitor();
                visitor.visit(value);
                params.push(i+"="+visitor.result);
            }
            r = params.join(',');
        }
        this.set(r);
    }

    modelMethod(value: ModelMethod): void {
        let propertyVisitor = new ODataVisitor();
        propertyVisitor.visit(value.property);
        if (!propertyVisitor.visited) throw new Error('modelMethod: property could not be resolved');
        if (value.args.length == 0) {
            this.set(value.name + "(" + propertyVisitor.result + ")");
            return;
        }
        let argsArray = [];
        value.args.forEach(function (arg, index) {
            let argsVisitor = new ODataVisitor();
            argsVisitor.visit(arg);
            if (!argsVisitor.visited) throw new Error('modelMethod: argument index of ' + index + ' could not be resolved');
            argsArray.push(argsVisitor.result);

        });
        this.set(value.name + "(" + propertyVisitor.result + "," + argsArray.join(',') + ")");
    }

    property(property: Property): void {
        if (property.parent != null) {
            let visitor = new ODataVisitor();
            visitor.visit(property.parent);
            if (!visitor.visited) throw new Error('property : expression could not be resolved');
            this.set(visitor.result + "/" + property.name);
            return;
        }
        this.set(property.name);
    }

    eqBinary(eqBinary: EqBinary): void {
        let leftVisitor = new ODataVisitor();
        leftVisitor.visit(eqBinary.left);
        if (!leftVisitor.visited) throw new Error('eqBinary: left expression could not be resolved');
        let rightVisitor = new ODataVisitor();
        rightVisitor.visit(eqBinary.right);
        if (!rightVisitor.visited) throw new Error('eqBinary: right expression could not be resolved');
        this.set("("+leftVisitor.result + " " + eqBinary.op.type + " " + rightVisitor.result+")");
    }

    it(it: It): void {
        this.set('$it');
    }

    this($this: This): void {
        this.set('$this');
    }

    root(root: Root): void {
        this.set('$root');
    }
}


/**
 * Combines expression as one
 */
export class ODataCombineVisitor extends ExpressionVisitor {
    private expressions = [];
    get result(): Array<any> {
        let result = this.expressions.map(function (elem) {
            return elem.value;
        });
        return result;
    }

    action(action){
        this.set('action',()=>action,()=>action);
    }

    func(func){
        this.set('func',()=>func,()=>func);
    }

    private distinct(arr: Array<any>): Array<any> {
        return arr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }

    set(key: string, empy: () => any, nonEmpty: (elem) => void): void {
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

    push(value: any): void {
        this.expressions.push({
            key: Guid.new().toString(),
            value: value
        });
    }



    select(select: Select): void {
        let self = this;
        this.set('select',
            () => new Select([].concat(select.args)),
            (item) => new Select(self.distinct(item.args.concat(select.args))));
    }

    count(count: Count): void {
        this.set('count', () => count, () => count);
    }

    top(top: Top): void {
        this.set('top', () => top, () => top);
    }

    skip(skip: Skip): void {
        this.set('skip', () => skip, () => skip);
    }

    it(it): void {
        this.push(it);
    }

    this($this: This): void {
        this.push($this);
    }

    root(root): void {
        this.push(root);
    }

    order(order: Order): void {
        this.set('order', () => order, () => order);
    }

    inlineCount(inlineCount: InlineCount): void {
        this.set('inlineCount', () => inlineCount, () => inlineCount);
    }

    expand(expand: Expand): void {
        this.set('expand', () => expand, (elem: Expand) => {
            let args = elem.args.concat(expand.args);
            return new Expand(args)
        });
    }

    filter(filter: Filter): void {
        this.set("filter", () => filter, (f: Filter) => {
               if(f.expression == null) return new Filter(filter.expression);
            return new Filter(new EqBinary(f.expression, new Operation('and'), filter.expression));
        });
    }

    selectMany(selectMany: SelectMany): void {
        this.push(selectMany);
    }

    operation(op: Operation): void {
        this.push(op);
    }

    find(find: Find): void {
        this.push(find);
    }



    method(method: Method): void {
        this.push(method);
    }
    value(value: Value): void {
        this.push(value);
    }

    modelMethod(value: ModelMethod): void {
        this.push(value);
    }

    property(property: Property): void {
        this.property(property);
    }

    eqBinary(eqBinary: EqBinary): void {
        this.push(eqBinary);
    }

    refExpression(refExpression: RefExpression): void {
        this.push(refExpression);
    }
}

export function idselector(ids: Array<string>) {
    return {
        apply: function (value) {
            for (let i in value) {
                if (ids.some((elem) => elem === i)) return value[i];
            }
            return null;
        }
    }
}

export class ODataSet<T> implements DataSet<T> {

    constructor(private options: { url: string, http?: RestClient, arrayable?: boolean, expressions?: Array<any>, primary: { type: Object, name: string } }) {

    }

    query(...expressions: any[]): DataSet<T> {
      
        
        let newOptions = {
            url: this.options.url,
            http: this.options.http,
            arrayable: this.options.arrayable,
            expressions:this.appylExpression(expressions),
            primary: this.options.primary
        }
        return new ODataSet(newOptions);
    }

    toString(){
      return QuerySet.get.apply(null,this.options.expressions);
    }

    private appylExpression(expressions:Array<any>){
        let optExpressions = this.options.expressions || [];
        if(expressions[0] instanceof Find){ // filter after find. filter is not necassary
           optExpressions = optExpressions.filter(x=>!(x instanceof Filter));
        };
       return Array.isArray(optExpressions) ? optExpressions.map(x=>x).concat(expressions) : expressions.map(x=>x);
    }

    get(...expressions: any[]): Promise<any> {
        let optExpressions = this.appylExpression(expressions);
        let result = this.createHttp().get(this.options.url + QuerySet.get.apply(QuerySet, optExpressions));
        if (this.options.arrayable == null || this.options.arrayable === false) return result;
        let anyCount = optExpressions.some((exp) => exp instanceof Count);
        if (anyCount) {
            return result.then((response) => {
                return response.json()["@odata.count"];
            });
        } else {
            return result.then((response) => {
                let r = response.json();
                let isArray = function () {
                    for (let i in r) {
                        if (!(i.startsWith("@odata") || i === "value")) return false;
                    }
                    return r["value"] != null && Array.isArray(r["value"]);
                }
                if (isArray()) {
                    return r.value;
                }

                let prune = function (value) {
                    let result = {};
                    for (let i in value) {
                        if (i.startsWith('@odata.')) continue;
                        result[i] = value[i];
                    }
                    return result;
                }
                let result = prune(r);
                let onlyValue = Object.keys(result).length === 1 && result["value"] != null;
                return onlyValue?result["value"]:result;
            });
        }
    }
    __convertObject(value){
       let result = {} as any;
          for(let i in value){
            if(value[i] == null) continue;
            if(this.__isEmptyObject(value[i])) continue;
             result[i] = this.__convert(value[i]);
         }
       return result;
    }

    __isEmptyObject(obj){
        if(obj == null) return true;
        if(Array.isArray(obj) && obj.length == 0) return true;
        if(Array.isArray(obj)) return false;
        for(let i in obj){
            if(obj[i] != null) return false;
            if(this.__isEmptyObject(obj[i])) return true;
        }
        return false;
    }

    __convertArray(values){
        let result = [];
        values.forEach((elem)=>{
              result.push(this.__convert(elem));
        });
        return result;
    }

    __convert(values){
        if(values == null) return null;
        if(values instanceof Guid) return values.value;
        if(values instanceof Date) return  ODataSet.__dateToIsoUTC(values);
       if(Array.isArray(values)) return this.__convertArray(values);
       if(typeof values ==="object") return this.__convertObject(values);
       return values;
    }

    private static __dateToIsoUTC(date:Date){
        let tzo = -date.getTimezoneOffset(),
            dif = tzo >= 0 ? '+' : '-',
            pad = function(num) {
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
    add(element: T): Promise<any> {
        return this.createHttp().post(this.options.url, this.__convert(element));
    }
    delete(element: T): Promise<any> {
        return this.createHttp().delete(this.options.url + this.getPrimaryValue(element));
    }
    update(element: T): Promise<any> {
        return this.createHttp().put(this.options.url + this.getPrimaryValue(element), this.__convert(element));
    }

    private getIdsValue(element){
        let valids = ["id","ID","Id","iD"];
        for(let i in element)
            if(valids.some((elem)=>elem === i)) return element[i];
        return null;
    }

    private getPrimaryValue(element) {
        if (this.options.primary == null) {
            let visitor = new ODataVisitor();
            visitor.visit(new Value(this.getIdsValue(element)));
            return "(" + visitor.result + ")";
        }
        let v = element[this.options.primary.name];
        let type = this.options.primary.type;
        if (type === Guid && typeof v === "string") {
            v = new Guid(v);
        } else if (type === Date && typeof v === "string") {
            v = new Date(v);
        }
        let visitor = new ODataVisitor();
        visitor.visit(new Value(v));
        return "(" + visitor.result + ")";
    }


    private createHttp(): RestClient {
        if (this.options.http != null) return this.options.http;
        return ODataConfig.createHttp();
    }
}

export class QuerySet {
    static get(...expressions: any[]): string {
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
                if (expression instanceof Method)
                    right.push(visitor.result);
                else left.push(visitor.result);
            }
        });
        if (left.length == 0 && right.length != 0)
            return "?" + right.join('&');
        if (left.length != 0 && right.length != 0)
            return left.join('') + "?" + right.join('&');
        if (left.length == 0 && right.length == 0) return "";
        if (left.length != 0 && right.length == 0)
            return left.join('');
        return '';
    }
}

export var entity = function (name) {
    return {
        get: function (...expressions: Array<any>) {
            return {
                asQuery: function () {
                    let result = QuerySet.get.apply(null, expressions);
                    if (result.indexOf('$') == 0)
                        return name + "?" + result;
                    return name + result;
                }
            }
        }
    }
}

export class ODataConfig {
    static createHttp(): RestClient {
        return new Http();
    }
}


