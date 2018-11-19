"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("./../Expressions");
class SelectPropertyFinder extends Expressions_1.ExpressionVisitor {
    constructor() {
        super(...arguments);
        this.properties = [];
    }
    filter(filter) {
        this.visit(filter.expression);
    }
    addProperty(property) {
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
            return new Expressions_1.Expand([{
                    property: new Expressions_1.Property(allProps[0]),
                    expressions: [new Expressions_1.Select(allProps.splice(1, allProps.length).map(a => {
                            return {
                                property: a,
                            };
                        }))]
                }]);
        };
        let expands = this.properties.filter(x => x.parent != null);
        return [].concat(expands.map(getExpand)).concat([new Expressions_1.Select(this.properties.filter(x => x.parent == null).map(a => {
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
        this.addProperty(new Expressions_1.Property(selectManay.name, selectManay.parent));
    }
    modelMethod(method) {
        method.args.forEach((i) => {
            this.addProperty(i);
        });
    }
}
exports.SelectPropertyFinder = SelectPropertyFinder;
//# sourceMappingURL=selectPropertyFinder.js.map