import { RestClient } from './RestClient';
import { DataSet } from './Context';
import { Guid } from './Schema';

import { ExpressionVisitor, Operation, Method, Expand, Value, InlineCount, Order, Skip, ModelMethod, Property, EqBinary, RefExpression, Select, Top, Filter, Count, Find, SelectMany, This, Root, DataSource, It } from './Expressions';
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
            this.set(parentVisitor.result +'/'+ selectMany.name);
            return;
        }
        else this.set("/"+selectMany.name);
    }

    count(count: Count): void {
        if(count.expression != null){
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
         if(right.indexOf('/') === 0)
           right = right.substring(1,right.length);
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
        else if(type === "boolean")
            r = v?"true":"false";
        else if (type === "string")
            r = "'" + v + "'";
        else if (type === "number")
            r = v;
        else if (v instanceof Date)
            r = v.toISOString();
        else if (v instanceof Guid)
            r = "g'" + v.toString() + "'";
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
            this.set(visitor.result + "." + property.name);
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
        this.set(leftVisitor.result + " " + eqBinary.op.type + " " + rightVisitor.result);
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
            return new Filter(new EqBinary(f.expression, new Operation('or'), filter.expression));
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

export class ODataSet<T> implements DataSet<T> {
    constructor(private options:{url:string,http?:RestClient,arrayable?:boolean}) {

    }
    get(...expressions: any[]): Promise<any> {
        let result =  this.createHttp().get(this.options.url + QuerySet.get.apply(QuerySet,arguments));
        if(this.options.arrayable == null || this.options.arrayable === false) return result;
        let anyCount = expressions.some((exp)=> exp instanceof Count);
        if(anyCount){
            return result.then((response)=>{
                return response.json()["@odata.count"];
            });
        }else{
            return result.then((response)=>{
                let r = response.json();
                let isArray = function(){
                    for(let i in r){
                        if(!(i.startsWith("@odata") || i === "value")) return false;
                    }
                    return r["value"] != null && Array.isArray(r["value"]);
                }
                if(isArray){
                    return r.value;
                }
                return r;
            });
        }
    }
    add(element: T): Promise<any> {
        return this.createHttp().post(this.options.url, element);
    }
    delete(element: T): Promise<any> {
        return this.createHttp().delete(this.options.url, element);
    }
    update(element: T): Promise<any> {
        return this.createHttp().put(this.options.url, element);
    }


    private createHttp(): RestClient {
        if(this.options.http != null) return this.options.http;
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
            return "?"+right.join('&');
        if (left.length != 0 && right.length != 0)
            return left.join('') +"?" + right.join('&');
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


