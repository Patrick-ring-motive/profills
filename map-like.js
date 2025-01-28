(()=>{
  const objDoProp = function (obj, prop, def, enm, mut) {
      return Object.defineProperty(obj, prop, {
          value: def,
          writable: mut,
          enumerable: enm,
          configurable: mut,
      });
  };
  const objDefProp = (obj, prop, def) =>
    objDoProp(obj, prop, def, false, true);
  const instanceOf = function instanceOf(x,y){
    try{
      return x instanceof y;
    }catch{
      return false;
    }
  };
  const TypedArray = Uint8Array?.__proto__;

  const isString = (x) => typeof x === 'string' || x instanceof String;
  const isArray = (x) => Array.isArray(x) || x instanceof Array || instanceOf(x,TypedArray);
  
  const pureProxy = item => {
    const funcMap = new Map();
    return new Proxy(item, {
      get(target, prop) {
        const val = target[prop];
        if (typeof val === 'function') {
          if (!funcMap.has(prop) || funcMap.get(prop)[`&${String(prop)}`] !== val) {
            const boundFunc = val.bind(target);
              boundFunc[`&${String(prop)}`] = val;
            funcMap.set(prop, boundFunc);
          }
          return funcMap.get(prop);
        }
        return val;
      },
      set(target, prop, val) {
        if (typeof val === 'function') {
          const boundFunc = val.bind(target);
          boundFunc[`&${String(prop)}`] = val;
          funcMap.set(prop, boundFunc);
        } else {
          funcMap.delete(prop); 
        }
        target[prop] = val;
        return true;
      },
      defineProperty(target, prop, desc) {
        const val = desc?.value;
        if (typeof val === 'function') {
          const boundFunc = val.bind(target);
          boundFunc[`&${String(prop)}`] = val;
          funcMap.set(prop, boundFunc);
        } else {
          funcMap.delete(prop); 
        }
        return Reflect.defineProperty(target, prop, desc);
      },
      deleteProperty(target, prop) {
        funcMap.delete(prop);
        return Reflect.deleteProperty(target, prop);
      }
    });
  };

  //undefined 
  const Undefined = function(){
    if(!new.target)return undefined;
  }
  Undefined.__proto__ = null;
  Undefined.prototype.__proto__ = null;
  Undefined.prototype.toString = ()=>undefined;
  Undefined.prototype.toLocaleString = ()=>undefined;
  Undefined.prototype[Symbol.toStringTag] = ()=>undefined;
  Undefined.prototype.valueOf = ()=>undefined;
  Undefined.prototype[Symbol.toPrimitive] = ()=>undefined;

  Object.defineProperty(Undefined, 'length',{value:undefined,writable:true,enumerable:false,configurable:true});
  Object.defineProperty(Undefined, 'name',{value:undefined,writable:true,enumerable:false,configureable:true});

  const Null = function(){
    if(!new.target)return null;
  }
  Null.__proto__ = null;
  Null.prototype.__proto__ = null;
  Null.prototype.toString = ()=>null;
  Null.prototype.toLocaleString = ()=>null;
  Null.prototype[Symbol.toStringTag] = ()=>null;
  Null.prototype.valueOf = ()=>null;
  Null.prototype[Symbol.toPrimitive] = ()=>null;

  Object.defineProperty(Null, 'length',{value:undefined,writable:true,enumerable:false,configurable:true});
  Object.defineProperty(Null.prototype, '__proto__',{value:null,writable:true,enumerable:false,configurable:true});
  Object.defineProperty(Null, '__proto__',{value:null,writable:true,enumerable:false,configurable:true});
  Object.defineProperty(Null, 'name',{value:null,writable:true,enumerable:false,configureable:true});


  function Obj(value){
    if(value === null)return new Null();
    if(value === undefined)return new Undefined();
    const x = Object(value.valueOf());
    if(x !== value)return x;
    return pureProxy(value);
  }
  
  //map
(()=>{
  Map.prototype.append ??= function append(key,value){
    if(!this.has(key))return this.set(key,value);
    return this.set(Obj(key),value);
  };
  Map.prototype.getAll ??= function getAll(key){
    return [...this.entries()].filter(([k,v])=>k?.valueOf()==key?.valueOf()).map(([k,v])=>v);
  };
})();

  //headers
(()=>{
  if(!globalThis.Headers)return;
  Headers.prototype.clear ??= function clear(){
    this.forEach((_, key) => {
      this.delete(key);
    });
  };
  (()=>{
    const $set = Headers.prototype.set;
    Headers.prototype.set = function set(key,value){
      $set.call(this, key, value);
      return this;
    }
  })();
  (()=>{
    const $delete = Headers.prototype.delete;
    Headers.prototype.delete = function _delete(key){
      const has = this.has(key);
      $delete.call(this, key);
      return has;
    }
  })();
  (()=>{
    Headers.prototype.emplace = function emplace(key,handler){
      if(this.has(key)){
        const current = this.get(key);
        if(handler.update){
          const value = handler.update(current,key,this)
          this.set(key,value);
          return value;
        }
        return current;
      }
      if(handler.insert){
        const inserted = handler.insert(key,this);
        this.set(key,inserted);
        return inserted;
      }
    };
  })();
  (()=>{
    if(!Map.prototype.filter)return;
    Headers.prototype.filter ??= function filter(){
      const filtered = new Headers();
      new Map(this).filter(...arguments).forEach((value, key) =>{
        filtered.append(key,value);
      });
      return filtered;
    };
    Headers.prototype.some ??= function some(){

      return[...this].some(...arguments);
    };
    Headers.prototype.every ??= function every(){

      return[...this].every(...arguments);
    };
    Headers.prototype.includes ??= function includes(){

  return[...this.values()].includes(...arguments);
    };
    Headers.prototype.find ??= function find(){

      return[...this.values()].find(...arguments);
    };
    Headers.prototype.getAll ??= function getAll(key){
      if(!this.has(key))return[];
      if(/set-cookie/i.test(key))return this.getSetCookie();
      return String(this.get(key)).split(', ');
    };
  })();
Object.defineProperty(Headers.prototype, 'size', {
    get(){
      return [...this.entries()].length;
    },
    set(){}
  });
  Headers.prototype.mapValues ??= function mapValues(callbackFn, thisArg=this) {
    const retObj = new Headers();
        for(const [key, value] of this) {
          const newValue = Reflect.apply(callbackFn, thisArg, [value, key, this])
            retObj.append(key, newValue);
        }
        return retObj;
    }
  Headers.prototype.mapKeys ??= function mapKeys(callbackFn, thisArg=this) {
    const retObj = new Headers();
        for(const [key, value] of this) {
          const newKey = Reflect.apply(callbackFn, thisArg, [value, key, this])
            retObj.append(newKey, value);
        }
        return retObj;
    };
  Headers.prototype.merge ??= function merge(...args) {
    const headers = new Headers(this);
    for(const iter of args){
      new Headers(iter).forEach((value, key) =>{
        headers.append(key,value);
      });
    }
    return headers;
    };
})();
  
  
  
})();


/*
console.log(Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(Headers.prototype).includes(x)));

console.log(new Headers({
  0:'a',
  1:'b'
}).mapValues(x=>(x+1).toString()));


*/