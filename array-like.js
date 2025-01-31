

(()=>{
  const q = (varFn) => {
      try {
          return varFn?.();
      } catch (e) {
          if (e.name != "ReferenceError") {
              throw e;
          }
      }
  };

  const globalObject =
    q(() => globalThis) ??
    q(() => self) ??
    q(() => global) ??
    q(() => window) ??
    this ??
    {};
  for (let x of ["globalThis", "self", "global"]) {
    globalObject[x] = globalObject;
  }
  
  const str = (x) => String(x?.description || x?.source || x?.name || x);
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
  const getPropKeys = (obj) =>
      Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));

  const bool = (fn,params=[]) => {
    if(typeof fn === 'function'){
      try{
        return !!fn(...params);
      }catch{
        return false;
      }
    }
    return !!fn;
  };

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

  const isStringArray = (x) => isArray(x) && bool(()=>[...x].every(isString));
  const isIterable = (x) => isArray(x) || !!x?.[Symbol.iterator];
  const join = (x=[],match='') => x?.join?.(match)??'';



  
  (()=>{
    //arrays
    globalThis.TypedArray ??= Uint8Array.__proto__;
    Array.prototype.subarray ??= function subarray(){
      return this.slice(...Array.from(arguments));
    };
    Array.prototype.set ??= function set(arr,offset = 0){
      const len = arr.length;
      for(let i = 0; i < len; ++i){
        this[i+offset] = arr[i];
      }
    };
    TypedArray.prototype.toSpliced ??= function toSpliced(){
      return new this.constructor([...this].splice(...Array.from(arguments)));
    };
  })();

  //sets
  (()=>{
    Set.prototype.findIndex ??= function findIndex(){
      return [...this].findIndex(...Array.from(arguments));
    };
    Set.prototype.findLastIndex ??= function findLastIndex(){
      return [...this].findLastIndex(...Array.from(arguments));
    };
    Set.prototype.find ??= function find(){
      return [...this].find(...Array.from(arguments));
    };
    Set.prototype.findLast ??= function findLast(){
      return [...this].findLast(...Array.from(arguments));
    };
    Set.prototype.includes ??= function includes(){
      return this.has(...Array.from(arguments));
    };
    Set.prototype.indexOf ??= function indexOf(){
      return [...this].indexOf(...Array.from(arguments));
    };
    Set.prototype.lastIndexOf ??= function lastIndexOf(){
      return [...this].lastIndexOf(...Array.from(arguments));
    };
    Set.prototype.flat ??= function flat(){
      return new Set([...this].flat(...Array.from(arguments)));
    };
    Set.prototype.map ??= function map(){
      return new Set([...this].map(...Array.from(arguments)));
    };
    Set.prototype.flatMap ??= function flatMap(){
      return new Set([...this].flatMap(...Array.from(arguments)));
    };
    Set.prototype.reduceRight ??= function reduceRight(){
      return [...this].reduceRight(...Array.from(arguments));
    };
    Set.prototype.reduce ??= function reduce(){
      return [...this].reduce(...Array.from(arguments));
    };
    Set.prototype.join ??= function join(){
      return [...this].join(...Array.from(arguments));
    };
    Set.prototype.every ??= function every(){
      return [...this].every(...Array.from(arguments));
    };
    Set.prototype.some ??= function some(){
      return [...this].some(...Array.from(arguments));
    };
    Set.prototype.at ??= function at(){
      return [...this].at(...Array.from(arguments));
    };
    Set.prototype.filter ??= function filter(){
      return new Set([...this].filter(...Array.from(arguments)));
    };
    Set.prototype.toReversed ??= function toReversed(){
      return new Set([...this].toReversed(...Array.from(arguments)));
    };
    Set.prototype.toSorted ??= function toSorted(){
      return new Set([...this].toSorted(...Array.from(arguments)));
    };
    Set.prototype.toSpliced ??= function toSpliced(){
      return new Set([...this].toSpliced(...Array.from(arguments)));
    };
    Set.prototype.subarray ??= function subarray(){
      return [...this].slice(...Array.from(arguments));
    };
    Set.prototype.concat ??= function concat(...args){
      return new Set([...this].concat(...args.map(x=>instanceOf(x,Set)?[...x]:x)));
    };
  })();

  //String
  (()=>{
    String.prototype.concat ??= function concat(...args){
      return [...this].concat(...args.map(x=>isString(x)?[...x]:x)).join``;
    };
    String.prototype.find ??= function find(){
      return [...this].find(...Array.from(arguments));
    };
    String.prototype.findIndex ??= function findIndex(){
      return [...this].findIndex(...Array.from(arguments));
    };
    String.prototype.findLast ??= function findLast(){
      return [...this].findLast(...Array.from(arguments));
    };
    String.prototype.findLastIndex ??= function findLastIndex(){
      return [...this].findLastIndex(...Array.from(arguments));
    };
    String.prototype.join ??= function join(){
      return [...this].join(...Array.from(arguments));
    };
    String.prototype.keys ??= function keys(){
      return [...this].keys(...Array.from(arguments));
    };
    String.prototype.entries ??= function entries(){
      return [...this].entries(...Array.from(arguments));
    };
    String.prototype.values ??= function values(){
      return this[Symbol.iterator](...Array.from(arguments));
    };
    String.prototype.values ??= function values(){
      return this[Symbol.iterator](...Array.from(arguments));
    };
    String.prototype.forEach ??= function forEach(){
      return this[Symbol.iterator]().forEach(...Array.from(arguments));
    };
    String.prototype.filter ??= function filter(){
      return [...this].filter(...Array.from(arguments)).join``;
    };
    String.prototype.map ??= function map(){
      return [...this].map(...Array.from(arguments)).join``;
    };
    String.prototype.every ??= function every(){
      return [...this].every(...Array.from(arguments));
    };
    String.prototype.some ??= function some(){
      return [...this].some(...Array.from(arguments));
    };
    String.prototype.reduce ??= function reduce(){
      return [...this].reduce(...Array.from(arguments));
    };
    String.prototype.reduceRight ??= function reduceRight(){
      return [...this].reduceRight(...Array.from(arguments));
    };
    String.prototype.toReversed ??= function toReversed(){
      return [...this].toReversed(...Array.from(arguments)).join``;
    };
    String.prototype.toSorted ??= function toSorted(){
      return [...this].toSorted(...Array.from(arguments)).join``;
    };
    String.prototype.toSpliced ??= function toSpliced(){
      return [...this].toSpliced(...Array.from(arguments)).join``;
    };
    String.prototype.subarray ??= function subarray(){
      return [...this].slice(...Array.from(arguments));
    };
  })();

  })();
