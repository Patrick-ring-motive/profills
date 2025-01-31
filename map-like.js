(() => {
  const objDoProp = function (obj, prop, def, enm, mut) {
    return Object.defineProperty(obj, prop, {
      value: def,
      writable: mut,
      enumerable: enm,
      configurable: mut,
    });
  };
  const objDefProp = (obj, prop, def) => objDoProp(obj, prop, def, false, true);
  const instanceOf = function instanceOf(x, y) {
    try {
      return x instanceof y;
    } catch {
      return false;
    }
  };
  const eq = (x, y) => {
    return x === y || (x !== x && y !== y);
  };
  const TypedArray = Uint8Array?.__proto__;
  const isFunction = (x) => typeof x === "function" || x instanceof Function;
  const isString = (x) => typeof x === "string" || x instanceof String;
  const isArray = (x) =>
    Array.isArray(x) || x instanceof Array || instanceOf(x, TypedArray);
  const apply = ($this, fn, args) => $this[fn].apply($this, args);
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

  //map
  (() => {
    Map.prototype.append ??= function append(key, value) {
      if (!this.has(key)) return this.set(key, value);
      return this.set(Obj(key), value);
    };
    Map.prototype.getAll ??= function getAll(key) {
      return [...this.entries()]
        .filter(([k, v]) => k?.valueOf() == key?.valueOf())
        .map(([k, v]) => v);
    };
    Map.from ??= function from(obj) {
      try {
        return new Map(obj);
      } catch {
        return new Map(Object.entries(obj));
      }
    };
  })();

  //headers
  (() => {
    if (!globalThis.Headers) return;
    Headers.prototype.clear ??= function clear() {
      this.forEach((_, key) => {
        this.delete(key);
      });
    };
    (() => {
      const $set = Headers.prototype.set;
      Headers.prototype.set = function set(key, value) {
        $set.call(this, key, value);
        return this;
      };
    })();
    (() => {
      const $delete = Headers.prototype.delete;
      Headers.prototype.delete = function _delete(key) {
        const has = this.has(key);
        $delete.call(this, key);
        return has;
      };
    })();

    (() => {
      // `Map.prototype.emplace` method
      // https://github.com/tc39/proposal-upsert
      Headers.prototype.emplace ??= function emplace(key, handler) {
        if (this.has(key)) {
          const current = this.get(key);
          if (handler.update) {
            const value = handler.update(current, key, this);
            this.set(key, value);
            return value;
          }
          return current;
        }
        if (handler.insert) {
          const inserted = handler.insert(key, this);
          this.set(key, inserted);
          return inserted;
        }
      };
    })();

    (() => {
      // `Map.prototype.filter` method
      // https://github.com/tc39/proposal-collection-methods
      Headers.prototype.filter ??= function filter(callbackfn, thisArg) {
        const fn = callbackfn.bind(thisArg);
        const fd = new FormData();
        this.forEach((value, key) => {
          if (fn(value, key, this)) fd.set(key, value);
        });
        return fd;
      };
    })();

    // `Map.prototype.some` method
    // https://github.com/tc39/proposal-collection-methods
    Headers.prototype.some ??= function some() {
      let rtrn = false;
      const fn = callbackfn.bind(thisArg);
      this.forEach((value, key) => {
        if (fn(value, key, this)) rtrn = true;
      });
      return rtrn;
    };

    (() => {
      // `Map.prototype.every` method
      // https://github.com/tc39/proposal-collection-methods
      Headers.prototype.every ??= function every() {
        let rtrn = true;
        const fn = callbackfn.bind(thisArg);
        this.forEach((value, key) => {
          if (!fn(value, key, this)) rtrn = false;
        });
        return rtrn;
      };
    })();

    (() => {
      // `Map.prototype.includes` method
      // https://github.com/tc39/proposal-collection-methods
      FormData.prototype.includes ??= function includes() {
        return apply(Array.from(this.values()), "includes", arguments);
      };
    })();

    (() => {
      // `Map.prototype.find` method
      // https://github.com/tc39/proposal-collection-methods
      Headers.prototype.find ??= function find(callbackfn, thisArg) {
        const boundFunction = bind(callbackfn, thisArg);
        for (const [key, value] of this) {
          if (boundFunction(value, key, this)) return value;
        }
      };
    })();
    (() => {
      Headers.prototype.getAll ??= function getAll(key) {
        if (!this.has(key)) return [];
        if (/set-cookie/i.test(key)) return this.getSetCookie();
        return String(this.get(key)).split(", ");
      };
    })();
    new Headers().size ??
      Object.defineProperty(Headers.prototype, "size", {
        get() {
          return Array.from(this.entries()).length;
        },
        set() {},
      });
    Headers.prototype.mapValues ??= function mapValues(
      callbackFn,
      thisArg = this,
    ) {
      const retObj = new Headers();
      for (const [key, value] of this) {
        const newValue = Reflect.apply(callbackFn, thisArg, [value, key, this]);
        retObj.append(key, newValue);
      }
      return retObj;
    };
    Headers.prototype.mapKeys ??= function mapKeys(callbackFn, thisArg = this) {
      const retObj = new Headers();
      for (const [key, value] of this) {
        const newKey = Reflect.apply(callbackFn, thisArg, [value, key, this]);
        retObj.append(newKey, value);
      }
      return retObj;
    };
    Headers.prototype.merge ??= function merge() {
      const headers = new Headers(this);
      for (const iter of Array.from(arguments)) {
        new Headers(iter).forEach((value, key) => {
          headers.append(key, value);
        });
      }
      return headers;
    };
    Headers.from ??= function from(obj) {
      try {
        return new Headers(new URLSearchParams(obj));
      } catch {
        return new Headers(new URLSearchParams(Object.entries(obj)));
      }
    };
    Headers.prototype.upsert ??= function upsert(key, updateFn, insertFn) {
      let value;
      if (this.has(key)) {
        value = this.get(key);
        if (isFunction(updateFn)) {
          value = updateFn(value);
          this.set(key, value);
        }
      } else if (isFunction(insertFn)) {
        value = insertFn();
        this.set(key, value);
      }
      return value;
    };
    Headers.prototype.deleteAll ??= function deleteAll(keys) {
      let all = true;
      for (const key of keys) {
        all = all && this.delete(key);
      }
      return all;
    };
    Headers.prototype.update ??= function update(key, callback, thunk) {
      this.set(key, callback(this.get(key) ?? thunk(key, this), key, this));
      return this;
    };
    Headers.prototype.updateOrInsert ??= Headers.prototype.upsert;
  })();

  //URLSearchParams
  (() => {
    if (!globalThis.URLSearchParams) return;
    URLSearchParams.prototype.clear ??= function clear() {
      this.forEach((_, key) => {
        this.delete(key);
      });
    };
    (() => {
      const $set = URLSearchParams.prototype.set;
      URLSearchParams.prototype.set = function set(key, value) {
        $set.call(this, key, value);
        return this;
      };
    })();
    (() => {
      const $delete = URLSearchParams.prototype.delete;
      URLSearchParams.prototype.delete = function _delete(key) {
        const has = this.has(key);
        $delete.call(this, key);
        return has;
      };
    })();

    (() => {
      // `Map.prototype.emplace` method
      // https://github.com/tc39/proposal-upsert
      URLSearchParams.prototype.emplace ??= function emplace(key, handler) {
        if (this.has(key)) {
          const current = this.get(key);
          if (handler.update) {
            const value = handler.update(current, key, this);
            this.set(key, value);
            return value;
          }
          return current;
        }
        if (handler.insert) {
          const inserted = handler.insert(key, this);
          this.set(key, inserted);
          return inserted;
        }
      };
    })();

    (() => {
      // `Map.prototype.filter` method
      // https://github.com/tc39/proposal-collection-methods
      URLSearchParams.prototype.filter ??= function filter(
        callbackfn,
        thisArg,
      ) {
        const fn = callbackfn.bind(thisArg);
        const fd = new FormData();
        this.forEach((value, key) => {
          if (fn(value, key, this)) fd.set(key, value);
        });
        return fd;
      };
    })();

    // `Map.prototype.some` method
    // https://github.com/tc39/proposal-collection-methods
    URLSearchParams.prototype.some ??= function some() {
      let rtrn = false;
      const fn = callbackfn.bind(thisArg);
      this.forEach((value, key) => {
        if (fn(value, key, this)) rtrn = true;
      });
      return rtrn;
    };

    (() => {
      // `Map.prototype.every` method
      // https://github.com/tc39/proposal-collection-methods
      URLSearchParams.prototype.every ??= function every() {
        let rtrn = true;
        const fn = callbackfn.bind(thisArg);
        this.forEach((value, key) => {
          if (!fn(value, key, this)) rtrn = false;
        });
        return rtrn;
      };
    })();

    (() => {
      // `Map.prototype.includes` method
      // https://github.com/tc39/proposal-collection-methods
      URLSearchParams.prototype.includes ??= function includes() {
        return apply(Array.from(this.values()), "includes", arguments);
      };
    })();

    (() => {
      // `Map.prototype.find` method
      // https://github.com/tc39/proposal-collection-methods
      URLSearchParams.prototype.find ??= function find(callbackfn, thisArg) {
        const boundFunction = bind(callbackfn, thisArg);
        for (const [key, value] of this) {
          if (boundFunction(value, key, this)) return value;
        }
      };
    })();
    new URLSearchParams().size ??
      Object.defineProperty(URLSearchParams.prototype, "size", {
        get() {
          return Array.from(this.entries()).length;
        },
        set() {},
      });
    URLSearchParams.prototype.mapValues ??= function mapValues(
      callbackFn,
      thisArg = this,
    ) {
      const retObj = new URLSearchParams();
      for (const [key, value] of this) {
        const newValue = Reflect.apply(callbackFn, thisArg, [value, key, this]);
        retObj.append(key, newValue);
      }
      return retObj;
    };
    URLSearchParams.prototype.mapKeys ??= function mapKeys(
      callbackFn,
      thisArg = this,
    ) {
      const retObj = new URLSearchParams();
      for (const [key, value] of this) {
        const newKey = Reflect.apply(callbackFn, thisArg, [value, key, this]);
        retObj.append(newKey, value);
      }
      return retObj;
    };
    URLSearchParams.prototype.merge ??= function merge() {
      const up = new URLSearchParams(this);
      for (const iter of Array.from(arguments)) {
        new URLSearchParams(iter).forEach((value, key) => {
          up.append(key, value);
        });
      }
      return up;
    };
    URLSearchParams.from ??= function from(obj) {
      try {
        return new URLSearchParams(obj);
      } catch {
        return new URLSearchParams(Object.entries(obj));
      }
    };
    URLSearchParams.prototype.upsert ??= function upsert(
      key,
      updateFn,
      insertFn,
    ) {
      let value;
      if (this.has(key)) {
        value = this.get(key);
        if (isFunction(updateFn)) {
          value = updateFn(value);
          this.set(key, value);
        }
      } else if (isFunction(insertFn)) {
        value = insertFn();
        this.set(key, value);
      }
      return value;
    };
    URLSearchParams.prototype.deleteAll ??= function deleteAll(keys) {
      let all = true;
      for (const key of keys) {
        all = all && this.delete(key);
      }
      return all;
    };
    URLSearchParams.prototype.update ??= function update(key, callback, thunk) {
      this.set(key, callback(this.get(key) ?? thunk(key, this), key, this));
      return this;
    };
    URLSearchParams.prototype.updateOrInsert ??=
      URLSearchParams.prototype.upsert;
  })();

  //FormData
  (() => {
    if (!globalThis.FormData) return;
    (() => {
      FormData.prototype.clear ??= function clear() {
        this.forEach((_, key) => {
          this.delete(key);
        });
      };
    })();
    (() => {
      const $set = FormData.prototype.set;
      FormData.prototype.set = function set(key, value) {
        $set.call(this, key, value);
        return this;
      };
    })();
    (() => {
      const $delete = FormData.prototype.delete;
      FormData.prototype.delete = function _delete(key) {
        const has = this.has(key);
        $delete.call(this, key);
        return has;
      };
    })();

    (() => {
      // `Map.prototype.emplace` method
      // https://github.com/tc39/proposal-upsert
      FormData.prototype.emplace ??= function emplace(key, handler) {
        if (this.has(key)) {
          const current = this.get(key);
          if (handler.update) {
            const value = handler.update(current, key, this);
            this.set(key, value);
            return value;
          }
          return current;
        }
        if (handler.insert) {
          const inserted = handler.insert(key, this);
          this.set(key, inserted);
          return inserted;
        }
      };
    })();

    (() => {
      // `Map.prototype.filter` method
      // https://github.com/tc39/proposal-collection-methods
      FormData.prototype.filter ??= function filter(callbackfn, thisArg) {
        const fn = callbackfn.bind(thisArg);
        const fd = new FormData();
        this.forEach((value, key) => {
          if (fn(value, key, this)) fd.set(key, value);
        });
        return fd;
      };
    })();

    // `Map.prototype.some` method
    // https://github.com/tc39/proposal-collection-methods
    FormData.prototype.some ??= function some() {
      let rtrn = false;
      const fn = callbackfn.bind(thisArg);
      this.forEach((value, key) => {
        if (fn(value, key, this)) rtrn = true;
      });
      return rtrn;
    };

    (() => {
      // `Map.prototype.every` method
      // https://github.com/tc39/proposal-collection-methods
      FormData.prototype.every ??= function every() {
        let rtrn = true;
        const fn = callbackfn.bind(thisArg);
        this.forEach((value, key) => {
          if (!fn(value, key, this)) rtrn = false;
        });
        return rtrn;
      };
    })();

    (() => {
      // `Map.prototype.includes` method
      // https://github.com/tc39/proposal-collection-methods
      FormData.prototype.includes ??= function includes() {
        return apply(Array.from(this.values()), "includes", arguments);
      };
    })();

    (() => {
      // `Map.prototype.find` method
      // https://github.com/tc39/proposal-collection-methods
      FormData.prototype.find ??= function find(callbackfn, thisArg) {
        const boundFunction = bind(callbackfn, thisArg);
        for (const [key, value] of this) {
          if (boundFunction(value, key, this)) return value;
        }
      };
    })();

    new FormData().size ??
      Object.defineProperty(FormData.prototype, "size", {
        get() {
          return Array.from(this.entries()).length;
        },
        set() {},
      });
    FormData.prototype.mapValues ??= function mapValues(
      callbackFn,
      thisArg = this,
    ) {
      const retObj = new FormData();
      for (const [key, value] of this) {
        const newValue = Reflect.apply(callbackFn, thisArg, [value, key, this]);
        retObj.append(key, newValue);
      }
      return retObj;
    };
    FormData.prototype.mapKeys ??= function mapKeys(
      callbackFn,
      thisArg = this,
    ) {
      const retObj = new FormData();
      for (const [key, value] of this) {
        const newKey = Reflect.apply(callbackFn, thisArg, [value, key, this]);
        retObj.append(newKey, value);
      }
      return retObj;
    };
    FormData.prototype.merge ??= function merge(...args) {
      const fd = FormData.from(this);
      for (const iter of args) {
        FormData.from(iter).forEach((value, key) => {
          fd.append(key, value);
        });
      }
      return fd;
    };
    FormData.from ??= function from(obj, submitter) {
      let entries, fd;
      try {
        fd = new FormData(obj, submitter);
      } catch {
        try {
          fd = new FormData();
          entries = obj.entries();
          for (const [key, value] of entries) {
            fd.append(key, value);
          }
          return fd;
        } catch {
          entries = new URLSearchParams.from(obj);
        }
        fd = new FormData();
        for (const [key, value] of entries) {
          fd.append(key, value);
        }
      }
      return fd;
    };
    FormData.prototype.upsert ??= function upsert(key, updateFn, insertFn) {
      let value;
      if (this.has(key)) {
        value = this.get(key);
        if (isFunction(updateFn)) {
          value = updateFn(value);
          this.set(key, value);
        }
      } else if (isFunction(insertFn)) {
        value = insertFn();
        this.set(key, value);
      }
      return value;
    };
    FormData.prototype.deleteAll ??= function deleteAll(keys) {
      let all = true;
      for (const key of keys) {
        all = all && this.delete(key);
      }
      return all;
    };
    FormData.prototype.update ??= function update(key, callback, thunk) {
      this.set(key, callback(this.get(key) ?? thunk(key, this), key, this));
      return this;
    };
    (() => {
      FormData.prototype.updateOrInsert ??= FormData.prototype.upsert;
    })();
  })();
})();
