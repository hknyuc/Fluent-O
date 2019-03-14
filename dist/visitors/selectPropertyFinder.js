"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expressions_1 = require("../expressions");
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
