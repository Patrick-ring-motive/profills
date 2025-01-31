(async ()=>{
  async function importScript(url){
    return eval?.call(globalThis,await(await fetch(url)).text());
  }
  await importScript(`https://cdn.jsdelivr.net/npm/core-js-bundle/minified.min.js?${new Date().getTime()}`);
  await import('./array-like.js');
  await import('./map-like.js');



  
  console.log('Headers',Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(Headers.prototype).includes(x)));
  console.log('FormData',Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(FormData.prototype).includes(x)));
  console.log('URLSearchParams',Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(URLSearchParams.prototype).includes(x)));



let x = new Map();
x.set('a',1);
x.set('b',2);
  


  function getTypeName(x){
    if(x === null) return 'null';
    if(x === undefined) return 'undefined';
    return x?.constructor?.name
    ?? x?.__proto__?.constructor?.name
    ?? typeof x
  }
  function getObjectName(x){
      if(x === null) return 'null';
      if(x === undefined) return 'undefined';
      if(x.name)return x.name;
      const n = String(x).match(/^\[object [^\]]+\]$/)?.pop?.();
      if(n && (n!=='[object Object]')){
        return n.split('[object').pop()?.split(']').shift()?.trim();
      }
      return getTypeName(x);
  }

  console.log();
})();