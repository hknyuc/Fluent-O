export class TestUtility{
    static validateProperties(source,obj):void{
        if(obj == null) throw new Error('object is null');
       var sourceProps = Object.keys(source);
       let errors = [];
       Object.keys(obj).forEach((prop)=>{
            let any = sourceProps.some(a=>a == prop);
            if(any) return true;
            errors.push(prop);
       });

       if(errors.length != 0)
          throw new Error(errors.join(',') +" is not valid in object");
    }
    static hasProperties(source,obj):boolean{
        try{
            this.validateProperties(source,obj);
            return true;
        }catch(e){
            return false;
        }
    }
}