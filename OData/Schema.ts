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

export class Guid{
    constructor(public value:string){
        if(value == null) return;
        if(typeof value != "string") throw new Error('value is not guid');
        
    }

    toString(){
        return this.value;
    }

    static new():Guid{
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return new Guid(s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
    }
}

export class Float{
    
}
