import { RestClient } from "./RestClient";

export class Http extends RestClient{
   constructor(){
       super({
           create:function(){
               if(XMLHttpRequest != null){
                   return new XMLHttpRequest();
               }
           },
       })
   }
}