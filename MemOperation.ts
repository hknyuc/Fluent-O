export abstract class MemOperation {
    abstract pipe(array: Array<any>): Promise<Array<any>>;
}

/**Distincts */
/**
 * Checks all properties
 */
class FullMatchDistinctOp extends MemOperation {
    pipe(array: any[]): Promise<any[]> {
        return Promise.resolve(array.filter((item, index, arr) => {
            return arr.findIndex((a) => {
                if (a == null) return false;
                for (let i in a) {
                    if (item[i] !== a[i]) return false;
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
    pipe(array: any[]): Promise<any[]> {
        return Promise.resolve(array.filter((item, index, arr) => {
            return arr.findIndex((a) => a === item) === index;
        }));
    }
}

/**
 * Checks only selected properties
 */
class OneProperyDistinctOp extends MemOperation {
    constructor(private properties: Array<any>) {
        super();
    }
    pipe(array: any[]): Promise<any[]> {
        return Promise.resolve(array.filter((item, index, arr) => {
            return arr.findIndex((a) => {
                if (a == null) return false;
                return this.properties.every((prop) => {
                    return item[prop] === a[prop];
                })
            }) === index;
        }))
    }

}

export class Distincs {
    /**
    * Checks all properties
    */
    static fullMatch = new FullMatchDistinctOp();
    /**
     * Checks  only equality of references
     */
    static referenceMatch = new ReferenceDistinctOp();

    /**
     * Checks only selected properties
     */
    static propertyMatch = function (...properties: Array<any>) {
        let props = properties.length === 0 && Array.isArray(properties[0]) ? properties[0] : properties;
        return new OneProperyDistinctOp(props);
    }

}

/**
 * Distinct model
 * @param algorithm 
 */
export function distinct(algorithm: MemOperation | Array<any> | string = Distincs.referenceMatch) {
    if(typeof algorithm === "string") return Distincs.propertyMatch(algorithm);
    if(Array.isArray(algorithm)) return Distincs.propertyMatch.apply(null,algorithm);
    return algorithm;
}

/**
 * Checks all properties
 */
export function fullDistinct() {
    return Distincs.fullMatch;
}



class NotNullOp extends MemOperation {
    pipe(array: any[]): Promise<any[]> {
        return Promise.resolve(array.filter(x => x != null));
    }
}

export function notNull() {
    return new NotNullOp();
}

class MapOp extends MemOperation {
    constructor(private mapFn: (item, index, array) => any) {
        super();
    }
    pipe(array: any[]): Promise<any[]> {
        return Promise.resolve(array.map(this.mapFn));
    }
}

/**
    * Returns the elements of an array that meet the condition specified in a callback function.
 * @param mapFn 
 */
export function map(mapFn: (item, index, array) => any) {
    return new MapOp(mapFn);
}
