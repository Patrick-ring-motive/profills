const pureProxy = (item) => {
  const funcMap = new Map();
  return new Proxy(item, {
    get(target, prop) {
      const val = target[prop];
      if (typeof val === "function") {
        if (
          !funcMap.has(prop) ||
          funcMap.get(prop)[`&${String(prop)}`] !== val
        ) {
          const boundFunc = val.bind(target);
          boundFunc[`&${String(prop)}`] = val;
          funcMap.set(prop, boundFunc);
        }
        return funcMap.get(prop);
      }
      return val;
    },
    set(target, prop, val) {
      if (typeof val === "function") {
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
      if (typeof val === "function") {
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
    },
  });
};

//undefined
const Undefined = function () {
  if (!new.target) return undefined;
};
Undefined.__proto__ = null;
Undefined.prototype.__proto__ = null;
Undefined.prototype.toString = () => undefined;
Undefined.prototype.toLocaleString = () => undefined;
Undefined.prototype[Symbol.toStringTag] = () => undefined;
Undefined.prototype.valueOf = () => undefined;
Undefined.prototype[Symbol.toPrimitive] = () => undefined;

Object.defineProperty(Undefined, "length", {
  value: undefined,
  writable: true,
  enumerable: false,
  configurable: true,
});
Object.defineProperty(Undefined, "name", {
  value: undefined,
  writable: true,
  enumerable: false,
  configureable: true,
});

const Null = function () {
  if (!new.target) return null;
};
Null.__proto__ = null;
Null.prototype.__proto__ = null;
Null.prototype.toString = () => null;
Null.prototype.toLocaleString = () => null;
Null.prototype[Symbol.toStringTag] = () => null;
Null.prototype.valueOf = () => null;
Null.prototype[Symbol.toPrimitive] = () => null;

Object.defineProperty(Null, "length", {
  value: undefined,
  writable: true,
  enumerable: false,
  configurable: true,
});
Object.defineProperty(Null.prototype, "__proto__", {
  value: null,
  writable: true,
  enumerable: false,
  configurable: true,
});
Object.defineProperty(Null, "__proto__", {
  value: null,
  writable: true,
  enumerable: false,
  configurable: true,
});
Object.defineProperty(Null, "name", {
  value: null,
  writable: true,
  enumerable: false,
  configureable: true,
});

function Obj(value) {
  if (value === null) return new Null();
  if (value === undefined) return new Undefined();
  const x = Object(value.valueOf());
  if (x !== value) return x;
  return pureProxy(value);
}