function log(){
  return function (elem,a,b){
     console.log(elem);
     console.log(a);
     console.log(b);
  }
}

class User{
    @log('$name adlı kullanıcı oluşturuluyor')
    create(name){
        console.log(name+" adlı kullanıcı oluşturuldu");
    }
    @log('$name adlı kullanıcı silindi')
    delete(name){
        console.log(name+" adlı kullanıcı silindi");
    }
}

var user = new User();
user.create('hakan');