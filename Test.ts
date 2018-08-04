import { ODataDataSet, ODataConfig } from "./OData";
import { select, filter, prop, order, expand } from "./Operations";

class Context {
    customers = new ODataDataSet<any>('url');
    test(): void {
        this.customers.get(
            select('ID', 'Name'),
            filter(prop('ID').lt(5)),
            order('ID'),
            expand('Orders',select('ID')))
            .then((response) => {
               
            });
         this.customers.add({}).then(() => {

        });
    }
}