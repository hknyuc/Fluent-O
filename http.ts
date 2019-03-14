import { RestClient } from "./restclient";

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