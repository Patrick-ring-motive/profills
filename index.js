(async ()=>{
  require('core-js');
  await import('./array-like.js');
  await import('./map-like.js');



  
  console.log(Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(Headers.prototype).includes(x)));

  console.log(new Headers({
    0:'a',
    1:'b'
  }).mapValues(x=>(x+1).toString()));
  
  
})();