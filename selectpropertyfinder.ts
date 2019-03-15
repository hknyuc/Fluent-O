import { ExpressionVisitor, Filter, Order, Property, EqBinary, Select, SelectMany, Method, ModelMethod, Expand } from './expressions';
export class SelectPropertyFinder extends ExpressionVisitor {
    properties: Array<Property> = [];
    filter(filter: Filter) {
        this.visit(filter.expression);
    }

    private addProperty(property: Property) {
        if([null,''].some((a)=>property.name == a)) return;
        this.properties.push(property);
    }

    getAsExpressions() {
        let getExpand = function (property: Property) {
            let allProps = [];
            let p = property;
            while (p != null) {
                allProps.push(p.name);
                p = p.parent;
            }
            allProps.reverse();
            return new Expand([{
                property: new Property(allProps[0]),
                expressions: [new Select(allProps.splice(1, allProps.length).map(a => {
                    return {
                        property: a,
                    }
                }))]
            }]);
        }
        let expands = this.properties.filter(x => x.parent != null);
        return [].concat(expands.map(getExpand)).concat([new Select(this.properties.filter(x => x.parent == null).map(a => {
            return {
                property: a,
                expressions: []
            }
        }))]);


    }

    order(order: Order) {
        this.addProperty(order.property);
    }

    eqBinary(binary: EqBinary) {
        this.visit(binary.left);
        this.visit(binary.op);
        this.visit(binary.right);
    }

    property(propery: Property) {
        this.addProperty(propery);
    }

    selectMany(selectManay: SelectMany) {
        this.addProperty(new Property(selectManay.name, selectManay.parent));
    }

    modelMethod(method: ModelMethod) {
        method.args.forEach((i) => {
            this.addProperty(i)
        });
    }
}