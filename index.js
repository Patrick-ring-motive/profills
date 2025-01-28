(async ()=>{
  require('core-js');
  await import('./array-like.js');
  await import('./map-like.js');



  
  console.log('Headers',Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(Headers.prototype).includes(x)));
  console.log('FormData',Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(FormData.prototype).includes(x)));
   console.log('URLSearchParams',Object.getOwnPropertyNames(Map.prototype).filter(x=>!Object.getOwnPropertyNames(URLSearchParams.prototype).includes(x)));


})();