var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* toIterator(parts, clone3 = true) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone3) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body: body4 } = data;
  if (body4 === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body4)) {
    body4 = import_stream.default.Readable.from(body4.stream());
  }
  if (Buffer.isBuffer(body4)) {
    return body4;
  }
  if (!(body4 instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body4) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error2 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body4.destroy(error2);
        throw error2;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    const error_ = error2 instanceof FetchBaseError ? error2 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    throw error_;
  }
  if (body4.readableEnded === true || body4._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve3, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve3(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error2) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error2.message}`, "system", error2));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error2) => {
      response.body.destroy(error2);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error2 = new Error("Premature close");
            error2.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error2);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve3(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body4 = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body4, responseOptions);
        resolve3(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body4 = (0, import_stream.pipeline)(body4, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body4, responseOptions);
        resolve3(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body4 = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body4, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body4, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body4, responseOptions);
          resolve3(response);
        });
        return;
      }
      if (codings === "br") {
        body4 = (0, import_stream.pipeline)(body4, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body4, responseOptions);
        resolve3(response);
        return;
      }
      response = new Response(body4, responseOptions);
      resolve3(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error2 = new Error("Premature close");
        error2.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error2);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, commonjsGlobal, src, dataUriToBuffer$1, ponyfill_es2018, POOL_SIZE$1, POOL_SIZE, _Blob, Blob2, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ponyfill_es2018 = { exports: {} };
    (function(module2, exports) {
      (function(global2, factory) {
        factory(exports);
      })(commonjsGlobal, function(exports2) {
        const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
        function noop3() {
          return void 0;
        }
        function getGlobals() {
          if (typeof self !== "undefined") {
            return self;
          } else if (typeof window !== "undefined") {
            return window;
          } else if (typeof commonjsGlobal !== "undefined") {
            return commonjsGlobal;
          }
          return void 0;
        }
        const globals = getGlobals();
        function typeIsObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        const rethrowAssertionErrorRejection = noop3;
        const originalPromise = Promise;
        const originalPromiseThen = Promise.prototype.then;
        const originalPromiseResolve = Promise.resolve.bind(originalPromise);
        const originalPromiseReject = Promise.reject.bind(originalPromise);
        function newPromise(executor) {
          return new originalPromise(executor);
        }
        function promiseResolvedWith(value) {
          return originalPromiseResolve(value);
        }
        function promiseRejectedWith(reason) {
          return originalPromiseReject(reason);
        }
        function PerformPromiseThen(promise, onFulfilled, onRejected) {
          return originalPromiseThen.call(promise, onFulfilled, onRejected);
        }
        function uponPromise(promise, onFulfilled, onRejected) {
          PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
        }
        function uponFulfillment(promise, onFulfilled) {
          uponPromise(promise, onFulfilled);
        }
        function uponRejection(promise, onRejected) {
          uponPromise(promise, void 0, onRejected);
        }
        function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
          return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
        }
        function setPromiseIsHandledToTrue(promise) {
          PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
        }
        const queueMicrotask = (() => {
          const globalQueueMicrotask = globals && globals.queueMicrotask;
          if (typeof globalQueueMicrotask === "function") {
            return globalQueueMicrotask;
          }
          const resolvedPromise = promiseResolvedWith(void 0);
          return (fn) => PerformPromiseThen(resolvedPromise, fn);
        })();
        function reflectCall(F, V, args) {
          if (typeof F !== "function") {
            throw new TypeError("Argument is not a function");
          }
          return Function.prototype.apply.call(F, V, args);
        }
        function promiseCall(F, V, args) {
          try {
            return promiseResolvedWith(reflectCall(F, V, args));
          } catch (value) {
            return promiseRejectedWith(value);
          }
        }
        const QUEUE_MAX_ARRAY_SIZE = 16384;
        class SimpleQueue {
          constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = {
              _elements: [],
              _next: void 0
            };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
          }
          get length() {
            return this._size;
          }
          push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
              newBack = {
                _elements: [],
                _next: void 0
              };
            }
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
              this._back = newBack;
              oldBack._next = newBack;
            }
            ++this._size;
          }
          shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements2 = oldFront._elements;
            const element = elements2[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
              newFront = oldFront._next;
              newCursor = 0;
            }
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
              this._front = newFront;
            }
            elements2[oldCursor] = void 0;
            return element;
          }
          forEach(callback2) {
            let i = this._cursor;
            let node = this._front;
            let elements2 = node._elements;
            while (i !== elements2.length || node._next !== void 0) {
              if (i === elements2.length) {
                node = node._next;
                elements2 = node._elements;
                i = 0;
                if (elements2.length === 0) {
                  break;
                }
              }
              callback2(elements2[i]);
              ++i;
            }
          }
          peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
          }
        }
        function ReadableStreamReaderGenericInitialize(reader, stream) {
          reader._ownerReadableStream = stream;
          stream._reader = reader;
          if (stream._state === "readable") {
            defaultReaderClosedPromiseInitialize(reader);
          } else if (stream._state === "closed") {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
          } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
          }
        }
        function ReadableStreamReaderGenericCancel(reader, reason) {
          const stream = reader._ownerReadableStream;
          return ReadableStreamCancel(stream, reason);
        }
        function ReadableStreamReaderGenericRelease(reader) {
          if (reader._ownerReadableStream._state === "readable") {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          }
          reader._ownerReadableStream._reader = void 0;
          reader._ownerReadableStream = void 0;
        }
        function readerLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released reader");
        }
        function defaultReaderClosedPromiseInitialize(reader) {
          reader._closedPromise = newPromise((resolve3, reject) => {
            reader._closedPromise_resolve = resolve3;
            reader._closedPromise_reject = reject;
          });
        }
        function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseReject(reader, reason);
        }
        function defaultReaderClosedPromiseInitializeAsResolved(reader) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseResolve(reader);
        }
        function defaultReaderClosedPromiseReject(reader, reason) {
          if (reader._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(reader._closedPromise);
          reader._closedPromise_reject(reason);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        function defaultReaderClosedPromiseResetToRejected(reader, reason) {
          defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
        }
        function defaultReaderClosedPromiseResolve(reader) {
          if (reader._closedPromise_resolve === void 0) {
            return;
          }
          reader._closedPromise_resolve(void 0);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
        const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
        const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
        const PullSteps = SymbolPolyfill("[[PullSteps]]");
        const NumberIsFinite = Number.isFinite || function(x) {
          return typeof x === "number" && isFinite(x);
        };
        const MathTrunc = Math.trunc || function(v) {
          return v < 0 ? Math.ceil(v) : Math.floor(v);
        };
        function isDictionary(x) {
          return typeof x === "object" || typeof x === "function";
        }
        function assertDictionary(obj, context) {
          if (obj !== void 0 && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertFunction(x, context) {
          if (typeof x !== "function") {
            throw new TypeError(`${context} is not a function.`);
          }
        }
        function isObject2(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        function assertObject(x, context) {
          if (!isObject2(x)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertRequiredArgument(x, position, context) {
          if (x === void 0) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
          }
        }
        function assertRequiredField(x, field, context) {
          if (x === void 0) {
            throw new TypeError(`${field} is required in '${context}'.`);
          }
        }
        function convertUnrestrictedDouble(value) {
          return Number(value);
        }
        function censorNegativeZero(x) {
          return x === 0 ? 0 : x;
        }
        function integerPart(x) {
          return censorNegativeZero(MathTrunc(x));
        }
        function convertUnsignedLongLongWithEnforceRange(value, context) {
          const lowerBound = 0;
          const upperBound = Number.MAX_SAFE_INTEGER;
          let x = Number(value);
          x = censorNegativeZero(x);
          if (!NumberIsFinite(x)) {
            throw new TypeError(`${context} is not a finite number`);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
          }
          if (!NumberIsFinite(x) || x === 0) {
            return 0;
          }
          return x;
        }
        function assertReadableStream(x, context) {
          if (!IsReadableStream(x)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
          }
        }
        function AcquireReadableStreamDefaultReader(stream) {
          return new ReadableStreamDefaultReader(stream);
        }
        function ReadableStreamAddReadRequest(stream, readRequest) {
          stream._reader._readRequests.push(readRequest);
        }
        function ReadableStreamFulfillReadRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readRequest = reader._readRequests.shift();
          if (done) {
            readRequest._closeSteps();
          } else {
            readRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadRequests(stream) {
          return stream._reader._readRequests.length;
        }
        function ReadableStreamHasDefaultReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamDefaultReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamDefaultReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve3, reject) => {
              resolvePromise = resolve3;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: () => resolvePromise({ value: void 0, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
              throw defaultReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultReader",
            configurable: true
          });
        }
        function IsReadableStreamDefaultReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultReader;
        }
        function ReadableStreamDefaultReaderRead(reader, readRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "closed") {
            readRequest._closeSteps();
          } else if (stream._state === "errored") {
            readRequest._errorSteps(stream._storedError);
          } else {
            stream._readableStreamController[PullSteps](readRequest);
          }
        }
        function defaultReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
        }
        const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
        }).prototype);
        class ReadableStreamAsyncIteratorImpl {
          constructor(reader, preventCancel) {
            this._ongoingPromise = void 0;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
          }
          next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
          }
          return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
          }
          _nextSteps() {
            if (this._isFinished) {
              return Promise.resolve({ value: void 0, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("iterate"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve3, reject) => {
              resolvePromise = resolve3;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => {
                this._ongoingPromise = void 0;
                queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
              },
              _closeSteps: () => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                resolvePromise({ value: void 0, done: true });
              },
              _errorSteps: (reason) => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                rejectPromise(reason);
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
          }
          _returnSteps(value) {
            if (this._isFinished) {
              return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("finish iterating"));
            }
            if (!this._preventCancel) {
              const result = ReadableStreamReaderGenericCancel(reader, value);
              ReadableStreamReaderGenericRelease(reader);
              return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
          }
        }
        const ReadableStreamAsyncIteratorPrototype = {
          next() {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            }
            return this._asyncIteratorImpl.next();
          },
          return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            }
            return this._asyncIteratorImpl.return(value);
          }
        };
        if (AsyncIteratorPrototype !== void 0) {
          Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
        }
        function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
          const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
          iterator._asyncIteratorImpl = impl;
          return iterator;
        }
        function IsReadableStreamAsyncIterator(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
            return false;
          }
          try {
            return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
          } catch (_a) {
            return false;
          }
        }
        function streamAsyncIteratorBrandCheckException(name) {
          return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
        }
        const NumberIsNaN = Number.isNaN || function(x) {
          return x !== x;
        };
        function CreateArrayFromList(elements2) {
          return elements2.slice();
        }
        function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
          new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
        }
        function TransferArrayBuffer(O) {
          return O;
        }
        function IsDetachedBuffer(O) {
          return false;
        }
        function ArrayBufferSlice(buffer, begin, end) {
          if (buffer.slice) {
            return buffer.slice(begin, end);
          }
          const length = end - begin;
          const slice = new ArrayBuffer(length);
          CopyDataBlockBytes(slice, 0, buffer, begin, length);
          return slice;
        }
        function IsNonNegativeNumber(v) {
          if (typeof v !== "number") {
            return false;
          }
          if (NumberIsNaN(v)) {
            return false;
          }
          if (v < 0) {
            return false;
          }
          return true;
        }
        function CloneAsUint8Array(O) {
          const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
          return new Uint8Array(buffer);
        }
        function DequeueValue(container) {
          const pair = container._queue.shift();
          container._queueTotalSize -= pair.size;
          if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
          }
          return pair.value;
        }
        function EnqueueValueWithSize(container, value, size) {
          if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
          }
          container._queue.push({ value, size });
          container._queueTotalSize += size;
        }
        function PeekQueueValue(container) {
          const pair = container._queue.peek();
          return pair.value;
        }
        function ResetQueue(container) {
          container._queue = new SimpleQueue();
          container._queueTotalSize = 0;
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("view");
            }
            return this._view;
          }
          respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respond");
            }
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(this._view.buffer))
              ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
          }
          respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respondWithNewView");
            }
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) {
              throw new TypeError("You can only respond with array buffer views");
            }
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: true },
          respondWithNewView: { enumerable: true },
          view: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBRequest",
            configurable: true
          });
        }
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("byobRequest");
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
          }
          get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("desiredSize");
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("close");
            }
            if (this._closeRequested) {
              throw new TypeError("The stream has already been closed; do not close it again!");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
          }
          enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("enqueue");
            }
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) {
              throw new TypeError("chunk must be an array buffer view");
            }
            if (chunk.byteLength === 0) {
              throw new TypeError("chunk must have non-zero byteLength");
            }
            if (chunk.buffer.byteLength === 0) {
              throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
              throw new TypeError("stream is closed or draining");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("error");
            }
            ReadableByteStreamControllerError(this, e);
          }
          [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
              const entry = this._queue.shift();
              this._queueTotalSize -= entry.byteLength;
              ReadableByteStreamControllerHandleQueueDrain(this);
              const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
              readRequest._chunkSteps(view);
              return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== void 0) {
              let buffer;
              try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
              } catch (bufferE) {
                readRequest._errorSteps(bufferE);
                return;
              }
              const pullIntoDescriptor = {
                buffer,
                bufferByteLength: autoAllocateChunkSize,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default"
              };
              this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
          }
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          byobRequest: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableByteStreamController",
            configurable: true
          });
        }
        function IsReadableByteStreamController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
            return false;
          }
          return x instanceof ReadableByteStreamController;
        }
        function IsReadableStreamBYOBRequest(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBRequest;
        }
        function ReadableByteStreamControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableByteStreamControllerError(controller, e);
          });
        }
        function ReadableByteStreamControllerClearPendingPullIntos(controller) {
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          controller._pendingPullIntos = new SimpleQueue();
        }
        function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
          let done = false;
          if (stream._state === "closed") {
            done = true;
          }
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          if (pullIntoDescriptor.readerType === "default") {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
          } else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
          }
        }
        function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
          const bytesFilled = pullIntoDescriptor.bytesFilled;
          const elementSize = pullIntoDescriptor.elementSize;
          return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
        }
        function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
          controller._queue.push({ buffer, byteOffset, byteLength });
          controller._queueTotalSize += byteLength;
        }
        function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
          const elementSize = pullIntoDescriptor.elementSize;
          const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
          const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
          const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
          const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
          let totalBytesToCopyRemaining = maxBytesToCopy;
          let ready = false;
          if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
          }
          const queue = controller._queue;
          while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
              queue.shift();
            } else {
              headOfQueue.byteOffset += bytesToCopy;
              headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
          }
          return ready;
        }
        function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
          pullIntoDescriptor.bytesFilled += size;
        }
        function ReadableByteStreamControllerHandleQueueDrain(controller) {
          if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
          } else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }
        }
        function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
          if (controller._byobRequest === null) {
            return;
          }
          controller._byobRequest._associatedReadableByteStreamController = void 0;
          controller._byobRequest._view = null;
          controller._byobRequest = null;
        }
        function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
          while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
              return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
          const stream = controller._controlledReadableByteStream;
          let elementSize = 1;
          if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
          }
          const ctor = view.constructor;
          const buffer = TransferArrayBuffer(view.buffer);
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: "byob"
          };
          if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
          }
          if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
          }
          if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
              ReadableByteStreamControllerHandleQueueDrain(controller);
              readIntoRequest._chunkSteps(filledView);
              return;
            }
            if (controller._closeRequested) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              readIntoRequest._errorSteps(e);
              return;
            }
          }
          controller._pendingPullIntos.push(pullIntoDescriptor);
          ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
          const stream = controller._controlledReadableByteStream;
          if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
              const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
          ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
          if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
          }
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
          if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
          }
          pullIntoDescriptor.bytesFilled -= remainderSize;
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
          ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            ReadableByteStreamControllerRespondInClosedState(controller);
          } else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerShiftPendingPullInto(controller) {
          const descriptor = controller._pendingPullIntos.shift();
          return descriptor;
        }
        function ReadableByteStreamControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return false;
          }
          if (controller._closeRequested) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableByteStreamControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
        }
        function ReadableByteStreamControllerClose(controller) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
          }
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              throw e;
            }
          }
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamClose(stream);
        }
        function ReadableByteStreamControllerEnqueue(controller, chunk) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          const buffer = chunk.buffer;
          const byteOffset = chunk.byteOffset;
          const byteLength = chunk.byteLength;
          const transferredBuffer = TransferArrayBuffer(buffer);
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer))
              ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
          }
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
              ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            } else {
              const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
              ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
          } else if (ReadableStreamHasBYOBReader(stream)) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
          } else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerError(controller, e) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return;
          }
          ReadableByteStreamControllerClearPendingPullIntos(controller);
          ResetQueue(controller);
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableByteStreamControllerGetBYOBRequest(controller) {
          if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
          }
          return controller._byobRequest;
        }
        function ReadableByteStreamControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableByteStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableByteStreamControllerRespond(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (bytesWritten !== 0) {
              throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
            }
          } else {
            if (bytesWritten === 0) {
              throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
              throw new RangeError("bytesWritten out of range");
            }
          }
          firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
          ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
        }
        function ReadableByteStreamControllerRespondWithNewView(controller, view) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (view.byteLength !== 0) {
              throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
            }
          } else {
            if (view.byteLength === 0) {
              throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
            }
          }
          if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError("The region specified by view does not match byobRequest");
          }
          if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError("The buffer of view has different capacity than byobRequest");
          }
          if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError("The region specified by view is larger than byobRequest");
          }
          firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
          ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
        }
        function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
          controller._controlledReadableByteStream = stream;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._byobRequest = null;
          controller._queue = controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._closeRequested = false;
          controller._started = false;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          controller._autoAllocateChunkSize = autoAllocateChunkSize;
          controller._pendingPullIntos = new SimpleQueue();
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableByteStreamControllerError(controller, r);
          });
        }
        function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
          const controller = Object.create(ReadableByteStreamController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingByteSource.start !== void 0) {
            startAlgorithm = () => underlyingByteSource.start(controller);
          }
          if (underlyingByteSource.pull !== void 0) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
          }
          if (underlyingByteSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
          }
          const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
          if (autoAllocateChunkSize === 0) {
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          }
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
        }
        function SetUpReadableStreamBYOBRequest(request, controller, view) {
          request._associatedReadableByteStreamController = controller;
          request._view = view;
        }
        function byobRequestBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
        }
        function byteStreamControllerBrandCheckException(name) {
          return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
        }
        function AcquireReadableStreamBYOBReader(stream) {
          return new ReadableStreamBYOBReader(stream);
        }
        function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
          stream._reader._readIntoRequests.push(readIntoRequest);
        }
        function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readIntoRequest = reader._readIntoRequests.shift();
          if (done) {
            readIntoRequest._closeSteps(chunk);
          } else {
            readIntoRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadIntoRequests(stream) {
          return stream._reader._readIntoRequests.length;
        }
        function ReadableStreamHasBYOBReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamBYOBReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamBYOBReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
              throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("read"));
            }
            if (!ArrayBuffer.isView(view)) {
              return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            }
            if (view.byteLength === 0) {
              return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            }
            if (view.buffer.byteLength === 0) {
              return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve3, reject) => {
              resolvePromise = resolve3;
              rejectPromise = reject;
            });
            const readIntoRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
              throw byobReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readIntoRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBReader",
            configurable: true
          });
        }
        function IsReadableStreamBYOBReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBReader;
        }
        function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "errored") {
            readIntoRequest._errorSteps(stream._storedError);
          } else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
          }
        }
        function byobReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
        }
        function ExtractHighWaterMark(strategy, defaultHWM) {
          const { highWaterMark } = strategy;
          if (highWaterMark === void 0) {
            return defaultHWM;
          }
          if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError("Invalid highWaterMark");
          }
          return highWaterMark;
        }
        function ExtractSizeAlgorithm(strategy) {
          const { size } = strategy;
          if (!size) {
            return () => 1;
          }
          return size;
        }
        function convertQueuingStrategy(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
          return {
            highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
            size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
          };
        }
        function convertQueuingStrategySize(fn, context) {
          assertFunction(fn, context);
          return (chunk) => convertUnrestrictedDouble(fn(chunk));
        }
        function convertUnderlyingSink(original, context) {
          assertDictionary(original, context);
          const abort = original === null || original === void 0 ? void 0 : original.abort;
          const close = original === null || original === void 0 ? void 0 : original.close;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          const write = original === null || original === void 0 ? void 0 : original.write;
          return {
            abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
          };
        }
        function convertUnderlyingSinkAbortCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSinkCloseCallback(fn, original, context) {
          assertFunction(fn, context);
          return () => promiseCall(fn, original, []);
        }
        function convertUnderlyingSinkStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertUnderlyingSinkWriteCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        function assertWritableStream(x, context) {
          if (!IsWritableStream(x)) {
            throw new TypeError(`${context} is not a WritableStream.`);
          }
        }
        function isAbortSignal2(value) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          try {
            return typeof value.aborted === "boolean";
          } catch (_a) {
            return false;
          }
        }
        const supportsAbortController = typeof AbortController === "function";
        function createAbortController() {
          if (supportsAbortController) {
            return new AbortController();
          }
          return void 0;
        }
        class WritableStream {
          constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === void 0) {
              rawUnderlyingSink = null;
            } else {
              assertObject(rawUnderlyingSink, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== void 0) {
              throw new RangeError("Invalid type is specified");
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
          }
          get locked() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("locked");
            }
            return IsWritableStreamLocked(this);
          }
          abort(reason = void 0) {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("abort"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            }
            return WritableStreamAbort(this, reason);
          }
          close() {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("close"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamClose(this);
          }
          getWriter() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("getWriter");
            }
            return AcquireWritableStreamDefaultWriter(this);
          }
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          getWriter: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStream",
            configurable: true
          });
        }
        function AcquireWritableStreamDefaultWriter(stream) {
          return new WritableStreamDefaultWriter(stream);
        }
        function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(WritableStream.prototype);
          InitializeWritableStream(stream);
          const controller = Object.create(WritableStreamDefaultController.prototype);
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function InitializeWritableStream(stream) {
          stream._state = "writable";
          stream._storedError = void 0;
          stream._writer = void 0;
          stream._writableStreamController = void 0;
          stream._writeRequests = new SimpleQueue();
          stream._inFlightWriteRequest = void 0;
          stream._closeRequest = void 0;
          stream._inFlightCloseRequest = void 0;
          stream._pendingAbortRequest = void 0;
          stream._backpressure = false;
        }
        function IsWritableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
            return false;
          }
          return x instanceof WritableStream;
        }
        function IsWritableStreamLocked(stream) {
          if (stream._writer === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamAbort(stream, reason) {
          var _a;
          if (stream._state === "closed" || stream._state === "errored") {
            return promiseResolvedWith(void 0);
          }
          stream._writableStreamController._abortReason = reason;
          (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseResolvedWith(void 0);
          }
          if (stream._pendingAbortRequest !== void 0) {
            return stream._pendingAbortRequest._promise;
          }
          let wasAlreadyErroring = false;
          if (state === "erroring") {
            wasAlreadyErroring = true;
            reason = void 0;
          }
          const promise = newPromise((resolve3, reject) => {
            stream._pendingAbortRequest = {
              _promise: void 0,
              _resolve: resolve3,
              _reject: reject,
              _reason: reason,
              _wasAlreadyErroring: wasAlreadyErroring
            };
          });
          stream._pendingAbortRequest._promise = promise;
          if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
          }
          return promise;
        }
        function WritableStreamClose(stream) {
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
          }
          const promise = newPromise((resolve3, reject) => {
            const closeRequest = {
              _resolve: resolve3,
              _reject: reject
            };
            stream._closeRequest = closeRequest;
          });
          const writer = stream._writer;
          if (writer !== void 0 && stream._backpressure && state === "writable") {
            defaultWriterReadyPromiseResolve(writer);
          }
          WritableStreamDefaultControllerClose(stream._writableStreamController);
          return promise;
        }
        function WritableStreamAddWriteRequest(stream) {
          const promise = newPromise((resolve3, reject) => {
            const writeRequest = {
              _resolve: resolve3,
              _reject: reject
            };
            stream._writeRequests.push(writeRequest);
          });
          return promise;
        }
        function WritableStreamDealWithRejection(stream, error2) {
          const state = stream._state;
          if (state === "writable") {
            WritableStreamStartErroring(stream, error2);
            return;
          }
          WritableStreamFinishErroring(stream);
        }
        function WritableStreamStartErroring(stream, reason) {
          const controller = stream._writableStreamController;
          stream._state = "erroring";
          stream._storedError = reason;
          const writer = stream._writer;
          if (writer !== void 0) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
          }
          if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
          }
        }
        function WritableStreamFinishErroring(stream) {
          stream._state = "errored";
          stream._writableStreamController[ErrorSteps]();
          const storedError = stream._storedError;
          stream._writeRequests.forEach((writeRequest) => {
            writeRequest._reject(storedError);
          });
          stream._writeRequests = new SimpleQueue();
          if (stream._pendingAbortRequest === void 0) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const abortRequest = stream._pendingAbortRequest;
          stream._pendingAbortRequest = void 0;
          if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
          uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          });
        }
        function WritableStreamFinishInFlightWrite(stream) {
          stream._inFlightWriteRequest._resolve(void 0);
          stream._inFlightWriteRequest = void 0;
        }
        function WritableStreamFinishInFlightWriteWithError(stream, error2) {
          stream._inFlightWriteRequest._reject(error2);
          stream._inFlightWriteRequest = void 0;
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamFinishInFlightClose(stream) {
          stream._inFlightCloseRequest._resolve(void 0);
          stream._inFlightCloseRequest = void 0;
          const state = stream._state;
          if (state === "erroring") {
            stream._storedError = void 0;
            if (stream._pendingAbortRequest !== void 0) {
              stream._pendingAbortRequest._resolve();
              stream._pendingAbortRequest = void 0;
            }
          }
          stream._state = "closed";
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseResolve(writer);
          }
        }
        function WritableStreamFinishInFlightCloseWithError(stream, error2) {
          stream._inFlightCloseRequest._reject(error2);
          stream._inFlightCloseRequest = void 0;
          if (stream._pendingAbortRequest !== void 0) {
            stream._pendingAbortRequest._reject(error2);
            stream._pendingAbortRequest = void 0;
          }
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamCloseQueuedOrInFlight(stream) {
          if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamHasOperationMarkedInFlight(stream) {
          if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamMarkCloseRequestInFlight(stream) {
          stream._inFlightCloseRequest = stream._closeRequest;
          stream._closeRequest = void 0;
        }
        function WritableStreamMarkFirstWriteRequestInFlight(stream) {
          stream._inFlightWriteRequest = stream._writeRequests.shift();
        }
        function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
          if (stream._closeRequest !== void 0) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = void 0;
          }
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
          }
        }
        function WritableStreamUpdateBackpressure(stream, backpressure) {
          const writer = stream._writer;
          if (writer !== void 0 && backpressure !== stream._backpressure) {
            if (backpressure) {
              defaultWriterReadyPromiseReset(writer);
            } else {
              defaultWriterReadyPromiseResolve(writer);
            }
          }
          stream._backpressure = backpressure;
        }
        class WritableStreamDefaultWriter {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
              if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                defaultWriterReadyPromiseInitialize(this);
              } else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
              }
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
              defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
              defaultWriterReadyPromiseInitializeAsResolved(this);
              defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
              const storedError = stream._storedError;
              defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
              defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
          }
          get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("desiredSize");
            }
            if (this._ownerWritableStream === void 0) {
              throw defaultWriterLockException("desiredSize");
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
          }
          get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            }
            return this._readyPromise;
          }
          abort(reason = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("abort"));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
          }
          close() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("close"));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamDefaultWriterClose(this);
          }
          releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("releaseLock");
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return;
            }
            WritableStreamDefaultWriterRelease(this);
          }
          write(chunk = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("write to"));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
          }
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          releaseLock: { enumerable: true },
          write: { enumerable: true },
          closed: { enumerable: true },
          desiredSize: { enumerable: true },
          ready: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultWriter",
            configurable: true
          });
        }
        function IsWritableStreamDefaultWriter(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultWriter;
        }
        function WritableStreamDefaultWriterAbort(writer, reason) {
          const stream = writer._ownerWritableStream;
          return WritableStreamAbort(stream, reason);
        }
        function WritableStreamDefaultWriterClose(writer) {
          const stream = writer._ownerWritableStream;
          return WritableStreamClose(stream);
        }
        function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          return WritableStreamDefaultWriterClose(writer);
        }
        function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error2) {
          if (writer._closedPromiseState === "pending") {
            defaultWriterClosedPromiseReject(writer, error2);
          } else {
            defaultWriterClosedPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error2) {
          if (writer._readyPromiseState === "pending") {
            defaultWriterReadyPromiseReject(writer, error2);
          } else {
            defaultWriterReadyPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterGetDesiredSize(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (state === "errored" || state === "erroring") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
        }
        function WritableStreamDefaultWriterRelease(writer) {
          const stream = writer._ownerWritableStream;
          const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
          WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
          WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
          stream._writer = void 0;
          writer._ownerWritableStream = void 0;
        }
        function WritableStreamDefaultWriterWrite(writer, chunk) {
          const stream = writer._ownerWritableStream;
          const controller = stream._writableStreamController;
          const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
          if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException("write to"));
          }
          const state = stream._state;
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
          }
          if (state === "erroring") {
            return promiseRejectedWith(stream._storedError);
          }
          const promise = WritableStreamAddWriteRequest(stream);
          WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
          return promise;
        }
        const closeSentinel = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("abortReason");
            }
            return this._abortReason;
          }
          get signal() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("signal");
            }
            if (this._abortController === void 0) {
              throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            }
            return this._abortController.signal;
          }
          error(e = void 0) {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("error");
            }
            const state = this._controlledWritableStream._state;
            if (state !== "writable") {
              return;
            }
            WritableStreamDefaultControllerError(this, e);
          }
          [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [ErrorSteps]() {
            ResetQueue(this);
          }
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          error: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultController",
            configurable: true
          });
        }
        function IsWritableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultController;
        }
        function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledWritableStream = stream;
          stream._writableStreamController = controller;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._abortReason = void 0;
          controller._abortController = createAbortController();
          controller._started = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._writeAlgorithm = writeAlgorithm;
          controller._closeAlgorithm = closeAlgorithm;
          controller._abortAlgorithm = abortAlgorithm;
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
          const startResult = startAlgorithm();
          const startPromise = promiseResolvedWith(startResult);
          uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (r) => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
          });
        }
        function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(WritableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let writeAlgorithm = () => promiseResolvedWith(void 0);
          let closeAlgorithm = () => promiseResolvedWith(void 0);
          let abortAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSink.start !== void 0) {
            startAlgorithm = () => underlyingSink.start(controller);
          }
          if (underlyingSink.write !== void 0) {
            writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
          }
          if (underlyingSink.close !== void 0) {
            closeAlgorithm = () => underlyingSink.close();
          }
          if (underlyingSink.abort !== void 0) {
            abortAlgorithm = (reason) => underlyingSink.abort(reason);
          }
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function WritableStreamDefaultControllerClearAlgorithms(controller) {
          controller._writeAlgorithm = void 0;
          controller._closeAlgorithm = void 0;
          controller._abortAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function WritableStreamDefaultControllerClose(controller) {
          EnqueueValueWithSize(controller, closeSentinel, 0);
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
          try {
            return controller._strategySizeAlgorithm(chunk);
          } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
          }
        }
        function WritableStreamDefaultControllerGetDesiredSize(controller) {
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
          try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
          } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
          }
          const stream = controller._controlledWritableStream;
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
          }
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
          const stream = controller._controlledWritableStream;
          if (!controller._started) {
            return;
          }
          if (stream._inFlightWriteRequest !== void 0) {
            return;
          }
          const state = stream._state;
          if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
          }
          if (controller._queue.length === 0) {
            return;
          }
          const value = PeekQueueValue(controller);
          if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
          } else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
          }
        }
        function WritableStreamDefaultControllerErrorIfNeeded(controller, error2) {
          if (controller._controlledWritableStream._state === "writable") {
            WritableStreamDefaultControllerError(controller, error2);
          }
        }
        function WritableStreamDefaultControllerProcessClose(controller) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkCloseRequestInFlight(stream);
          DequeueValue(controller);
          const sinkClosePromise = controller._closeAlgorithm();
          WritableStreamDefaultControllerClearAlgorithms(controller);
          uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
          }, (reason) => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkFirstWriteRequestInFlight(stream);
          const sinkWritePromise = controller._writeAlgorithm(chunk);
          uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
              const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
              WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (reason) => {
            if (stream._state === "writable") {
              WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerGetBackpressure(controller) {
          const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
          return desiredSize <= 0;
        }
        function WritableStreamDefaultControllerError(controller, error2) {
          const stream = controller._controlledWritableStream;
          WritableStreamDefaultControllerClearAlgorithms(controller);
          WritableStreamStartErroring(stream, error2);
        }
        function streamBrandCheckException$2(name) {
          return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
        }
        function defaultControllerBrandCheckException$2(name) {
          return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
        }
        function defaultWriterBrandCheckException(name) {
          return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
        }
        function defaultWriterLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released writer");
        }
        function defaultWriterClosedPromiseInitialize(writer) {
          writer._closedPromise = newPromise((resolve3, reject) => {
            writer._closedPromise_resolve = resolve3;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
          });
        }
        function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseReject(writer, reason);
        }
        function defaultWriterClosedPromiseInitializeAsResolved(writer) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseResolve(writer);
        }
        function defaultWriterClosedPromiseReject(writer, reason) {
          if (writer._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._closedPromise);
          writer._closedPromise_reject(reason);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "rejected";
        }
        function defaultWriterClosedPromiseResetToRejected(writer, reason) {
          defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterClosedPromiseResolve(writer) {
          if (writer._closedPromise_resolve === void 0) {
            return;
          }
          writer._closedPromise_resolve(void 0);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "resolved";
        }
        function defaultWriterReadyPromiseInitialize(writer) {
          writer._readyPromise = newPromise((resolve3, reject) => {
            writer._readyPromise_resolve = resolve3;
            writer._readyPromise_reject = reject;
          });
          writer._readyPromiseState = "pending";
        }
        function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseReject(writer, reason);
        }
        function defaultWriterReadyPromiseInitializeAsResolved(writer) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseResolve(writer);
        }
        function defaultWriterReadyPromiseReject(writer, reason) {
          if (writer._readyPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._readyPromise);
          writer._readyPromise_reject(reason);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "rejected";
        }
        function defaultWriterReadyPromiseReset(writer) {
          defaultWriterReadyPromiseInitialize(writer);
        }
        function defaultWriterReadyPromiseResetToRejected(writer, reason) {
          defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterReadyPromiseResolve(writer) {
          if (writer._readyPromise_resolve === void 0) {
            return;
          }
          writer._readyPromise_resolve(void 0);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "fulfilled";
        }
        const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
        function isDOMExceptionConstructor(ctor) {
          if (!(typeof ctor === "function" || typeof ctor === "object")) {
            return false;
          }
          try {
            new ctor();
            return true;
          } catch (_a) {
            return false;
          }
        }
        function createDOMExceptionPolyfill() {
          const ctor = function DOMException2(message, name) {
            this.message = message || "";
            this.name = name || "Error";
            if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
            }
          };
          ctor.prototype = Object.create(Error.prototype);
          Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
          return ctor;
        }
        const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
        function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
          const reader = AcquireReadableStreamDefaultReader(source);
          const writer = AcquireWritableStreamDefaultWriter(dest);
          source._disturbed = true;
          let shuttingDown = false;
          let currentWrite = promiseResolvedWith(void 0);
          return newPromise((resolve3, reject) => {
            let abortAlgorithm;
            if (signal !== void 0) {
              abortAlgorithm = () => {
                const error2 = new DOMException$1("Aborted", "AbortError");
                const actions = [];
                if (!preventAbort) {
                  actions.push(() => {
                    if (dest._state === "writable") {
                      return WritableStreamAbort(dest, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                if (!preventCancel) {
                  actions.push(() => {
                    if (source._state === "readable") {
                      return ReadableStreamCancel(source, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error2);
              };
              if (signal.aborted) {
                abortAlgorithm();
                return;
              }
              signal.addEventListener("abort", abortAlgorithm);
            }
            function pipeLoop() {
              return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                  if (done) {
                    resolveLoop();
                  } else {
                    PerformPromiseThen(pipeStep(), next, rejectLoop);
                  }
                }
                next(false);
              });
            }
            function pipeStep() {
              if (shuttingDown) {
                return promiseResolvedWith(true);
              }
              return PerformPromiseThen(writer._readyPromise, () => {
                return newPromise((resolveRead, rejectRead) => {
                  ReadableStreamDefaultReaderRead(reader, {
                    _chunkSteps: (chunk) => {
                      currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop3);
                      resolveRead(false);
                    },
                    _closeSteps: () => resolveRead(true),
                    _errorSteps: rejectRead
                  });
                });
              });
            }
            isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
              if (!preventAbort) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesClosed(source, reader._closedPromise, () => {
              if (!preventClose) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
              } else {
                shutdown();
              }
            });
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
              const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
              } else {
                shutdown(true, destClosed);
              }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
              const oldCurrentWrite = currentWrite;
              return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
            }
            function isOrBecomesErrored(stream, promise, action) {
              if (stream._state === "errored") {
                action(stream._storedError);
              } else {
                uponRejection(promise, action);
              }
            }
            function isOrBecomesClosed(stream, promise, action) {
              if (stream._state === "closed") {
                action();
              } else {
                uponFulfillment(promise, action);
              }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
              } else {
                doTheRest();
              }
              function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
              }
            }
            function shutdown(isError, error2) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error2));
              } else {
                finalize(isError, error2);
              }
            }
            function finalize(isError, error2) {
              WritableStreamDefaultWriterRelease(writer);
              ReadableStreamReaderGenericRelease(reader);
              if (signal !== void 0) {
                signal.removeEventListener("abort", abortAlgorithm);
              }
              if (isError) {
                reject(error2);
              } else {
                resolve3(void 0);
              }
            }
          });
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("desiredSize");
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("close");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits close");
            }
            ReadableStreamDefaultControllerClose(this);
          }
          enqueue(chunk = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("enqueue");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits enqueue");
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("error");
            }
            ReadableStreamDefaultControllerError(this, e);
          }
          [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const chunk = DequeueValue(this);
              if (this._closeRequested && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
              } else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
              }
              readRequest._chunkSteps(chunk);
            } else {
              ReadableStreamAddReadRequest(stream, readRequest);
              ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
          }
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultController",
            configurable: true
          });
        }
        function IsReadableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultController;
        }
        function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableStreamDefaultControllerError(controller, e);
          });
        }
        function ReadableStreamDefaultControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableStream;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableStreamDefaultControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function ReadableStreamDefaultControllerClose(controller) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          controller._closeRequested = true;
          if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
          }
        }
        function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
          } else {
            let chunkSize;
            try {
              chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
              ReadableStreamDefaultControllerError(controller, chunkSizeE);
              throw chunkSizeE;
            }
            try {
              EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
              ReadableStreamDefaultControllerError(controller, enqueueE);
              throw enqueueE;
            }
          }
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        function ReadableStreamDefaultControllerError(controller, e) {
          const stream = controller._controlledReadableStream;
          if (stream._state !== "readable") {
            return;
          }
          ResetQueue(controller);
          ReadableStreamDefaultControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableStreamDefaultControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableStreamDefaultControllerHasBackpressure(controller) {
          if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
          }
          return true;
        }
        function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
          const state = controller._controlledReadableStream._state;
          if (!controller._closeRequested && state === "readable") {
            return true;
          }
          return false;
        }
        function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledReadableStream = stream;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._started = false;
          controller._closeRequested = false;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableStreamDefaultControllerError(controller, r);
          });
        }
        function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSource.start !== void 0) {
            startAlgorithm = () => underlyingSource.start(controller);
          }
          if (underlyingSource.pull !== void 0) {
            pullAlgorithm = () => underlyingSource.pull(controller);
          }
          if (underlyingSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
          }
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function defaultControllerBrandCheckException$1(name) {
          return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
        }
        function ReadableStreamTee(stream, cloneForBranch2) {
          if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
          }
          return ReadableStreamDefaultTee(stream);
        }
        function ReadableStreamDefaultTee(stream, cloneForBranch2) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve3) => {
            resolveCancelPromise = resolve3;
          });
          function pullAlgorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  const chunk2 = chunk;
                  if (!canceled1) {
                    ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
          }
          branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
          branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
          uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          });
          return [branch1, branch2];
        }
        function ReadableByteStreamTee(stream) {
          let reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve3) => {
            resolveCancelPromise = resolve3;
          });
          function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r) => {
              if (thisReader !== reader) {
                return;
              }
              ReadableByteStreamControllerError(branch1._readableStreamController, r);
              ReadableByteStreamControllerError(branch2._readableStreamController, r);
              if (!canceled1 || !canceled2) {
                resolveCancelPromise(void 0);
              }
            });
          }
          function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamDefaultReader(stream);
              forwardReaderError(reader);
            }
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  let chunk2 = chunk;
                  if (!canceled1 && !canceled2) {
                    try {
                      chunk2 = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                  }
                  if (!canceled1) {
                    ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableByteStreamControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableByteStreamControllerClose(branch2._readableStreamController);
                }
                if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                }
                if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
          }
          function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamBYOBReader(stream);
              forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const byobCanceled = forBranch2 ? canceled2 : canceled1;
                  const otherCanceled = forBranch2 ? canceled1 : canceled2;
                  if (!otherCanceled) {
                    let clonedChunk;
                    try {
                      clonedChunk = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                    if (!byobCanceled) {
                      ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                    }
                    ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                  } else if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                });
              },
              _closeSteps: (chunk) => {
                reading = false;
                const byobCanceled = forBranch2 ? canceled2 : canceled1;
                const otherCanceled = forBranch2 ? canceled1 : canceled2;
                if (!byobCanceled) {
                  ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                }
                if (!otherCanceled) {
                  ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                }
                if (chunk !== void 0) {
                  if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                  if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                  }
                }
                if (!byobCanceled || !otherCanceled) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
          }
          function pull1Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(void 0);
          }
          function pull2Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
            return;
          }
          branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
          branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
          forwardReaderError(reader);
          return [branch1, branch2];
        }
        function convertUnderlyingDefaultOrByteSource(source, context) {
          assertDictionary(source, context);
          const original = source;
          const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
          const cancel = original === null || original === void 0 ? void 0 : original.cancel;
          const pull = original === null || original === void 0 ? void 0 : original.pull;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          return {
            autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
          };
        }
        function convertUnderlyingSourceCancelCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSourcePullCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertUnderlyingSourceStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertReadableStreamType(type, context) {
          type = `${type}`;
          if (type !== "bytes") {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
          }
          return type;
        }
        function convertReaderOptions(options2, context) {
          assertDictionary(options2, context);
          const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
          return {
            mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
          };
        }
        function convertReadableStreamReaderMode(mode, context) {
          mode = `${mode}`;
          if (mode !== "byob") {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
          }
          return mode;
        }
        function convertIteratorOptions(options2, context) {
          assertDictionary(options2, context);
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          return { preventCancel: Boolean(preventCancel) };
        }
        function convertPipeOptions(options2, context) {
          assertDictionary(options2, context);
          const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
          const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
          if (signal !== void 0) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
          }
          return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
          };
        }
        function assertAbortSignal(signal, context) {
          if (!isAbortSignal2(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
          }
        }
        function convertReadableWritablePair(pair, context) {
          assertDictionary(pair, context);
          const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
          assertRequiredField(readable, "readable", "ReadableWritablePair");
          assertReadableStream(readable, `${context} has member 'readable' that`);
          const writable2 = pair === null || pair === void 0 ? void 0 : pair.writable;
          assertRequiredField(writable2, "writable", "ReadableWritablePair");
          assertWritableStream(writable2, `${context} has member 'writable' that`);
          return { readable, writable: writable2 };
        }
        class ReadableStream2 {
          constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === void 0) {
              rawUnderlyingSource = null;
            } else {
              assertObject(rawUnderlyingSource, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
              if (strategy.size !== void 0) {
                throw new RangeError("The strategy for a byte stream cannot have a size function");
              }
              const highWaterMark = ExtractHighWaterMark(strategy, 0);
              SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
              const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
              const highWaterMark = ExtractHighWaterMark(strategy, 1);
              SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
          }
          get locked() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("locked");
            }
            return IsReadableStreamLocked(this);
          }
          cancel(reason = void 0) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            }
            return ReadableStreamCancel(this, reason);
          }
          getReader(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("getReader");
            }
            const options2 = convertReaderOptions(rawOptions, "First parameter");
            if (options2.mode === void 0) {
              return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
          }
          pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("pipeThrough");
            }
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options2 = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            }
            if (IsWritableStreamLocked(transform.writable)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
          }
          pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            }
            if (destination === void 0) {
              return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
              return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options2;
            try {
              options2 = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
              return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            }
            if (IsWritableStreamLocked(destination)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            }
            return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
          }
          tee() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("tee");
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
          }
          values(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("values");
            }
            const options2 = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
          }
        }
        Object.defineProperties(ReadableStream2.prototype, {
          cancel: { enumerable: true },
          getReader: { enumerable: true },
          pipeThrough: { enumerable: true },
          pipeTo: { enumerable: true },
          tee: { enumerable: true },
          values: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStream",
            configurable: true
          });
        }
        if (typeof SymbolPolyfill.asyncIterator === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream2.prototype.values,
            writable: true,
            configurable: true
          });
        }
        function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableByteStreamController.prototype);
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
          return stream;
        }
        function InitializeReadableStream(stream) {
          stream._state = "readable";
          stream._reader = void 0;
          stream._storedError = void 0;
          stream._disturbed = false;
        }
        function IsReadableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
            return false;
          }
          return x instanceof ReadableStream2;
        }
        function IsReadableStreamLocked(stream) {
          if (stream._reader === void 0) {
            return false;
          }
          return true;
        }
        function ReadableStreamCancel(stream, reason) {
          stream._disturbed = true;
          if (stream._state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (stream._state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          ReadableStreamClose(stream);
          const reader = stream._reader;
          if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._closeSteps(void 0);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
          const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
          return transformPromiseWith(sourceCancelPromise, noop3);
        }
        function ReadableStreamClose(stream) {
          stream._state = "closed";
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseResolve(reader);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
          }
        }
        function ReadableStreamError(stream, e) {
          stream._state = "errored";
          stream._storedError = e;
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseReject(reader, e);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
          } else {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
        }
        function streamBrandCheckException$1(name) {
          return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
        }
        function convertQueuingStrategyInit(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
          return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
          };
        }
        const byteLengthSizeFunction = (chunk) => {
          return chunk.byteLength;
        };
        Object.defineProperty(byteLengthSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class ByteLengthQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("highWaterMark");
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("size");
            }
            return byteLengthSizeFunction;
          }
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "ByteLengthQueuingStrategy",
            configurable: true
          });
        }
        function byteLengthBrandCheckException(name) {
          return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
        }
        function IsByteLengthQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof ByteLengthQueuingStrategy;
        }
        const countSizeFunction = () => {
          return 1;
        };
        Object.defineProperty(countSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class CountQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "CountQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("highWaterMark");
            }
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("size");
            }
            return countSizeFunction;
          }
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "CountQueuingStrategy",
            configurable: true
          });
        }
        function countBrandCheckException(name) {
          return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
        }
        function IsCountQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof CountQueuingStrategy;
        }
        function convertTransformer(original, context) {
          assertDictionary(original, context);
          const flush = original === null || original === void 0 ? void 0 : original.flush;
          const readableType = original === null || original === void 0 ? void 0 : original.readableType;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const transform = original === null || original === void 0 ? void 0 : original.transform;
          const writableType = original === null || original === void 0 ? void 0 : original.writableType;
          return {
            flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType,
            start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
          };
        }
        function convertTransformerFlushCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertTransformerStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertTransformerTransformCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        class TransformStream {
          constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === void 0) {
              rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== void 0) {
              throw new RangeError("Invalid readableType specified");
            }
            if (transformer.writableType !== void 0) {
              throw new RangeError("Invalid writableType specified");
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve3) => {
              startPromise_resolve = resolve3;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== void 0) {
              startPromise_resolve(transformer.start(this._transformStreamController));
            } else {
              startPromise_resolve(void 0);
            }
          }
          get readable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("readable");
            }
            return this._readable;
          }
          get writable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("writable");
            }
            return this._writable;
          }
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: true },
          writable: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStream",
            configurable: true
          });
        }
        function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
          function startAlgorithm() {
            return startPromise;
          }
          function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
          }
          function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
          }
          function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
          }
          stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
          function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
          }
          function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(void 0);
          }
          stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
          stream._backpressure = void 0;
          stream._backpressureChangePromise = void 0;
          stream._backpressureChangePromise_resolve = void 0;
          TransformStreamSetBackpressure(stream, true);
          stream._transformStreamController = void 0;
        }
        function IsTransformStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
            return false;
          }
          return x instanceof TransformStream;
        }
        function TransformStreamError(stream, e) {
          ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
          TransformStreamErrorWritableAndUnblockWrite(stream, e);
        }
        function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
          TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
          WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
          if (stream._backpressure) {
            TransformStreamSetBackpressure(stream, false);
          }
        }
        function TransformStreamSetBackpressure(stream, backpressure) {
          if (stream._backpressureChangePromise !== void 0) {
            stream._backpressureChangePromise_resolve();
          }
          stream._backpressureChangePromise = newPromise((resolve3) => {
            stream._backpressureChangePromise_resolve = resolve3;
          });
          stream._backpressure = backpressure;
        }
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("desiredSize");
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
          }
          enqueue(chunk = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("enqueue");
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
          }
          error(reason = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("error");
            }
            TransformStreamDefaultControllerError(this, reason);
          }
          terminate() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("terminate");
            }
            TransformStreamDefaultControllerTerminate(this);
          }
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: true },
          error: { enumerable: true },
          terminate: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStreamDefaultController",
            configurable: true
          });
        }
        function IsTransformStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
            return false;
          }
          return x instanceof TransformStreamDefaultController;
        }
        function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
          controller._controlledTransformStream = stream;
          stream._transformStreamController = controller;
          controller._transformAlgorithm = transformAlgorithm;
          controller._flushAlgorithm = flushAlgorithm;
        }
        function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
          const controller = Object.create(TransformStreamDefaultController.prototype);
          let transformAlgorithm = (chunk) => {
            try {
              TransformStreamDefaultControllerEnqueue(controller, chunk);
              return promiseResolvedWith(void 0);
            } catch (transformResultE) {
              return promiseRejectedWith(transformResultE);
            }
          };
          let flushAlgorithm = () => promiseResolvedWith(void 0);
          if (transformer.transform !== void 0) {
            transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
          }
          if (transformer.flush !== void 0) {
            flushAlgorithm = () => transformer.flush(controller);
          }
          SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
        }
        function TransformStreamDefaultControllerClearAlgorithms(controller) {
          controller._transformAlgorithm = void 0;
          controller._flushAlgorithm = void 0;
        }
        function TransformStreamDefaultControllerEnqueue(controller, chunk) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError("Readable side is not in a state that permits enqueue");
          }
          try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
          } catch (e) {
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
          }
          const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
          if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
          }
        }
        function TransformStreamDefaultControllerError(controller, e) {
          TransformStreamError(controller._controlledTransformStream, e);
        }
        function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
          const transformPromise = controller._transformAlgorithm(chunk);
          return transformPromiseWith(transformPromise, void 0, (r) => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
          });
        }
        function TransformStreamDefaultControllerTerminate(controller) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          ReadableStreamDefaultControllerClose(readableController);
          const error2 = new TypeError("TransformStream terminated");
          TransformStreamErrorWritableAndUnblockWrite(stream, error2);
        }
        function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
          const controller = stream._transformStreamController;
          if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
              const writable2 = stream._writable;
              const state = writable2._state;
              if (state === "erroring") {
                throw writable2._storedError;
              }
              return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        }
        function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
          TransformStreamError(stream, reason);
          return promiseResolvedWith(void 0);
        }
        function TransformStreamDefaultSinkCloseAlgorithm(stream) {
          const readable = stream._readable;
          const controller = stream._transformStreamController;
          const flushPromise = controller._flushAlgorithm();
          TransformStreamDefaultControllerClearAlgorithms(controller);
          return transformPromiseWith(flushPromise, () => {
            if (readable._state === "errored") {
              throw readable._storedError;
            }
            ReadableStreamDefaultControllerClose(readable._readableStreamController);
          }, (r) => {
            TransformStreamError(stream, r);
            throw readable._storedError;
          });
        }
        function TransformStreamDefaultSourcePullAlgorithm(stream) {
          TransformStreamSetBackpressure(stream, false);
          return stream._backpressureChangePromise;
        }
        function defaultControllerBrandCheckException(name) {
          return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
        }
        function streamBrandCheckException(name) {
          return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
        }
        exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
        exports2.CountQueuingStrategy = CountQueuingStrategy;
        exports2.ReadableByteStreamController = ReadableByteStreamController;
        exports2.ReadableStream = ReadableStream2;
        exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
        exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
        exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
        exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
        exports2.TransformStream = TransformStream;
        exports2.TransformStreamDefaultController = TransformStreamDefaultController;
        exports2.WritableStream = WritableStream;
        exports2.WritableStreamDefaultController = WritableStreamDefaultController;
        exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    })(ponyfill_es2018, ponyfill_es2018.exports);
    POOL_SIZE$1 = 65536;
    if (!globalThis.ReadableStream) {
      try {
        const process2 = require("node:process");
        const { emitWarning } = process2;
        try {
          process2.emitWarning = () => {
          };
          Object.assign(globalThis, require("node:stream/web"));
          process2.emitWarning = emitWarning;
        } catch (error2) {
          process2.emitWarning = emitWarning;
          throw error2;
        }
      } catch (error2) {
        Object.assign(globalThis, ponyfill_es2018.exports);
      }
    }
    try {
      const { Blob: Blob3 } = require("buffer");
      if (Blob3 && !Blob3.prototype.stream) {
        Blob3.prototype.stream = function name(params) {
          let position = 0;
          const blob = this;
          return new ReadableStream({
            type: "bytes",
            async pull(ctrl) {
              const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
              const buffer = await chunk.arrayBuffer();
              position += buffer.byteLength;
              ctrl.enqueue(new Uint8Array(buffer));
              if (position === blob.size) {
                ctrl.close();
              }
            }
          });
        };
      }
    } catch (error2) {
    }
    POOL_SIZE = 65536;
    _Blob = class Blob {
      #parts = [];
      #type = "";
      #size = 0;
      constructor(blobParts = [], options2 = {}) {
        if (typeof blobParts !== "object" || blobParts === null) {
          throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
        }
        if (typeof blobParts[Symbol.iterator] !== "function") {
          throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
        }
        if (typeof options2 !== "object" && typeof options2 !== "function") {
          throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
        }
        if (options2 === null)
          options2 = {};
        const encoder = new TextEncoder();
        for (const element of blobParts) {
          let part;
          if (ArrayBuffer.isView(element)) {
            part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
          } else if (element instanceof ArrayBuffer) {
            part = new Uint8Array(element.slice(0));
          } else if (element instanceof Blob) {
            part = element;
          } else {
            part = encoder.encode(element);
          }
          this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
          this.#parts.push(part);
        }
        const type = options2.type === void 0 ? "" : String(options2.type);
        this.#type = /^[\x20-\x7E]*$/.test(type) ? type : "";
      }
      get size() {
        return this.#size;
      }
      get type() {
        return this.#type;
      }
      async text() {
        const decoder = new TextDecoder();
        let str = "";
        for await (const part of toIterator(this.#parts, false)) {
          str += decoder.decode(part, { stream: true });
        }
        str += decoder.decode();
        return str;
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of toIterator(this.#parts, false)) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        const it = toIterator(this.#parts, true);
        return new globalThis.ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = await it.next();
            chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
          },
          async cancel() {
            await it.return();
          }
        });
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = this.#parts;
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          if (added >= span) {
            break;
          }
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            let chunk;
            if (ArrayBuffer.isView(part)) {
              chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.byteLength;
            } else {
              chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.size;
            }
            relativeEnd -= size2;
            blobParts.push(chunk);
            relativeStart = 0;
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        blob.#size = span;
        blob.#parts = blobParts;
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(_Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Blob2 = _Blob;
    Blob$1 = Blob2;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body4, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body4 === null) {
          body4 = null;
        } else if (isURLSearchParameters(body4)) {
          body4 = Buffer.from(body4.toString());
        } else if (isBlob(body4))
          ;
        else if (Buffer.isBuffer(body4))
          ;
        else if (import_util.types.isAnyArrayBuffer(body4)) {
          body4 = Buffer.from(body4);
        } else if (ArrayBuffer.isView(body4)) {
          body4 = Buffer.from(body4.buffer, body4.byteOffset, body4.byteLength);
        } else if (body4 instanceof import_stream.default)
          ;
        else if (isFormData(body4)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body4 = import_stream.default.Readable.from(formDataIterator(body4, boundary));
        } else {
          body4 = Buffer.from(String(body4));
        }
        this[INTERNALS$2] = {
          body: body4,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body4 instanceof import_stream.default) {
          body4.on("error", (error_) => {
            const error2 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body: body4 } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body4 instanceof import_stream.default && typeof body4.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body4.pipe(p1);
        body4.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body4 = p2;
      }
      return body4;
    };
    extractContentType = (body4, request) => {
      if (body4 === null) {
        return null;
      }
      if (typeof body4 === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body4)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body4)) {
        return body4.type || null;
      }
      if (Buffer.isBuffer(body4) || import_util.types.isAnyArrayBuffer(body4) || ArrayBuffer.isView(body4)) {
        return null;
      }
      if (body4 && typeof body4.getBoundary === "function") {
        return `multipart/form-data;boundary=${body4.getBoundary()}`;
      }
      if (isFormData(body4)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body4 instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body: body4 } = request;
      if (body4 === null) {
        return 0;
      }
      if (isBlob(body4)) {
        return body4.size;
      }
      if (Buffer.isBuffer(body4)) {
        return body4.length;
      }
      if (body4 && typeof body4.getLengthSync === "function") {
        return body4.hasKnownLength && body4.hasKnownLength() ? body4.getLengthSync() : null;
      }
      if (isFormData(body4)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body: body4 }) => {
      if (body4 === null) {
        dest.end();
      } else if (isBlob(body4)) {
        import_stream.default.Readable.from(body4.stream()).pipe(dest);
      } else if (Buffer.isBuffer(body4)) {
        dest.write(body4);
        dest.end();
      } else {
        body4.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const error2 = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw error2;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error2 = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_CHAR" });
        throw error2;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback2, thisArg = void 0) {
        for (const name of this.keys()) {
          Reflect.apply(callback2, thisArg, [this.get(name), name, this]);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body4 = null, options2 = {}) {
        super(body4, options2);
        const status = options2.status != null ? options2.status : 200;
        const headers = new Headers(options2.headers);
        if (body4 !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body4);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          type: "default",
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get type() {
        return this[INTERNALS$1].type;
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          type: this.type,
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      static error() {
        const response = new Response(null, { status: 0, statusText: "" });
        response[INTERNALS$1].type = "error";
        return response;
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      type: { enumerable: true },
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-vercel/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-vercel/files/shims.js"() {
    init_install_fetch();
  }
});

// .svelte-kit/output/server/chunks/__layout-ac9b8360.js
var layout_ac9b8360_exports = {};
__export(layout_ac9b8360_exports, {
  default: () => _layout
});
var css, _layout;
var init_layout_ac9b8360 = __esm({
  ".svelte-kit/output/server/chunks/__layout-ac9b8360.js"() {
    init_shims();
    init_app_2fdd64e5();
    css = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-3106f7.svelte-3106f7.svelte-3106f7,.svelte-3106f7.svelte-3106f7.svelte-3106f7::before,.svelte-3106f7.svelte-3106f7.svelte-3106f7::after{box-sizing:border-box}.svelte-3106f7.svelte-3106f7.svelte-3106f7{margin:0}img.svelte-3106f7.svelte-3106f7.svelte-3106f7{display:block;max-width:100%}h1.svelte-3106f7.svelte-3106f7.svelte-3106f7,h3.svelte-3106f7.svelte-3106f7.svelte-3106f7,h4.svelte-3106f7.svelte-3106f7.svelte-3106f7{overflow-wrap:break-word}.container.svelte-3106f7.svelte-3106f7.svelte-3106f7{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}:root{scroll-behavior:smooth;line-height:1.3;font-size:1rem;overflow-x:hidden;color:var(--primary-100);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif, 'Apple Color Emoji'}@media screen and (min-width: 400px){:root{font-size:1.2rem}}@media screen and (min-width: 600px){:root{font-size:1.5rem}}.sitetitle.svelte-3106f7.svelte-3106f7.svelte-3106f7{color:var(--primary-100);font-size:2.7em;font-family:'Poppins', sans-serif}.sitetitle.svelte-3106f7 a.svelte-3106f7.svelte-3106f7{position:relative;font-weight:700;color:inherit;text-decoration:none;width:100%}.sitetitle.svelte-3106f7 a.svelte-3106f7.svelte-3106f7:before{z-index:1;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--primary-100)}.sitetitle.svelte-3106f7 a.svelte-3106f7.svelte-3106f7:hover:before{display:block}header.svelte-3106f7.svelte-3106f7.svelte-3106f7{margin-top:var(--spacing-unit);position:relative;display:grid;grid-template-columns:3fr 1fr;align-items:center}header.svelte-3106f7 div.svelte-3106f7.svelte-3106f7:first-child{justify-self:start;align-items:center}header.svelte-3106f7 div.svelte-3106f7.svelte-3106f7:nth-child(2){justify-self:end;display:grid;align-items:center}header.svelte-3106f7 div.svelte-3106f7:nth-child(2) a.svelte-3106f7{position:relative;color:var(--primary-100);font-weight:500;text-decoration:none;width:100%}header.svelte-3106f7 div.svelte-3106f7:nth-child(2) a.svelte-3106f7:before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--primary-100)}header.svelte-3106f7 div.svelte-3106f7:nth-child(2) a.svelte-3106f7:hover:before{display:block}.container.svelte-3106f7.svelte-3106f7.svelte-3106f7{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.wrapperForFooter.svelte-3106f7.svelte-3106f7.svelte-3106f7{min-height:calc(100vh - 10rem);margin-bottom:0}.footerWrapper.svelte-3106f7.svelte-3106f7.svelte-3106f7{height:5rem;background:transparent;width:100vw;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;margin-bottom:0;position:relative}footer.svelte-3106f7.svelte-3106f7.svelte-3106f7{display:grid;align-items:start;justify-items:center;grid-gap:var(--spacing-unit);grid-template-columns:1fr 1fr;height:10rem;z-index:-2 !important;background:transparent;max-width:1300px;margin:auto;padding:calc(var(--spacing-unit) * 2)}footer.svelte-3106f7 div.svelte-3106f7.svelte-3106f7:nth-child(3){display:none}footer.svelte-3106f7 div:first-child span.svelte-3106f7.svelte-3106f7{display:inline}@media screen and (min-width: 900px){footer.svelte-3106f7.svelte-3106f7.svelte-3106f7{grid-template-columns:1fr 1fr 1fr}footer.svelte-3106f7 div.svelte-3106f7.svelte-3106f7:nth-child(3){display:block}footer.svelte-3106f7 div:first-child span.svelte-3106f7.svelte-3106f7{display:none}}footer.svelte-3106f7 h3.svelte-3106f7.svelte-3106f7{color:var(--primary-100)}footer.svelte-3106f7 h3 a.svelte-3106f7.svelte-3106f7{position:relative;font-weight:700;color:inherit;text-decoration:none}footer.svelte-3106f7 h3 a.svelte-3106f7.svelte-3106f7:before{z-index:1;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--primary-100)}footer.svelte-3106f7 h3 a.svelte-3106f7.svelte-3106f7:hover:before{display:block}footer.svelte-3106f7 h4.svelte-3106f7.svelte-3106f7{font-weight:500}.footer-wave.svelte-3106f7.svelte-3106f7.svelte-3106f7{margin:auto;width:100%;transform:translateY(2rem)}a.svelte-3106f7.svelte-3106f7.svelte-3106f7{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none;width:100%}a.svelte-3106f7.svelte-3106f7.svelte-3106f7:before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}a.svelte-3106f7.svelte-3106f7.svelte-3106f7:hover:before{display:block}",
      map: null
    };
    _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { open = false } = $$props;
      if ($$props.open === void 0 && $$bindings.open && open !== void 0)
        $$bindings.open(open);
      $$result.css.add(css);
      return `<div class="${"wrapperForFooter svelte-3106f7"}"><div class="${"container svelte-3106f7"}"><header class="${"svelte-3106f7"}"><div class="${"svelte-3106f7"}"><h1 class="${"sitetitle svelte-3106f7"}"><a href="${"/"}" class="${"svelte-3106f7"}">koen codes</a></h1></div></header></div>
    
    <main class="${"svelte-3106f7"}">${slots.default ? slots.default({}) : ``}</main>

  <div class="${"footerWrapper svelte-3106f7"}"><img alt="${"wavy line to separate content from footer"}" class="${"footer-wave svelte-3106f7"}" src="${"../footer-waveline.svg"}">
    <footer class="${"svelte-3106f7"}"><div class="${"svelte-3106f7"}"><h3 class="${"svelte-3106f7"}"><a href="${"/"}" class="${"svelte-3106f7"}">koen.codes</a></h3>
        <h4 class="${"svelte-3106f7"}">Thanks for reading!</h4>
        <span class="${"svelte-3106f7"}"><b class="${"svelte-3106f7"}">Contact: </b><a href="${"mailto:koen@\u2600\uFE0F.gg"}" class="${"svelte-3106f7"}">koen@\u2600\uFE0F.gg</a></span></div>
      <div class="${"svelte-3106f7"}"><h3 class="${"svelte-3106f7"}">Links</h3>
        <h4 class="${"svelte-3106f7"}"><a href="${"/blog"}" class="${"svelte-3106f7"}">Blog</a></h4>
        <h4 class="${"svelte-3106f7"}"><a href="${"#projects"}" class="${"svelte-3106f7"}">Projects</a></h4></div>
      <div class="${"svelte-3106f7"}"><h3 class="${"svelte-3106f7"}">Contact</h3>
        <a href="${"mailto:koen@\u2600\uFE0F.gg"}" class="${"svelte-3106f7"}">koen@\u2600\uFE0F.gg</a></div></footer></div>
  
</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/Seo-726ce9e2.js
var Seo;
var init_Seo_726ce9e2 = __esm({
  ".svelte-kit/output/server/chunks/Seo-726ce9e2.js"() {
    init_shims();
    init_app_2fdd64e5();
    Seo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { metaDescription: metaDescription7 } = $$props;
      let { pageTitle: pageTitle6 } = $$props;
      if ($$props.metaDescription === void 0 && $$bindings.metaDescription && metaDescription7 !== void 0)
        $$bindings.metaDescription(metaDescription7);
      if ($$props.pageTitle === void 0 && $$bindings.pageTitle && pageTitle6 !== void 0)
        $$bindings.pageTitle(pageTitle6);
      return `${$$result.head += `${$$result.title = `<title>Koen Codes \xB7 ${escape(pageTitle6)}</title>`, ""}<meta name="${"description"}" content="${"The online turf of a programming noob and medicine student. " + escape(metaDescription7)}" data-svelte="svelte-xdke5o"><meta name="${"robots"}" content="${"index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"}" data-svelte="svelte-xdke5o"><html lang="${"en"}" data-svelte="svelte-xdke5o"></html>`, ""}`;
    });
  }
});

// .svelte-kit/output/server/chunks/__error-656dbd13.js
var error_656dbd13_exports = {};
__export(error_656dbd13_exports, {
  default: () => _error
});
var css2, pageTitle, metaDescription, _error;
var init_error_656dbd13 = __esm({
  ".svelte-kit/output/server/chunks/__error-656dbd13.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_Seo_726ce9e2();
    css2 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-1aidxcn.svelte-1aidxcn,.svelte-1aidxcn.svelte-1aidxcn::before,.svelte-1aidxcn.svelte-1aidxcn::after{box-sizing:border-box}.svelte-1aidxcn.svelte-1aidxcn{margin:0}p.svelte-1aidxcn.svelte-1aidxcn,h1.svelte-1aidxcn.svelte-1aidxcn{overflow-wrap:break-word}.container.svelte-1aidxcn.svelte-1aidxcn{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-1aidxcn.svelte-1aidxcn{max-width:1300px;margin:auto;position:relative;padding:0 var(--spacing-unit) 0;display:grid;align-items:center;text-align:center}.container.svelte-1aidxcn div.svelte-1aidxcn{margin-top:calc(var(--spacing-unit) * 4)}a.svelte-1aidxcn.svelte-1aidxcn{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none}a.svelte-1aidxcn.svelte-1aidxcn:before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}a.svelte-1aidxcn.svelte-1aidxcn:hover:before{display:block}",
      map: null
    };
    pageTitle = "Error!";
    metaDescription = "Error page. Page not found.";
    _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      $$result.css.add(css2);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle, metaDescription }, {}, {})}
<main class="${"container svelte-1aidxcn"}"><div class="${"svelte-1aidxcn"}"><h1 class="${"svelte-1aidxcn"}">Page not found.</h1>
        <p class="${"svelte-1aidxcn"}">You are in grave danger. <a href="${"/"}" class="${"svelte-1aidxcn"}">Get back to safety</a>.</p></div>
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/Date-ebd36ae7.js
var Date_1;
var init_Date_ebd36ae7 = __esm({
  ".svelte-kit/output/server/chunks/Date-ebd36ae7.js"() {
    init_shims();
    init_app_2fdd64e5();
    Date_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { date } = $$props;
      if ($$props.date === void 0 && $$bindings.date && date !== void 0)
        $$bindings.date(date);
      return `${escape(new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }))}`;
    });
  }
});

// .svelte-kit/output/server/chunks/blog-2fdca3f8.js
var css3, Blog;
var init_blog_2fdca3f8 = __esm({
  ".svelte-kit/output/server/chunks/blog-2fdca3f8.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_Seo_726ce9e2();
    init_Date_ebd36ae7();
    css3 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-18miny2,.svelte-18miny2::before,.svelte-18miny2::after{box-sizing:border-box}.svelte-18miny2{margin:0}img.svelte-18miny2{display:block;max-width:100%}h1.svelte-18miny2{overflow-wrap:break-word}.container.svelte-18miny2{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-18miny2{max-width:60ch;margin:auto;position:relative;padding:var(--spacing-unit)}.post-hero.svelte-18miny2{padding:calc(var(--spacing-unit) * 4) 0 calc(var(--spacing-unit) * 2);display:grid;align-items:center;position:relative}h1.svelte-18miny2{text-align:center;margin:var(--spacing-unit) 0 calc(var(--spacing-unit) * 4)}.date.svelte-18miny2{text-align:center}.background.svelte-18miny2{position:absolute;z-index:-1;max-width:30rem;left:50%;top:50%;transform:translate(-50%, -60%)}.post-content.svelte-18miny2 a{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none}.post-content.svelte-18miny2 a::before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}.post-content.svelte-18miny2 a:hover::before{display:block}",
      map: null
    };
    Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { title } = $$props;
      let { snippet } = $$props;
      let { date } = $$props;
      let { tags } = $$props;
      let { backgroundNumber = 4 } = $$props;
      let pageTitle6 = title;
      let metaDescription7 = snippet;
      let backgroundLink = "/postBackground-" + backgroundNumber + ".svg";
      if ($$props.title === void 0 && $$bindings.title && title !== void 0)
        $$bindings.title(title);
      if ($$props.snippet === void 0 && $$bindings.snippet && snippet !== void 0)
        $$bindings.snippet(snippet);
      if ($$props.date === void 0 && $$bindings.date && date !== void 0)
        $$bindings.date(date);
      if ($$props.tags === void 0 && $$bindings.tags && tags !== void 0)
        $$bindings.tags(tags);
      if ($$props.backgroundNumber === void 0 && $$bindings.backgroundNumber && backgroundNumber !== void 0)
        $$bindings.backgroundNumber(backgroundNumber);
      $$result.css.add(css3);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle6, metaDescription: metaDescription7 }, {}, {})}

<div class="${"container svelte-18miny2"}"><div class="${"post-hero svelte-18miny2"}"><img alt="${"colored shapes to illustrate the title"}" class="${"background svelte-18miny2"}"${add_attribute("src", backgroundLink, 0)}>
        <span class="${"date svelte-18miny2"}">${validate_component(Date_1, "Date").$$render($$result, { date }, {}, {})}</span>
        <h1 class="${"svelte-18miny2"}">${escape(title)}</h1></div>
    <div class="${"post-content svelte-18miny2"}">${slots.default ? slots.default({}) : ``}</div>
</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/211209-globalstyles-ffb20f6d.js
var globalstyles_ffb20f6d_exports = {};
__export(globalstyles_ffb20f6d_exports, {
  default: () => _211209_globalstyles,
  metadata: () => metadata
});
var metadata, _211209_globalstyles;
var init_globalstyles_ffb20f6d = __esm({
  ".svelte-kit/output/server/chunks/211209-globalstyles-ffb20f6d.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_blog_2fdca3f8();
    init_Seo_726ce9e2();
    init_Date_ebd36ae7();
    metadata = {
      "title": "Global styles in SvelteKit",
      "tags": ["SvelteKit"],
      "date": "2021-12-09T00:00:00.000Z",
      "snippet": "Set up Svelte Preprocess to have global SCSS variables in your SvelteKit project.",
      "backgroundNumber": 3,
      "layout": "blog"
    };
    _211209_globalstyles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(Blog, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata), {}, {
        default: () => `<p>Svelte styles are scoped to their components by default, but global styles can be very useful for things like color schemes, dark mode and CSS resets. This article shows you how to install and implement Svelte Preprocess, and then prepend your your <code>.scss</code> file full of global styles. It\u2019s not difficult to set up! </p>
<p>To start, create a new folder at <code>src/lib/</code> and call it <code>styles.scss</code>. Put all of your global styles in there. </p>
<p>In the terminal, go your project folder and install <code>svelte-preprocess</code> and <code>node-sass</code>.</p>
<pre class="${"language-bash"}"><!-- HTML_TAG_START -->${`<code class="language-bash"><span class="token function">npm</span> <span class="token function">install</span> svelte-preprocess node-sass</code>`}<!-- HTML_TAG_END --></pre>
<p>Now go to your <code>svelte.config.js</code> file, and import <code>svelte-preprocess</code>, <code>dirname</code> and <code>fileURLToPath</code> like so:</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js"><span class="token keyword">import</span> SveltePreprocess <span class="token keyword">from</span> <span class="token string">'svelte-preprocess'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> path<span class="token punctuation">,</span> <span class="token punctuation">&#123;</span> dirname <span class="token punctuation">&#125;</span> <span class="token keyword">from</span> <span class="token string">'path'</span>
<span class="token keyword">import</span> <span class="token punctuation">&#123;</span> fileURLToPath <span class="token punctuation">&#125;</span> <span class="token keyword">from</span> <span class="token string">'url'</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Next, we will add two constants which will help us retrieve the path to our <code>styles.scss</code> file. </p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js"><span class="token keyword">const</span> filePath <span class="token operator">=</span> <span class="token function">dirname</span><span class="token punctuation">(</span><span class="token function">fileURLToPath</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">.</span>url<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> sassPath <span class="token operator">=</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>filePath<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token string">/src/styles/</span><span class="token template-punctuation string">&#96;</span></span></code>`}<!-- HTML_TAG_END --></pre>
<p><code>filePath</code> retrieves the path to our project folder, by converting <code>import.meta.url</code> to a usable string. <code>sassPath</code> then specifies the route to where our <code>styles.scss</code> file is. </p>
<p>Now, we need to tell Svelte Preprocess to prepend our <code>styles.scss</code> file. To do that, add the following code to <code>const config</code>.</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js">    preprocess<span class="token operator">:</span> <span class="token function">SveltePreprocess</span><span class="token punctuation">(</span><span class="token punctuation">&#123;</span>
        scss<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
            prependData<span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">@import '</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>sassPath<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token string">styles.scss';</span><span class="token template-punctuation string">&#96;</span></span>
        <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></code>`}<!-- HTML_TAG_END --></pre>
<p>If you have MDsveX installed, this will look a bit different:</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js">preprocess<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token function">SveltePreprocess</span><span class="token punctuation">(</span><span class="token punctuation">&#123;</span>
					scss<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
						prependData<span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">@import '</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>sassPath<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token string">styles.scss';</span><span class="token template-punctuation string">&#96;</span></span>
					<span class="token punctuation">&#125;</span>
				<span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> 
				<span class="token function">mdsvex</span><span class="token punctuation">(</span>mdsvexConfig<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">,</span></code>`}<!-- HTML_TAG_END --></pre>
<p>That\u2019s it! Everything inside of your <code>styles.scss</code> file will now be available globally.</p>`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/211211-code-highlighting-889d29fe.js
var code_highlighting_889d29fe_exports = {};
__export(code_highlighting_889d29fe_exports, {
  default: () => _211211_code_highlighting,
  metadata: () => metadata2
});
var metadata2, _211211_code_highlighting;
var init_code_highlighting_889d29fe = __esm({
  ".svelte-kit/output/server/chunks/211211-code-highlighting-889d29fe.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_blog_2fdca3f8();
    init_Seo_726ce9e2();
    init_Date_ebd36ae7();
    metadata2 = {
      "title": "MDsveX: styling your markdown files with layouts and highlighting.",
      "tags": ["SvelteKit", "MDsveX"],
      "date": "2021-12-11T00:00:00.000Z",
      "snippet": "Use MDsveX layouts and syntax highlighting to style markdown files.",
      "layout": "blog"
    };
    _211211_code_highlighting = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(Blog, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata2), {}, {
        default: () => `<h2>Layouts</h2>
<p>If you\u2019ve ever worked with <a href="${"https://jekyllrb.com"}" target="${"_blank"}" rel="${"noopener"}">Jekyll</a>, you\u2019re probably already familiar with the way MDsveX layouts work. </p>
<ol><li>Create a layout file with a <code>&lt;slot&gt;</code> element where the Markdown comes. </li>
<li>Reference the layout file in the frontmatter of your <code>.md</code> file. </li></ol>
<p>The biggest difference is that you need to tell MDsveX where you have stored your layouts.</p>
<p>A layout is like a special Svelte component that takes Markdown instead of HTML. </p>
<h3>Creating layout files</h3>
<p>First, create a <code>layouts</code> folder \u2013 mine is inside of <code>lib</code>, and add your first <code>.svelte</code> layout to it.</p>
<p>After you declare them, frontmatter variables from <code>.md</code> files will be available inside of the layout as props. They can be used just like you normally would.</p>
<p>Add a <code>&lt;slot&gt;&lt;/slot&gt;</code> element to tell MDsveX where to look for Markdown. That\u2019s it.</p>
<p>A sample layout:</p>
<pre class="${"language-html"}"><!-- HTML_TAG_START -->${`<code class="language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">></span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">export</span> <span class="token keyword">let</span> title<span class="token punctuation">;</span>
    <span class="token keyword">export</span> <span class="token keyword">let</span> snippet<span class="token punctuation">;</span>
    <span class="token keyword">export</span> <span class="token keyword">let</span> date<span class="token punctuation">;</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">></span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>main</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span>&#123;title&#125;<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span>&#123;date&#125;<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">></span></span>&#123;snippet&#125;<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>article</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>slot</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>slot</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>article</span><span class="token punctuation">></span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>main</span><span class="token punctuation">></span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>style</span><span class="token punctuation">></span></span><span class="token style"><span class="token language-css">
    <span class="token selector">h1</span> <span class="token punctuation">&#123;</span>
        <span class="token property">color</span><span class="token punctuation">:</span> red<span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>style</span><span class="token punctuation">></span></span></code>`}<!-- HTML_TAG_END --></pre>
<h3>Telling MDsveX where your layouts are</h3>
<p>Inside of <code>mdsvex.config.js</code>, or inside the <code>mdsvex()</code> function of <code>svelte.config.js</code>, add the following:</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js">layout<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
		blog<span class="token operator">:</span> <span class="token string">'src/lib/layouts/blog.svelte'</span><span class="token punctuation">,</span>
        _<span class="token operator">:</span> <span class="token string">'src/lib/layouts/default.svelte'</span><span class="token punctuation">,</span>
	<span class="token punctuation">&#125;</span><span class="token punctuation">,</span></code>`}<!-- HTML_TAG_END --></pre>
<p>The <code>&#39;_&#39;</code> is the default layout, which will be used if the appointed layout doesn\u2019t work. </p>
<h3>Add your layout to the frontmatter</h3>
<p>Just add <code>layouts: blog</code> to your frontmatter and you\u2019re all set.</p>
<pre class="${"language-yaml"}"><!-- HTML_TAG_START -->${`<code class="language-yaml"><span class="token punctuation">---</span>
<span class="token key atrule">title</span><span class="token punctuation">:</span> Global styles in SvelteKit
<span class="token key atrule">tags</span><span class="token punctuation">:</span> 
    <span class="token punctuation">-</span> SvelteKit
<span class="token key atrule">date</span><span class="token punctuation">:</span> <span class="token datetime number">2021-12-09</span>
<span class="token key atrule">snippet</span><span class="token punctuation">:</span> <span class="token string">"Shows you how to set up Svelte Preprocess to allow global SCSS variables in your SvelteKit project."</span>
<span class="token key atrule">backgroundNumber</span><span class="token punctuation">:</span> <span class="token number">3</span>
<span class="token key atrule">layout</span><span class="token punctuation">:</span> blog
<span class="token punctuation">---</span></code>`}<!-- HTML_TAG_END --></pre>
<p><code>backgroundNumber</code> allows me to pick between a couple of illustrations for around the post title. </p>
<h2>Highlighting</h2>
<p>Adding highlighting is a piece of cake since it is an out-of-the-box feature. All you need to do is add a theme. <a href="${"https://github.com/PrismJS/prism-themes"}" target="${"_blank"}" rel="${"noopener"}">This repo</a> has a lot of options.</p>
<p>To add a theme, save the css file and and import it inside of <code>__layout.svelte</code> as follows:</p>
<pre class="${"language-html"}"><!-- HTML_TAG_START -->${`<code class="language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">lang</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>ts<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">import</span>  <span class="token string">"../styles/code.css"</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">></span></span></code>`}<!-- HTML_TAG_END --></pre>
<p>Inside of your Markdown file, code blocks are created by typing three backticks (\`\`\`) followed immediately by the name of the language (shorthands like \u2018js\u2019 and \u2018md\u2019 work). Then the code. Then again three backticks. </p>
<p>That\u2019s it!</p>`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-7278b074.js
var index_7278b074_exports = {};
__export(index_7278b074_exports, {
  default: () => Routes,
  load: () => load
});
var css$3, TagCloud, css$2, Project, css$1, Art, css4, allPosts, body, load, pageTitle2, metaDescription2, Routes;
var init_index_7278b074 = __esm({
  ".svelte-kit/output/server/chunks/index-7278b074.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_Seo_726ce9e2();
    css$3 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-wfodly,.svelte-wfodly::before,.svelte-wfodly::after{box-sizing:border-box}.svelte-wfodly{margin:0}a.svelte-wfodly{color:inherit;padding:0.5rem 0.85rem 0.5rem;margin:0.5rem 0.5rem 0rem 0.5rem;border-radius:10px;background:var(--primary-400);text-decoration:none}a.svelte-wfodly:hover{background:var(--primary-300);color:white}div.svelte-wfodly{margin:var(--spacing-unit) var(--spacing-unit) var(--spacing-unit) 0;padding:var(--spacing-unit) var(--spacing-unit) var(--spacing-unit) 0}",
      map: null
    };
    TagCloud = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let tagArray = ["SvelteKit"];
      $$result.css.add(css$3);
      return `<div class="${"svelte-wfodly"}">${each(tagArray, (tag) => `<a${add_attribute("href", `/tags/${tag}`, 0)} class="${"svelte-wfodly"}">${escape(tag)}</a>`)}
</div>`;
    });
    css$2 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-om2cji.svelte-om2cji,.svelte-om2cji.svelte-om2cji::before,.svelte-om2cji.svelte-om2cji::after{box-sizing:border-box}.svelte-om2cji.svelte-om2cji{margin:0}img.svelte-om2cji.svelte-om2cji{display:block;max-width:100%}p.svelte-om2cji.svelte-om2cji,h3.svelte-om2cji.svelte-om2cji{overflow-wrap:break-word}p.svelte-om2cji a{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none}p.svelte-om2cji a:before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}p.svelte-om2cji a:hover:before{display:block}h3.svelte-om2cji img{display:inline;max-height:0.75rem;margin:0;padding:0;transform:translateY(-0.25rem);max-width:1rem}.divlink.svelte-om2cji.svelte-om2cji{text-decoration:none;color:inherit}.divlink.svelte-om2cji:hover h3.svelte-om2cji{color:var(--primary-300)}.divlink.svelte-om2cji:hover .project.svelte-om2cji{transform:translate(-0.05rem, -0.05rem);transition:var(--transition-time) ease;box-shadow:var(--shadow-elevation-mediumhigh)}.project.svelte-om2cji.svelte-om2cji{overflow:hidden;border-radius:var(--corner-unit);position:relative;background:white;box-shadow:var(--shadow-elevation-medium)}.project.svelte-om2cji div.svelte-om2cji:first-child{display:grid;place-items:center;background:var(--gray-500);position:relative;padding:var(--spacing-unit)}.project.svelte-om2cji div:first-child div.svelte-om2cji{width:50%;max-height:5rem}.project.svelte-om2cji div:first-child div img.svelte-om2cji{max-height:5rem}.project.svelte-om2cji div.svelte-om2cji:nth-child(2){padding:var(--spacing-unit)}.project.svelte-om2cji div:nth-child(2) p.svelte-om2cji{padding:0;margin:0}.project.svelte-om2cji div:nth-child(2) h3.svelte-om2cji{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}",
      map: null
    };
    Project = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { title = "a project" } = $$props;
      let { src: src2 = "/" } = $$props;
      let { description = "a project about something." } = $$props;
      let { img = "&#128161" } = $$props;
      let { outside = false } = $$props;
      if ($$props.title === void 0 && $$bindings.title && title !== void 0)
        $$bindings.title(title);
      if ($$props.src === void 0 && $$bindings.src && src2 !== void 0)
        $$bindings.src(src2);
      if ($$props.description === void 0 && $$bindings.description && description !== void 0)
        $$bindings.description(description);
      if ($$props.img === void 0 && $$bindings.img && img !== void 0)
        $$bindings.img(img);
      if ($$props.outside === void 0 && $$bindings.outside && outside !== void 0)
        $$bindings.outside(outside);
      $$result.css.add(css$2);
      return `${outside === true ? `<a class="${"divlink svelte-om2cji"}" target="${"_blank"}" rel="${"noopener"}"${add_attribute("href", src2, 0)}><div class="${"project svelte-om2cji"}"><div class="${"svelte-om2cji"}"><div class="${"svelte-om2cji"}"><img alt="${"simple brushed line decoration"}"${add_attribute("src", img, 0)} class="${"svelte-om2cji"}"></div></div>
                <div class="${"svelte-om2cji"}"><h3 class="${"svelte-om2cji"}"><!-- HTML_TAG_START -->${title}<!-- HTML_TAG_END --></h3>
                    <p class="${"svelte-om2cji"}"><!-- HTML_TAG_START -->${description}<!-- HTML_TAG_END --></p></div></div></a>` : `<a class="${"divlink svelte-om2cji"}"${add_attribute("href", src2, 0)}><div class="${"project svelte-om2cji"}"><div class="${"svelte-om2cji"}"><div class="${"svelte-om2cji"}"><img alt="${"simple brushed line decoration"}"${add_attribute("src", img, 0)} class="${"svelte-om2cji"}"></div></div>
                <div class="${"svelte-om2cji"}"><h3 class="${"svelte-om2cji"}"><!-- HTML_TAG_START -->${title}<!-- HTML_TAG_END --></h3>
                    <p class="${"svelte-om2cji"}"><!-- HTML_TAG_START -->${description}<!-- HTML_TAG_END --></p></div></div></a>`}`;
    });
    css$1 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-19aqmj9,.svelte-19aqmj9::before,.svelte-19aqmj9::after{box-sizing:border-box}.svelte-19aqmj9{margin:0}img.svelte-19aqmj9{display:block;max-width:100%}@keyframes svelte-19aqmj9-wiggle{0%{transform:rotate(0turn)}33%{transform:rotate(0.012turn)}66%{transform:rotate(-0.012turn)}}img.svelte-19aqmj9{width:10em;height:auto;margin-top:0;animation:svelte-19aqmj9-wiggle 500ms;animation-delay:500ms;animation-fill-mode:both}@media screen and (max-width: 600px){img.svelte-19aqmj9{width:6em}}@media screen and (max-width: 900px){img.svelte-19aqmj9{width:8em}}",
      map: null
    };
    Art = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      $$result.css.add(css$1);
      return `<img alt="${"man with map on top of 404-error statue trying to figure out what to do"}" src="${"Basicvignet.svg"}" class="${"svelte-19aqmj9"}">



`;
    });
    css4 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku::before,.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku::after{box-sizing:border-box}.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{margin:0}p.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,h1.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,h2.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,h3.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,h4.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{overflow-wrap:break-word}.container.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}@keyframes svelte-1eoiiku-appear{0%{opacity:0}100%{opacity:1}}.grid1-hero.svelte-1eoiiku nav a.svelte-1eoiiku.svelte-1eoiiku:first-child{animation:svelte-1eoiiku-appear 500ms;animation-delay:500ms;animation-fill-mode:both}.grid1-hero.svelte-1eoiiku nav a.svelte-1eoiiku.svelte-1eoiiku:nth-child(2){animation:svelte-1eoiiku-appear 500ms;animation-delay:750ms;animation-fill-mode:both}.grid1.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,.grid2.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,.grid3.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{display:grid;grid-template-columns:1fr;grid-gap:1.5rem;align-content:stretch;justify-content:stretch;margin:0}@media screen and (min-width: 600px){.grid1.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,.grid2.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,.grid3.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{margin:var(--spacing-unit)}}.grid1.svelte-1eoiiku .grid1-hero.svelte-1eoiiku.svelte-1eoiiku{display:grid;align-items:center;text-align:center;justify-items:start;grid-column:1/2;grid-row:2/3}.grid1.svelte-1eoiiku .grid1-hero h1.svelte-1eoiiku.svelte-1eoiiku,.grid2.svelte-1eoiiku .grid1-hero.svelte-1eoiiku h1.svelte-1eoiiku{font-weight:600;margin:0}@media screen and (max-width: 600px){.grid1.svelte-1eoiiku .grid1-hero h1.svelte-1eoiiku.svelte-1eoiiku,.grid2.svelte-1eoiiku .grid1-hero.svelte-1eoiiku h1.svelte-1eoiiku{font-size:1.8rem}}.grid1.svelte-1eoiiku .grid1-hero h2.svelte-1eoiiku.svelte-1eoiiku,.grid2 .grid1-hero.svelte-1eoiiku h2.svelte-1eoiiku.svelte-1eoiiku{font-weight:500;color:var(--gray-100);margin:0}.grid1.svelte-1eoiiku .grid1-hero h3.svelte-1eoiiku.svelte-1eoiiku,.grid2.svelte-1eoiiku .grid1-hero.svelte-1eoiiku h3.svelte-1eoiiku,.grid2.svelte-1eoiiku .grid1-hero h4.svelte-1eoiiku.svelte-1eoiiku{margin:0;color:var(--gray-100);font-weight:normal}.grid1.svelte-1eoiiku .grid1-hero nav.svelte-1eoiiku.svelte-1eoiiku,.grid2 .grid1-hero.svelte-1eoiiku nav.svelte-1eoiiku.svelte-1eoiiku{float:none}@media screen and (min-width: 1200px){.grid1.svelte-1eoiiku .grid1-hero nav.svelte-1eoiiku.svelte-1eoiiku,.grid2 .grid1-hero.svelte-1eoiiku nav.svelte-1eoiiku.svelte-1eoiiku{float:right}}.grid1.svelte-1eoiiku .grid1-art.svelte-1eoiiku.svelte-1eoiiku{display:grid;place-items:center}@media screen and (min-width: 1200px){.grid1.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku,.grid2.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{grid-template-columns:2fr 1fr}.grid1.svelte-1eoiiku .grid1-hero.svelte-1eoiiku.svelte-1eoiiku{margin:calc(var(--spacing-unit) * 2) 0 0 calc(var(--spacing-unit) * 2);grid-column:1/2;grid-row:1/2;text-align:left}}.grid1.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{padding:calc(var(--spacing-unit) * 2) 0 0}@media screen and (min-width: 1200px){.grid1.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{margin:calc(var(--spacing-unit) * 1) 0 calc(var(--spacing-unit)*3)}}.grid2.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{margin-top:calc(var(--spacing-unit) * 2)}@media screen and (min-width: 800px){.grid3.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{grid-template-columns:1fr 1fr}}@media screen and (min-width: 1100px){.grid3.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{grid-template-columns:1fr 1fr 1fr}}.blogPost.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{overflow:hidden;border-radius:var(--corner-unit);position:relative;box-shadow:var(--shadow-elevation-medium);padding:var(--spacing-unit)}.blogPost.svelte-1eoiiku p.svelte-1eoiiku.svelte-1eoiiku{padding:0;margin:0 0 var(--spacing-unit)}.blogPost.svelte-1eoiiku h3.svelte-1eoiiku.svelte-1eoiiku{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}.blogPost.svelte-1eoiiku .date.svelte-1eoiiku.svelte-1eoiiku{opacity:0.5;font-size:0.9rem}.divlink.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{height:100%;text-decoration:none;color:inherit}.divlink.svelte-1eoiiku:hover:hover h3.svelte-1eoiiku.svelte-1eoiiku{color:var(--primary-300)}.divlink.svelte-1eoiiku:hover:hover .blogPost.svelte-1eoiiku.svelte-1eoiiku{transform:translate(-0.05rem, -0.05rem);transition:var(--transition-time) ease;box-shadow:var(--shadow-elevation-mediumhigh)}.divlink.svelte-1eoiiku:hover:hover .allPostButton.svelte-1eoiiku.svelte-1eoiiku{background:var(--primary-300)}.allPostButton.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{background:var(--primary-200);justify-self:start;align-self:start}.allPostButton.svelte-1eoiiku h4.svelte-1eoiiku.svelte-1eoiiku{margin:0;padding:0;color:white;text-decoration:none}.grid2-tags.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{position:relative;margin-bottom:var(--spacing-unit)}.blog-parent.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{display:grid;grid-gap:1.5rem;justify-content:stretch;align-content:stretch;grid-template-columns:1fr;margin-bottom:calc(var(--spacing-unit) * 2)}@media screen and (min-width: 900px){.blog-parent.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{grid-template-columns:1fr 1fr}.blog-parent.svelte-1eoiiku a.svelte-1eoiiku.svelte-1eoiiku:first-child{grid-row:1 / 2;grid-column:1 / 3}}.wrapperForHero.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{width:100vw;left:50%;right:50%;margin:0 -50vw 0 -50vw;position:relative}.hero-background.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{background:var(--primary-400);position:relative;width:100vw;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;padding-bottom:var(--spacing-unit)}@media screen and (min-width: 900px){}.container.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{max-width:1300px;margin:auto}@media screen and (max-width: 600px){.container.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{max-width:100vw}}.header.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{margin-left:var(--spacing-unit);margin-bottom:var(--spacing-unit)}.button.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{color:inherit;display:inline-block;font-size:1.2em;padding:0.5rem 0.85rem 0.5rem;margin:var(--spacing-unit) var(--spacing-unit) 0rem;border-radius:calc(var(--corner-unit));background:var(--primary-400);box-shadow:var(--shadow-elevation-mediumhigh);text-decoration:none;font-weight:600}.button.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku:hover{background:var(--primary-300);box-shadow:var(--shadow-elevation-high);color:white}@media screen and (max-width: 500px){.button.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{margin:var(--spacing-unit) calc(var(--spacing-unit) * 0.75) 0rem}}.projectsbutton.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{color:white;background:var(--secondary-300)}.projectsbutton.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku:hover{background:var(--secondary-350);color:inherit;transform:translate(-0.1rem, -0.1rem);transition:0.2s ease-in-out}.blogbutton.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku{background:var(--primary-300);color:white}.blogbutton.svelte-1eoiiku.svelte-1eoiiku.svelte-1eoiiku:hover{background:var(--primary-350);transform:translate(-0.1rem, -0.1rem);transition:0.2s ease-in-out;color:var(--primary-100)}",
      map: null
    };
    allPosts = { "./blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_ffb20f6d(), globalstyles_ffb20f6d_exports)), "./blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_889d29fe(), code_highlighting_889d29fe_exports)) };
    body = [];
    for (let path in allPosts) {
      body.push(allPosts[path]().then(({ metadata: metadata3 }) => {
        return { path, metadata: metadata3 };
      }));
    }
    load = async () => {
      const posts = await Promise.all(body);
      return { props: { posts } };
    };
    pageTitle2 = "home";
    metaDescription2 = "The homepage: a collection of projects and blog posts.";
    Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { posts } = $$props;
      posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
      });
      let projects = [
        {
          title: 'My charity website <span><img class="svg-icon" src="link.svg"></span>',
          src: "https://www.vriendenvoorkika.nl/",
          description: 'Climbing a mountain for charity. Made a website for it using Jekyll and Netlify. Consider <a target="_blank" rel="noopener" href="https://www.actievoorkika.nl/sanne-koen-thomas-en-romy">donating</a>!',
          img: "illustration-crosses.svg",
          outside: true
        },
        {
          title: "This blog",
          src: "/",
          description: "Maxed out Jekyll, and felt overwhelmed by React. In comes SvelteKit!",
          img: "illustration-3scribbles.svg",
          outside: false
        },
        {
          title: "An investing calculator",
          src: "/calculator",
          description: "Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting.",
          img: "illustration-shapes.svg",
          outside: false
        }
      ];
      if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0)
        $$bindings.posts(posts);
      $$result.css.add(css4);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle2, metaDescription: metaDescription2 }, {}, {})}
<div class="${"wrapperForHero svelte-1eoiiku"}"><div class="${"hero-background svelte-1eoiiku"}"><div class="${"container svelte-1eoiiku"}"><div class="${"grid1 svelte-1eoiiku"}"><div class="${"grid1-art svelte-1eoiiku"}">${validate_component(Art, "Art").$$render($$result, {}, {}, {})}</div>
                <div class="${"grid1-hero svelte-1eoiiku"}"><div class="${"svelte-1eoiiku"}"><h2 class="${"svelte-1eoiiku"}">Hi, I&#39;m Koen!</h2>
                        <h1 class="${"svelte-1eoiiku"}">I do some programming in my <br class="${"svelte-1eoiiku"}">off-time.</h1>
                        <h3 class="${"svelte-1eoiiku"}">I write about web development as if you know nothing, because neither do I!</h3>
                        <nav class="${"svelte-1eoiiku"}"><a class="${"button blogbutton svelte-1eoiiku"}" href="${"#blog"}">Blog</a>
                            <a class="${"button projectsbutton svelte-1eoiiku"}" href="${"#projects"}">Projects</a></nav></div></div></div></div></div></div>


<div class="${"container svelte-1eoiiku"}"><div class="${"grid2 svelte-1eoiiku"}"><div class="${"grid2-blog svelte-1eoiiku"}"><h1 id="${"blog"}" class="${"header svelte-1eoiiku"}">Recently published</h1>
            <div class="${"blog-parent svelte-1eoiiku"}">${each(posts.slice(0, 4), ({ path, metadata: { title, snippet, date } }) => `<a class="${"divlink svelte-1eoiiku"}"${add_attribute("href", `${path.replace(".md", "")}`, 0)}><div class="${"blogPost svelte-1eoiiku"}"><h3 class="${"svelte-1eoiiku"}">${escape(title)}</h3>
                        <p class="${"svelte-1eoiiku"}">${escape(snippet)}</p>
                        <span class="${"date svelte-1eoiiku"}">${escape(new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }))}</span></div>
                    </a>`)}
                <a href="${"/blog"}" class="${"divlink svelte-1eoiiku"}"><div class="${"blogPost allPostButton svelte-1eoiiku"}"><h4 class="${"svelte-1eoiiku"}">All posts \u2794</h4></div></a></div></div> 

    <div class="${"grid2-tags svelte-1eoiiku"}"><h1 id="${"tags"}" class="${"header svelte-1eoiiku"}">Explore topics</h1>
        ${validate_component(TagCloud, "TagCloud").$$render($$result, {}, {}, {})}</div></div>
    
<h1 id="${"projects"}" class="${"header svelte-1eoiiku"}">Projects</h1>
<div class="${"grid3 svelte-1eoiiku"}">${each(projects, ({ title, src: src2, description, img, outside }) => `${validate_component(Project, "Project").$$render($$result, { title, src: src2, description, img, outside }, {}, {})}`)}</div>


</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/calculator-99cce316.js
var calculator_99cce316_exports = {};
__export(calculator_99cce316_exports, {
  default: () => Calculator
});
var css5, pageTitle3, metaDescription3, Calculator;
var init_calculator_99cce316 = __esm({
  ".svelte-kit/output/server/chunks/calculator-99cce316.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_Seo_726ce9e2();
    css5 = {
      code: ':root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-5rqnhl.svelte-5rqnhl,.svelte-5rqnhl.svelte-5rqnhl::before,.svelte-5rqnhl.svelte-5rqnhl::after{box-sizing:border-box}.svelte-5rqnhl.svelte-5rqnhl{margin:0}svg.svelte-5rqnhl.svelte-5rqnhl{display:block;max-width:100%}input.svelte-5rqnhl.svelte-5rqnhl{font:inherit}p.svelte-5rqnhl.svelte-5rqnhl,h1.svelte-5rqnhl.svelte-5rqnhl,h3.svelte-5rqnhl.svelte-5rqnhl{overflow-wrap:break-word}.container.svelte-5rqnhl.svelte-5rqnhl{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-5rqnhl.svelte-5rqnhl{max-width:70ch}.wrapper.svelte-5rqnhl.svelte-5rqnhl{display:grid;align-items:center;text-align:center;justify-items:center;grid-gap:var(--spacing-unit);margin:var(--spacing-unit)}.explanation-pie.svelte-5rqnhl.svelte-5rqnhl{padding:var(--spacing-unit) 0 0;justify-self:center;width:10rem}@media screen and (min-width: 600px){.explanation-pie.svelte-5rqnhl.svelte-5rqnhl{padding:0}}h3.svelte-5rqnhl.svelte-5rqnhl{font-weight:normal;margin:0}svg.svelte-5rqnhl.svelte-5rqnhl{width:10rem;height:10rem}svg.svelte-5rqnhl text.svelte-5rqnhl{font-weight:bold;fill:white}a.svelte-5rqnhl.svelte-5rqnhl{color:var(--primary-300);text-decoration:none}a.svelte-5rqnhl.svelte-5rqnhl:hover{text-decoration:underline}ol.svelte-5rqnhl.svelte-5rqnhl{list-style:none;margin:0;padding:0}ol.svelte-5rqnhl li.svelte-5rqnhl{display:grid;grid-template-columns:1fr;grid-gap:0.25rem;padding-bottom:1rem}span.svelte-5rqnhl.svelte-5rqnhl{color:var(--primary-300);font-weight:bold}form.svelte-5rqnhl.svelte-5rqnhl{box-shadow:var(--shadow-elevation-mediumhigh);padding:var(--spacing-unit);max-width:25rem}input[type="number"].svelte-5rqnhl.svelte-5rqnhl{font-size:inherit;box-shadow:none;appearance:none;-moz-appearance:none;-webkit-appearance:none;padding:0.25rem;margin:0 0.25rem 0;width:auto}label.svelte-5rqnhl.svelte-5rqnhl{padding-left:0.25rem}.svelte-5rqnhl.svelte-5rqnhl::-moz-focus-inner{border:0;padding:0}input[type="range"].svelte-5rqnhl.svelte-5rqnhl{-webkit-appearance:none;width:auto;margin:0.25rem 0 0.25rem;padding:0 0.25rem 0}input[type="range"].svelte-5rqnhl.svelte-5rqnhl::-webkit-slider-runnable-track{background:var(--primary-100);height:5px}input[type="range"].svelte-5rqnhl.svelte-5rqnhl::-moz-range-track{background:var(--primary-100);height:5px}input[type="range"].svelte-5rqnhl.svelte-5rqnhl::-webkit-slider-thumb{-webkit-appearance:none;height:20px;width:20px;background:var(--primary-300);margin-top:-7.5px;border-radius:50%}@media screen and (min-width: 600px){input[type="range"].svelte-5rqnhl.svelte-5rqnhl::-webkit-slider-thumb{height:15px;width:15px;margin-top:-5px}}input[type="range"].svelte-5rqnhl.svelte-5rqnhl::-moz-range-thumb{height:20px;width:20px;background:var(--primary-300);margin-top:-5px;border-radius:50%}@media screen and (min-width: 600px){input[type="range"].svelte-5rqnhl.svelte-5rqnhl::-moz-range-thumb{height:15px;width:15px;margin-top:-5px}}.container.svelte-5rqnhl h1.svelte-5rqnhl{margin:calc(var(--spacing-unit) * 3) 0 calc(var(--spacing-unit) * 1);text-align:center}',
      map: null
    };
    pageTitle3 = "portfolio rebalancing calculator";
    metaDescription3 = "An interactive calculator meant to rebalance an investing portfolio consisting of volatile assets such as stocks, and stable assets such as bonds.";
    Calculator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let totalPortfValue;
      let actPercVolatile;
      let diffActAndDesVolatile;
      let volatileAssets = null;
      let stableAssets = null;
      let desiredPercVolatile = 0;
      $$result.css.add(css5);
      totalPortfValue = volatileAssets + stableAssets;
      actPercVolatile = volatileAssets / totalPortfValue * 100;
      diffActAndDesVolatile = volatileAssets - desiredPercVolatile / 100 * totalPortfValue;
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle3, metaDescription: metaDescription3 }, {}, {})} 


<main class="${"container svelte-5rqnhl"}"><h1 class="${"svelte-5rqnhl"}">Portfolio rebalancing calculator</h1>
    <div class="${"grid svelte-5rqnhl"}"><div class="${"wrapper svelte-5rqnhl"}"><form name="${"calculator"}" class="${"svelte-5rqnhl"}"><input type="${"hidden"}" name="${"form-name"}" value="${"contact"}" class="${"svelte-5rqnhl"}">
                <ol class="${"svelte-5rqnhl"}"><li class="${"svelte-5rqnhl"}"><label for="${"field-volatile"}" class="${"svelte-5rqnhl"}">Current money in volatile assets?</label>
                        <input type="${"number"}" min="${"0"}" name="${"volatile"}" id="${"field-volatile"}" required="${""}" aria-required="${"true"}" placeholder="${"Enter value of volatile assets"}" autocomplete="${"volatile"}" autocorrect="${"off"}" autocapitalize="${"off"}" oninput="${"this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"}" class="${"svelte-5rqnhl"}"${add_attribute("value", volatileAssets, 0)}></li>
                    <li class="${"svelte-5rqnhl"}"><label for="${"field-stable"}" class="${"svelte-5rqnhl"}">Current money in stable assets?</label>
                        <input type="${"number"}" min="${"0"}" name="${"stable"}" id="${"field-stable"}" required="${""}" aria-required="${"true"}" placeholder="${"Enter value of stable assets"}" autocomplete="${"stable"}" oninput="${"this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"}" class="${"svelte-5rqnhl"}"${add_attribute("value", stableAssets, 0)}></li>
                    <li class="${"svelte-5rqnhl"}"><label for="${"field-percentage"}" class="${"svelte-5rqnhl"}">Preferred percentage of volatile assets?</label>
                        <input type="${"range"}" min="${"0"}" max="${"100"}" name="${"percentage"}" id="${"field-percentage"}" required="${""}" aria-required="${"true"}" autocapitalize="${"off"}" class="${" svelte-5rqnhl"}"${add_attribute("value", desiredPercVolatile, 0)}>
                        <label class="${"svelte-5rqnhl"}">${escape(desiredPercVolatile)}%</label></li></ol></form></div>

        <div class="${"wrapper svelte-5rqnhl"}"><div class="${"explanation-text svelte-5rqnhl"}"><h3 class="${"svelte-5rqnhl"}">You currently have <span class="${"svelte-5rqnhl"}">${`${`${`0%`}`}
                `}</span> of your total portfolio value of <span class="${"svelte-5rqnhl"}">\u20AC${escape(totalPortfValue)}</span> in volatile assets.<br class="${"svelte-5rqnhl"}"> To rebalance, 
                ${diffActAndDesVolatile > 0 ? `sell` : `buy`}
                <span class="${"svelte-5rqnhl"}">\u20AC${escape(Math.abs(Math.round(diffActAndDesVolatile)))}</span> of volatile assets. </h3></div>

            <div class="${"explanation-pie svelte-5rqnhl"}"><svg height="${"20"}" width="${"20"}" viewBox="${"0 0 20 20"}" class="${"svelte-5rqnhl"}"><circle class="${"circle svelte-5rqnhl"}" r="${"10"}" cx="${"10"}" cy="${"10"}" fill="${"var(--primary-300)"}"></circle><circle r="${"5"}" cx="${"10"}" cy="${"10"}" fill="${"transparent"}" stroke="${"var(--secondary-300)"}" stroke-width="${"10"}" stroke-dasharray="${"calc(" + escape(Math.round(actPercVolatile)) + " * 30.65 / 100) 31.4159"}" transform="${"rotate(-90) translate(-20)"}" class="${"svelte-5rqnhl"}"></circle><text x="${"50%"}" y="${"50%"}" dominant-baseline="${"middle"}" text-anchor="${"middle"}" font-size="${"3"}" class="${"svelte-5rqnhl"}">${!actPercVolatile ? `` : `${escape(Math.round(actPercVolatile))}`}</text></svg></div></div>

        <div style="${"margin-top: var(--spacing-unit);"}" class="${"disclaimer svelte-5rqnhl"}"><hr class="${"svelte-5rqnhl"}">
            <p class="${"svelte-5rqnhl"}">This calculator is intended for people who follow a long-term investment strategy such as the <a target="${"_blank"}" rel="${"noopener"}" href="${"https://www.bogleheads.org/wiki/Bogleheads\xAE_investment_philosophy"}" class="${"svelte-5rqnhl"}">Boglehead method</a>, where there&#39;s a volatile part and a stable part: stocks and bonds.</p>
            <p class="${"svelte-5rqnhl"}">In recent years, low interest rates have made bonds unattractive. People now opt for deposit savings or cash buffers. Stocks are still in high demand, but crypto currencies are gaining ground.</p> 
            <p class="${"svelte-5rqnhl"}">None of this is relevant for this calculator, as long as there is a volatile and a stable asset that you&#39;re trying to balance!</p></div></div>
    
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/schildklier-dd117784.js
var schildklier_dd117784_exports = {};
__export(schildklier_dd117784_exports, {
  default: () => Schildklier
});
var css6, pageTitle4, metaDescription4, Schildklier;
var init_schildklier_dd117784 = __esm({
  ".svelte-kit/output/server/chunks/schildklier-dd117784.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_Seo_726ce9e2();
    css6 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-4azw6,.svelte-4azw6::before,.svelte-4azw6::after{box-sizing:border-box}.svelte-4azw6{margin:0}button.svelte-4azw6{font:inherit}p.svelte-4azw6,h1.svelte-4azw6{overflow-wrap:break-word}button.svelte-4azw6{font-family:inherit;font-size:inherit;padding:0.25rem;background:transparent;box-shadow:none;outline:none;border:2px solid #111344}button.svelte-4azw6:hover{outline:2px solid #06D6A0;cursor:pointer}.dark button.svelte-4azw6{color:white;border:2px solid white}a.svelte-4azw6{color:#06D6A0;text-decoration:none}a.svelte-4azw6:hover{text-decoration:underline}",
      map: null
    };
    pageTitle4 = "interactive flowchart for diagnosing thyroid disease";
    metaDescription4 = "An interactive flowchart for diagnosing thyroid disease, adapted from a guideline by the Dutch Association of General Practitioners.";
    Schildklier = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let start;
      let tsh;
      let tsh1t4;
      let bevallen;
      let iatrogeen;
      let tsh0t4;
      let ziek;
      let bse;
      let tshr;
      let amiolith;
      let bevallen2;
      let struma;
      let nodus;
      let solnodus;
      $$result.css.add(css6);
      start = false;
      tsh = null;
      tsh1t4 = null;
      bevallen = null;
      iatrogeen = null;
      tsh0t4 = null;
      ziek = null;
      bse = null;
      tshr = null;
      amiolith = null;
      bevallen2 = null;
      struma = null;
      nodus = null;
      solnodus = null;
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle4, metaDescription: metaDescription4 }, {}, {})}
<h1 class="${"svelte-4azw6"}">Diagnostiek bij vermoeden van een schildklierfunctiestoornis</h1>
<p class="${"svelte-4azw6"}"><i class="${"svelte-4azw6"}">This interactive flowchart is adapted from the <a target="${"_blank"}" rel="${"noopener"}" href="${"https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen#samenvatting-richtlijnen-beleid-bij-hyperthyreodie"}" class="${"svelte-4azw6"}">NHG-Standaard Schildklieraandoeningen</a>, and specifically from <a href="${"https://richtlijnen.nhg.org/files/2021-06/M31_juli_2013_2.png"}" class="${"svelte-4azw6"}">this flowchart</a>. I might have made mistakes so plz don&#39;t use it.</i></p>
<p style="${"padding-bottom: 0.5rem;"}" class="${"svelte-4azw6"}">Dit interactieve stroomdiagram is een aanpassing van de <a target="${"_blank"}" rel="${"noopener"}" href="${"https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen#samenvatting-richtlijnen-beleid-bij-hyperthyreodie"}" class="${"svelte-4azw6"}">NHG-Standaard Schildklieraandoeningen</a>, en specifiek van <a href="${"https://richtlijnen.nhg.org/files/2021-06/M31_juli_2013_2.png"}" class="${"svelte-4azw6"}">dit stroomdiagram</a>. Er kunnen zeker nog fouten in zitten!</p>

<button class="${"svelte-4azw6"}">Start beslisboom</button>
${start ? `<p class="${"svelte-4azw6"}">Is het TSH verhoogd, verlaagd of normaal?</p>
    <button class="${"svelte-4azw6"}">Verhoogd</button>
    <button class="${"svelte-4azw6"}">Verlaagd</button>
    <button class="${"svelte-4azw6"}">Normaal</button>
    ` : ``}
${tsh ? `${tsh === 3 ? `<p class="${"svelte-4azw6"}">Euthyreo\xEFdie</p>` : `${tsh === 1 ? `<p class="${"svelte-4azw6"}">Is het Vrije T4 verhoogd, verlaagd of normaal?</p>
        <button class="${"svelte-4azw6"}">Verhoogd</button>
        <button class="${"svelte-4azw6"}">Verlaagd</button>
        <button class="${"svelte-4azw6"}">Normaal</button>
        ${tsh1t4 === 3 ? `<p class="${"svelte-4azw6"}">Subklinische hypothyreo\xEFdie</p>` : `${tsh1t4 === 1 ? `<ul class="${"svelte-4azw6"}"><li class="${"svelte-4azw6"}">TSH-producerend adenoom van de hypofyse</li>
                <li class="${"svelte-4azw6"}">Perifere resistentie schildklierhormoon (<i class="${"svelte-4azw6"}">zeldzaam</i>)</li></ul>` : `${tsh1t4 === 2 ? `<p class="${"svelte-4azw6"}">Minder dan 1 jaar geleden bevallen?</p>
            <button class="${"svelte-4azw6"}">Nee</button>
            <button class="${"svelte-4azw6"}">Ja</button>

            ${bevallen === 1 ? `<p class="${"svelte-4azw6"}">Post-partum thyreo\xEFditis</p>` : `${bevallen === 2 ? `<p class="${"svelte-4azw6"}">Schildklieroperatie, bestraling van de hals, of medicatiegebruik?</p>
                <button class="${"svelte-4azw6"}">Nee</button>
                <button class="${"svelte-4azw6"}">Ja</button>
                ${iatrogeen === 1 ? `<p class="${"svelte-4azw6"}">Iatrogene hypothyreo\xEFdie</p>` : `${iatrogeen === 2 ? `<ul class="${"svelte-4azw6"}"><li class="${"svelte-4azw6"}">Thyreo\xEFditis van Hashimoto</li>
                        <li class="${"svelte-4azw6"}">Stille lymfocytaire thyreo\xEFditis</li></ul>` : ``}`}` : ``}`}` : ``}`}`}` : `${tsh === 2 ? `<p class="${"svelte-4azw6"}">Is het Vrije T4 verhoogd, verlaagd of normaal?</p>
        <button class="${"svelte-4azw6"}">Verhoogd</button>
        <button class="${"svelte-4azw6"}">Verlaagd</button>
        <button class="${"svelte-4azw6"}">Normaal</button>
        ${tsh0t4 === 3 ? `<p class="${"svelte-4azw6"}">Subklinische hyperthyreo\xEFdie</p>` : `${tsh0t4 === 1 ? `<p class="${"svelte-4azw6"}">Hyperthyreo\xEFdie</p>
            <p class="${"svelte-4azw6"}">Pijnlijke schildklier, koorts, koude rillingen en malaise?</p>
            <button class="${"svelte-4azw6"}">Nee</button>
            <button class="${"svelte-4azw6"}">Ja</button>
            ${ziek === 2 ? `x (TSH-R)` : `${ziek === 1 ? `<p class="${"svelte-4azw6"}">Verhoogde BSE, leucocytose?</p>
                <button class="${"svelte-4azw6"}">Nee</button>
                <button class="${"svelte-4azw6"}">Ja</button>
                ${bse === 1 ? `<p class="${"svelte-4azw6"}">Sucacute thyreo\xEFditis</p>` : `${bse === 2 ? `<p class="${"svelte-4azw6"}">Anti-TSH-R antistoffen?</p>
                    <button class="${"svelte-4azw6"}">Nee</button>
                    <button class="${"svelte-4azw6"}">Ja</button>
                    ${tshr === 1 ? `<p class="${"svelte-4azw6"}">Ziekte van Graves</p>` : `${tshr === 2 ? `<p class="${"svelte-4azw6"}">Amiodaron of lithiumgebruik?</p>
                        <button class="${"svelte-4azw6"}">Nee</button>
                        <button class="${"svelte-4azw6"}">Ja</button>
                        ${amiolith === 1 ? `<p class="${"svelte-4azw6"}">Iatrogene hyperthyreo\xEFdie</p>` : `${amiolith === 2 ? `<p class="${"svelte-4azw6"}">Minder dan 1 jaar geleden bevallen?</p>
                            <button class="${"svelte-4azw6"}">Nee</button>
                            <button class="${"svelte-4azw6"}">Ja</button>
                            ${bevallen2 === 1 ? `<p class="${"svelte-4azw6"}">Post-partum thyreo\xEFditis</p>` : `${bevallen2 === 2 ? `<p class="${"svelte-4azw6"}">Is er sprake van struma?</p>
                                <button class="${"svelte-4azw6"}">Nee</button>
                                <button class="${"svelte-4azw6"}">Ja</button>
                                ${struma === 1 ? `<p class="${"svelte-4azw6"}">Is er een dominante nodus?</p>
                                    <button class="${"svelte-4azw6"}">Nee</button>
                                    <button class="${"svelte-4azw6"}">Ja</button>
                                    ${nodus === 1 ? `<p class="${"svelte-4azw6"}">Multinodulair struma</p>` : `${nodus === 2 ? `<p class="${"svelte-4azw6"}">Multinodulair struma met dominante nodus</p>` : ``}`}` : `${struma === 2 ? `<p class="${"svelte-4azw6"}">Is er een solitaire nodus?</p>
                                    <button class="${"svelte-4azw6"}">Nee</button>
                                    <button class="${"svelte-4azw6"}">Ja</button>
                                    ${solnodus === 2 ? `<p class="${"svelte-4azw6"}">Stille lymfocytaire thyreo\xEFditis</p>` : `${solnodus === 1 ? `<p class="${"svelte-4azw6"}">Toxisch adenoom</p>` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : `${tsh0t4 === 2 ? `<p class="${"svelte-4azw6"}">Secundaire of tertiaire hypothyreo\xEFdie (<i class="${"svelte-4azw6"}">zeldzaam</i>)</p>` : ``}`}`}` : ``}`}`}` : ``}

`;
    });
  }
});

// .svelte-kit/output/server/chunks/chart-4d567f48.js
var chart_4d567f48_exports = {};
__export(chart_4d567f48_exports, {
  default: () => Chart
});
function clean($$props, extra_keys) {
  let keys = ["children", "$$scope", "$$slots"].concat(extra_keys);
  const rest = {};
  for (const key of Object.keys($$props)) {
    if (!keys.includes(key)) {
      rest[key] = $$props[key];
    }
  }
  return rest;
}
function throttled(fn, thisArg, updateFn) {
  const updateArgs = updateFn || ((args2) => Array.prototype.slice.call(args2));
  let ticking = false;
  let args = [];
  return function(...rest) {
    args = updateArgs(rest);
    if (!ticking) {
      ticking = true;
      requestAnimFrame.call(window, () => {
        ticking = false;
        fn.apply(thisArg, args);
      });
    }
  };
}
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    if (delay) {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay, args);
    } else {
      fn.apply(this, args);
    }
    return delay;
  };
}
function noop() {
}
function isNullOrUndef(value) {
  return value === null || typeof value === "undefined";
}
function isArray(value) {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.substr(0, 7) === "[object" && type.substr(-6) === "Array]") {
    return true;
  }
  return false;
}
function isObject(value) {
  return value !== null && Object.prototype.toString.call(value) === "[object Object]";
}
function finiteOrDefault(value, defaultValue) {
  return isNumberFinite(value) ? value : defaultValue;
}
function valueOrDefault(value, defaultValue) {
  return typeof value === "undefined" ? defaultValue : value;
}
function callback(fn, args, thisArg) {
  if (fn && typeof fn.call === "function") {
    return fn.apply(thisArg, args);
  }
}
function each2(loopable, fn, thisArg, reverse) {
  let i, len, keys;
  if (isArray(loopable)) {
    len = loopable.length;
    if (reverse) {
      for (i = len - 1; i >= 0; i--) {
        fn.call(thisArg, loopable[i], i);
      }
    } else {
      for (i = 0; i < len; i++) {
        fn.call(thisArg, loopable[i], i);
      }
    }
  } else if (isObject(loopable)) {
    keys = Object.keys(loopable);
    len = keys.length;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, loopable[keys[i]], keys[i]);
    }
  }
}
function _elementsEqual(a0, a1) {
  let i, ilen, v0, v1;
  if (!a0 || !a1 || a0.length !== a1.length) {
    return false;
  }
  for (i = 0, ilen = a0.length; i < ilen; ++i) {
    v0 = a0[i];
    v1 = a1[i];
    if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
      return false;
    }
  }
  return true;
}
function clone$1(source) {
  if (isArray(source)) {
    return source.map(clone$1);
  }
  if (isObject(source)) {
    const target = Object.create(null);
    const keys = Object.keys(source);
    const klen = keys.length;
    let k = 0;
    for (; k < klen; ++k) {
      target[keys[k]] = clone$1(source[keys[k]]);
    }
    return target;
  }
  return source;
}
function isValidKey(key) {
  return ["__proto__", "prototype", "constructor"].indexOf(key) === -1;
}
function _merger(key, target, source, options2) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    merge(tval, sval, options2);
  } else {
    target[key] = clone$1(sval);
  }
}
function merge(target, source, options2) {
  const sources = isArray(source) ? source : [source];
  const ilen = sources.length;
  if (!isObject(target)) {
    return target;
  }
  options2 = options2 || {};
  const merger = options2.merger || _merger;
  for (let i = 0; i < ilen; ++i) {
    source = sources[i];
    if (!isObject(source)) {
      continue;
    }
    const keys = Object.keys(source);
    for (let k = 0, klen = keys.length; k < klen; ++k) {
      merger(keys[k], target, source, options2);
    }
  }
  return target;
}
function mergeIf(target, source) {
  return merge(target, source, { merger: _mergerIf });
}
function _mergerIf(key, target, source) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    mergeIf(tval, sval);
  } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = clone$1(sval);
  }
}
function indexOfDotOrLength(key, start) {
  const idx = key.indexOf(dot, start);
  return idx === -1 ? key.length : idx;
}
function resolveObjectKey(obj, key) {
  if (key === emptyString) {
    return obj;
  }
  let pos = 0;
  let idx = indexOfDotOrLength(key, pos);
  while (obj && idx > pos) {
    obj = obj[key.substr(pos, idx - pos)];
    pos = idx + 1;
    idx = indexOfDotOrLength(key, pos);
  }
  return obj;
}
function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function niceNum(range) {
  const roundedRange = Math.round(range);
  range = almostEquals(range, roundedRange, range / 1e3) ? roundedRange : range;
  const niceRange = Math.pow(10, Math.floor(log10(range)));
  const fraction = range / niceRange;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * niceRange;
}
function _factorize(value) {
  const result = [];
  const sqrt = Math.sqrt(value);
  let i;
  for (i = 1; i < sqrt; i++) {
    if (value % i === 0) {
      result.push(i);
      result.push(value / i);
    }
  }
  if (sqrt === (sqrt | 0)) {
    result.push(sqrt);
  }
  result.sort((a, b) => a - b).pop();
  return result;
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function almostEquals(x, y, epsilon) {
  return Math.abs(x - y) < epsilon;
}
function almostWhole(x, epsilon) {
  const rounded = Math.round(x);
  return rounded - epsilon <= x && rounded + epsilon >= x;
}
function _setMinAndMaxByKey(array, target, property) {
  let i, ilen, value;
  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}
function toRadians(degrees) {
  return degrees * (PI / 180);
}
function toDegrees(radians) {
  return radians * (180 / PI);
}
function _decimalPlaces(x) {
  if (!isNumberFinite(x)) {
    return;
  }
  let e = 1;
  let p = 0;
  while (Math.round(x * e) / e !== x) {
    e *= 10;
    p++;
  }
  return p;
}
function getAngleFromPoint(centrePoint, anglePoint) {
  const distanceFromXCenter = anglePoint.x - centrePoint.x;
  const distanceFromYCenter = anglePoint.y - centrePoint.y;
  const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
  let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
  if (angle < -0.5 * PI) {
    angle += TAU;
  }
  return {
    angle,
    distance: radialDistanceFromCenter
  };
}
function distanceBetweenPoints(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
function _angleDiff(a, b) {
  return (a - b + PITAU) % TAU - PI;
}
function _normalizeAngle(a) {
  return (a % TAU + TAU) % TAU;
}
function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
  const a = _normalizeAngle(angle);
  const s2 = _normalizeAngle(start);
  const e = _normalizeAngle(end);
  const angleToStart = _normalizeAngle(s2 - a);
  const angleToEnd = _normalizeAngle(e - a);
  const startToAngle = _normalizeAngle(a - s2);
  const endToAngle = _normalizeAngle(a - e);
  return a === s2 || a === e || sameAngleIsFullCircle && s2 === e || angleToStart > angleToEnd && startToAngle < endToAngle;
}
function _limitValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function _int16Range(value) {
  return _limitValue(value, -32768, 32767);
}
function _isBetween(value, start, end, epsilon = 1e-6) {
  return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}
function isShort(v) {
  return eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a);
}
function hexParse(str) {
  var len = str.length;
  var ret;
  if (str[0] === "#") {
    if (len === 4 || len === 5) {
      ret = {
        r: 255 & map$1[str[1]] * 17,
        g: 255 & map$1[str[2]] * 17,
        b: 255 & map$1[str[3]] * 17,
        a: len === 5 ? map$1[str[4]] * 17 : 255
      };
    } else if (len === 7 || len === 9) {
      ret = {
        r: map$1[str[1]] << 4 | map$1[str[2]],
        g: map$1[str[3]] << 4 | map$1[str[4]],
        b: map$1[str[5]] << 4 | map$1[str[6]],
        a: len === 9 ? map$1[str[7]] << 4 | map$1[str[8]] : 255
      };
    }
  }
  return ret;
}
function hexString(v) {
  var f = isShort(v) ? h1 : h2;
  return v ? "#" + f(v.r) + f(v.g) + f(v.b) + (v.a < 255 ? f(v.a) : "") : v;
}
function round(v) {
  return v + 0.5 | 0;
}
function p2b(v) {
  return lim(round(v * 2.55), 0, 255);
}
function n2b(v) {
  return lim(round(v * 255), 0, 255);
}
function b2n(v) {
  return lim(round(v / 2.55) / 100, 0, 1);
}
function n2p(v) {
  return lim(round(v * 100), 0, 100);
}
function rgbParse(str) {
  const m = RGB_RE.exec(str);
  let a = 255;
  let r, g, b;
  if (!m) {
    return;
  }
  if (m[7] !== r) {
    const v = +m[7];
    a = 255 & (m[8] ? p2b(v) : v * 255);
  }
  r = +m[1];
  g = +m[3];
  b = +m[5];
  r = 255 & (m[2] ? p2b(r) : r);
  g = 255 & (m[4] ? p2b(g) : g);
  b = 255 & (m[6] ? p2b(b) : b);
  return {
    r,
    g,
    b,
    a
  };
}
function rgbString(v) {
  return v && (v.a < 255 ? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})` : `rgb(${v.r}, ${v.g}, ${v.b})`);
}
function hsl2rgbn(h, s2, l) {
  const a = s2 * Math.min(l, 1 - l);
  const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)];
}
function hsv2rgbn(h, s2, v) {
  const f = (n, k = (n + h / 60) % 6) => v - v * s2 * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)];
}
function hwb2rgbn(h, w, b) {
  const rgb = hsl2rgbn(h, 1, 0.5);
  let i;
  if (w + b > 1) {
    i = 1 / (w + b);
    w *= i;
    b *= i;
  }
  for (i = 0; i < 3; i++) {
    rgb[i] *= 1 - w - b;
    rgb[i] += w;
  }
  return rgb;
}
function rgb2hsl(v) {
  const range = 255;
  const r = v.r / range;
  const g = v.g / range;
  const b = v.b / range;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h, s2, d2;
  if (max !== min) {
    d2 = max - min;
    s2 = l > 0.5 ? d2 / (2 - max - min) : d2 / (max + min);
    h = max === r ? (g - b) / d2 + (g < b ? 6 : 0) : max === g ? (b - r) / d2 + 2 : (r - g) / d2 + 4;
    h = h * 60 + 0.5;
  }
  return [h | 0, s2 || 0, l];
}
function calln(f, a, b, c) {
  return (Array.isArray(a) ? f(a[0], a[1], a[2]) : f(a, b, c)).map(n2b);
}
function hsl2rgb(h, s2, l) {
  return calln(hsl2rgbn, h, s2, l);
}
function hwb2rgb(h, w, b) {
  return calln(hwb2rgbn, h, w, b);
}
function hsv2rgb(h, s2, v) {
  return calln(hsv2rgbn, h, s2, v);
}
function hue(h) {
  return (h % 360 + 360) % 360;
}
function hueParse(str) {
  const m = HUE_RE.exec(str);
  let a = 255;
  let v;
  if (!m) {
    return;
  }
  if (m[5] !== v) {
    a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
  }
  const h = hue(+m[2]);
  const p1 = +m[3] / 100;
  const p2 = +m[4] / 100;
  if (m[1] === "hwb") {
    v = hwb2rgb(h, p1, p2);
  } else if (m[1] === "hsv") {
    v = hsv2rgb(h, p1, p2);
  } else {
    v = hsl2rgb(h, p1, p2);
  }
  return {
    r: v[0],
    g: v[1],
    b: v[2],
    a
  };
}
function rotate(v, deg) {
  var h = rgb2hsl(v);
  h[0] = hue(h[0] + deg);
  h = hsl2rgb(h);
  v.r = h[0];
  v.g = h[1];
  v.b = h[2];
}
function hslString(v) {
  if (!v) {
    return;
  }
  const a = rgb2hsl(v);
  const h = a[0];
  const s2 = n2p(a[1]);
  const l = n2p(a[2]);
  return v.a < 255 ? `hsla(${h}, ${s2}%, ${l}%, ${b2n(v.a)})` : `hsl(${h}, ${s2}%, ${l}%)`;
}
function unpack() {
  const unpacked = {};
  const keys = Object.keys(names);
  const tkeys = Object.keys(map$1$1);
  let i, j, k, ok, nk;
  for (i = 0; i < keys.length; i++) {
    ok = nk = keys[i];
    for (j = 0; j < tkeys.length; j++) {
      k = tkeys[j];
      nk = nk.replace(k, map$1$1[k]);
    }
    k = parseInt(names[ok], 16);
    unpacked[nk] = [k >> 16 & 255, k >> 8 & 255, k & 255];
  }
  return unpacked;
}
function nameParse(str) {
  if (!names$1) {
    names$1 = unpack();
    names$1.transparent = [0, 0, 0, 0];
  }
  const a = names$1[str.toLowerCase()];
  return a && {
    r: a[0],
    g: a[1],
    b: a[2],
    a: a.length === 4 ? a[3] : 255
  };
}
function modHSL(v, i, ratio) {
  if (v) {
    let tmp = rgb2hsl(v);
    tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
    tmp = hsl2rgb(tmp);
    v.r = tmp[0];
    v.g = tmp[1];
    v.b = tmp[2];
  }
}
function clone2(v, proto) {
  return v ? Object.assign(proto || {}, v) : v;
}
function fromObject(input) {
  var v = { r: 0, g: 0, b: 0, a: 255 };
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      v = { r: input[0], g: input[1], b: input[2], a: 255 };
      if (input.length > 3) {
        v.a = n2b(input[3]);
      }
    }
  } else {
    v = clone2(input, { r: 0, g: 0, b: 0, a: 1 });
    v.a = n2b(v.a);
  }
  return v;
}
function functionParse(str) {
  if (str.charAt(0) === "r") {
    return rgbParse(str);
  }
  return hueParse(str);
}
function index_esm(input) {
  return new Color(input);
}
function color(value) {
  return isPatternOrGradient(value) ? value : index_esm(value);
}
function getHoverColor(value) {
  return isPatternOrGradient(value) ? value : index_esm(value).saturate(0.5).darken(0.1).hexString();
}
function getScope$1(node, key) {
  if (!key) {
    return node;
  }
  const keys = key.split(".");
  for (let i = 0, n = keys.length; i < n; ++i) {
    const k = keys[i];
    node = node[k] || (node[k] = Object.create(null));
  }
  return node;
}
function set(root, scope, values) {
  if (typeof scope === "string") {
    return merge(getScope$1(root, scope), values);
  }
  return merge(getScope$1(root, ""), scope);
}
function toFontString(font) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }
  return (font.style ? font.style + " " : "") + (font.weight ? font.weight + " " : "") + font.size + "px " + font.family;
}
function _measureText(ctx, data, gc, longest, string) {
  let textWidth = data[string];
  if (!textWidth) {
    textWidth = data[string] = ctx.measureText(string).width;
    gc.push(string);
  }
  if (textWidth > longest) {
    longest = textWidth;
  }
  return longest;
}
function _longestText(ctx, font, arrayOfThings, cache) {
  cache = cache || {};
  let data = cache.data = cache.data || {};
  let gc = cache.garbageCollect = cache.garbageCollect || [];
  if (cache.font !== font) {
    data = cache.data = {};
    gc = cache.garbageCollect = [];
    cache.font = font;
  }
  ctx.save();
  ctx.font = font;
  let longest = 0;
  const ilen = arrayOfThings.length;
  let i, j, jlen, thing, nestedThing;
  for (i = 0; i < ilen; i++) {
    thing = arrayOfThings[i];
    if (thing !== void 0 && thing !== null && isArray(thing) !== true) {
      longest = _measureText(ctx, data, gc, longest, thing);
    } else if (isArray(thing)) {
      for (j = 0, jlen = thing.length; j < jlen; j++) {
        nestedThing = thing[j];
        if (nestedThing !== void 0 && nestedThing !== null && !isArray(nestedThing)) {
          longest = _measureText(ctx, data, gc, longest, nestedThing);
        }
      }
    }
  }
  ctx.restore();
  const gcLen = gc.length / 2;
  if (gcLen > arrayOfThings.length) {
    for (i = 0; i < gcLen; i++) {
      delete data[gc[i]];
    }
    gc.splice(0, gcLen);
  }
  return longest;
}
function _alignPixel(chart, pixel, width) {
  const devicePixelRatio = chart.currentDevicePixelRatio;
  const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
  return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
function clearCanvas(canvas, ctx) {
  ctx = ctx || canvas.getContext("2d");
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
function drawPoint(ctx, options2, x, y) {
  let type, xOffset, yOffset, size, cornerRadius;
  const style = options2.pointStyle;
  const rotation = options2.rotation;
  const radius = options2.radius;
  let rad = (rotation || 0) * RAD_PER_DEG;
  if (style && typeof style === "object") {
    type = style.toString();
    if (type === "[object HTMLImageElement]" || type === "[object HTMLCanvasElement]") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rad);
      ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
      ctx.restore();
      return;
    }
  }
  if (isNaN(radius) || radius <= 0) {
    return;
  }
  ctx.beginPath();
  switch (style) {
    default:
      ctx.arc(x, y, radius, 0, TAU);
      ctx.closePath();
      break;
    case "triangle":
      ctx.moveTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
      ctx.closePath();
      break;
    case "rectRounded":
      cornerRadius = radius * 0.516;
      size = radius - cornerRadius;
      xOffset = Math.cos(rad + QUARTER_PI) * size;
      yOffset = Math.sin(rad + QUARTER_PI) * size;
      ctx.arc(x - xOffset, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
      ctx.arc(x + yOffset, y - xOffset, cornerRadius, rad - HALF_PI, rad);
      ctx.arc(x + xOffset, y + yOffset, cornerRadius, rad, rad + HALF_PI);
      ctx.arc(x - yOffset, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
      ctx.closePath();
      break;
    case "rect":
      if (!rotation) {
        size = Math.SQRT1_2 * radius;
        ctx.rect(x - size, y - size, 2 * size, 2 * size);
        break;
      }
      rad += QUARTER_PI;
    case "rectRot":
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + yOffset, y - xOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      ctx.closePath();
      break;
    case "crossRot":
      rad += QUARTER_PI;
    case "cross":
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x + yOffset, y - xOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      break;
    case "star":
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x + yOffset, y - xOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      rad += QUARTER_PI;
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x + yOffset, y - xOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      break;
    case "line":
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      break;
    case "dash":
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(rad) * radius, y + Math.sin(rad) * radius);
      break;
  }
  ctx.fill();
  if (options2.borderWidth > 0) {
    ctx.stroke();
  }
}
function _isPointInArea(point, area, margin) {
  margin = margin || 0.5;
  return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
}
function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}
function unclipArea(ctx) {
  ctx.restore();
}
function _steppedLineTo(ctx, previous, target, flip, mode) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  if (mode === "middle") {
    const midpoint = (previous.x + target.x) / 2;
    ctx.lineTo(midpoint, previous.y);
    ctx.lineTo(midpoint, target.y);
  } else if (mode === "after" !== !!flip) {
    ctx.lineTo(previous.x, target.y);
  } else {
    ctx.lineTo(target.x, previous.y);
  }
  ctx.lineTo(target.x, target.y);
}
function _bezierCurveTo(ctx, previous, target, flip) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
}
function renderText(ctx, text, x, y, font, opts = {}) {
  const lines = isArray(text) ? text : [text];
  const stroke = opts.strokeWidth > 0 && opts.strokeColor !== "";
  let i, line;
  ctx.save();
  ctx.font = font.string;
  setRenderOpts(ctx, opts);
  for (i = 0; i < lines.length; ++i) {
    line = lines[i];
    if (stroke) {
      if (opts.strokeColor) {
        ctx.strokeStyle = opts.strokeColor;
      }
      if (!isNullOrUndef(opts.strokeWidth)) {
        ctx.lineWidth = opts.strokeWidth;
      }
      ctx.strokeText(line, x, y, opts.maxWidth);
    }
    ctx.fillText(line, x, y, opts.maxWidth);
    decorateText(ctx, x, y, line, opts);
    y += font.lineHeight;
  }
  ctx.restore();
}
function setRenderOpts(ctx, opts) {
  if (opts.translation) {
    ctx.translate(opts.translation[0], opts.translation[1]);
  }
  if (!isNullOrUndef(opts.rotation)) {
    ctx.rotate(opts.rotation);
  }
  if (opts.color) {
    ctx.fillStyle = opts.color;
  }
  if (opts.textAlign) {
    ctx.textAlign = opts.textAlign;
  }
  if (opts.textBaseline) {
    ctx.textBaseline = opts.textBaseline;
  }
}
function decorateText(ctx, x, y, line, opts) {
  if (opts.strikethrough || opts.underline) {
    const metrics = ctx.measureText(line);
    const left = x - metrics.actualBoundingBoxLeft;
    const right = x + metrics.actualBoundingBoxRight;
    const top = y - metrics.actualBoundingBoxAscent;
    const bottom = y + metrics.actualBoundingBoxDescent;
    const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.lineWidth = opts.decorationWidth || 2;
    ctx.moveTo(left, yDecoration);
    ctx.lineTo(right, yDecoration);
    ctx.stroke();
  }
}
function addRoundedRectPath(ctx, rect) {
  const { x, y, w, h, radius } = rect;
  ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, -HALF_PI, PI, true);
  ctx.lineTo(x, y + h - radius.bottomLeft);
  ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
  ctx.lineTo(x + w - radius.bottomRight, y + h);
  ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
  ctx.lineTo(x + w, y + radius.topRight);
  ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);
  ctx.lineTo(x + radius.topLeft, y);
}
function toLineHeight(value, size) {
  const matches = ("" + value).match(LINE_HEIGHT);
  if (!matches || matches[1] === "normal") {
    return size * 1.2;
  }
  value = +matches[2];
  switch (matches[3]) {
    case "px":
      return value;
    case "%":
      value /= 100;
      break;
  }
  return size * value;
}
function _readValueToProps(value, props) {
  const ret = {};
  const objProps = isObject(props);
  const keys = objProps ? Object.keys(props) : props;
  const read = isObject(value) ? objProps ? (prop) => valueOrDefault(value[prop], value[props[prop]]) : (prop) => value[prop] : () => value;
  for (const prop of keys) {
    ret[prop] = numberOrZero$1(read(prop));
  }
  return ret;
}
function toTRBL(value) {
  return _readValueToProps(value, { top: "y", right: "x", bottom: "y", left: "x" });
}
function toTRBLCorners(value) {
  return _readValueToProps(value, ["topLeft", "topRight", "bottomLeft", "bottomRight"]);
}
function toPadding(value) {
  const obj = toTRBL(value);
  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;
  return obj;
}
function toFont(options2, fallback) {
  options2 = options2 || {};
  fallback = fallback || defaults.font;
  let size = valueOrDefault(options2.size, fallback.size);
  if (typeof size === "string") {
    size = parseInt(size, 10);
  }
  let style = valueOrDefault(options2.style, fallback.style);
  if (style && !("" + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = "";
  }
  const font = {
    family: valueOrDefault(options2.family, fallback.family),
    lineHeight: toLineHeight(valueOrDefault(options2.lineHeight, fallback.lineHeight), size),
    size,
    style,
    weight: valueOrDefault(options2.weight, fallback.weight),
    string: ""
  };
  font.string = toFontString(font);
  return font;
}
function resolve(inputs, context, index, info) {
  let cacheable = true;
  let i, ilen, value;
  for (i = 0, ilen = inputs.length; i < ilen; ++i) {
    value = inputs[i];
    if (value === void 0) {
      continue;
    }
    if (context !== void 0 && typeof value === "function") {
      value = value(context);
      cacheable = false;
    }
    if (index !== void 0 && isArray(value)) {
      value = value[index % value.length];
      cacheable = false;
    }
    if (value !== void 0) {
      if (info && !cacheable) {
        info.cacheable = false;
      }
      return value;
    }
  }
}
function _addGrace(minmax, grace, beginAtZero) {
  const { min, max } = minmax;
  const change = toDimension(grace, (max - min) / 2);
  const keepZero = (value, add) => beginAtZero && value === 0 ? 0 : value + add;
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}
function createContext(parentContext, context) {
  return Object.assign(Object.create(parentContext), context);
}
function _lookup(table, value, cmp) {
  cmp = cmp || ((index) => table[index] < value);
  let hi = table.length - 1;
  let lo = 0;
  let mid;
  while (hi - lo > 1) {
    mid = lo + hi >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { lo, hi };
}
function _filterBetween(values, min, max) {
  let start = 0;
  let end = values.length;
  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }
  return start > 0 || end < values.length ? values.slice(start, end) : values;
}
function listenArrayEvents(array, listener) {
  if (array._chartjs) {
    array._chartjs.listeners.push(listener);
    return;
  }
  Object.defineProperty(array, "_chartjs", {
    configurable: true,
    enumerable: false,
    value: {
      listeners: [listener]
    }
  });
  arrayEvents.forEach((key) => {
    const method = "_onData" + _capitalize(key);
    const base2 = array[key];
    Object.defineProperty(array, key, {
      configurable: true,
      enumerable: false,
      value(...args) {
        const res = base2.apply(this, args);
        array._chartjs.listeners.forEach((object) => {
          if (typeof object[method] === "function") {
            object[method](...args);
          }
        });
        return res;
      }
    });
  });
}
function unlistenArrayEvents(array, listener) {
  const stub = array._chartjs;
  if (!stub) {
    return;
  }
  const listeners = stub.listeners;
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
  if (listeners.length > 0) {
    return;
  }
  arrayEvents.forEach((key) => {
    delete array[key];
  });
  delete array._chartjs;
}
function _arrayUnique(items) {
  const set2 = new Set();
  let i, ilen;
  for (i = 0, ilen = items.length; i < ilen; ++i) {
    set2.add(items[i]);
  }
  if (set2.size === ilen) {
    return items;
  }
  return Array.from(set2);
}
function _createResolver(scopes, prefixes = [""], rootScopes = scopes, fallback, getTarget2 = () => scopes[0]) {
  if (!defined(fallback)) {
    fallback = _resolve("_fallback", scopes);
  }
  const cache = {
    [Symbol.toStringTag]: "Object",
    _cacheable: true,
    _scopes: scopes,
    _rootScopes: rootScopes,
    _fallback: fallback,
    _getTarget: getTarget2,
    override: (scope) => _createResolver([scope, ...scopes], prefixes, rootScopes, fallback)
  };
  return new Proxy(cache, {
    deleteProperty(target, prop) {
      delete target[prop];
      delete target._keys;
      delete scopes[0][prop];
      return true;
    },
    get(target, prop) {
      return _cached(target, prop, () => _resolveWithPrefixes(prop, prefixes, scopes, target));
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(scopes[0]);
    },
    has(target, prop) {
      return getKeysFromAllScopes(target).includes(prop);
    },
    ownKeys(target) {
      return getKeysFromAllScopes(target);
    },
    set(target, prop, value) {
      const storage = target._storage || (target._storage = getTarget2());
      target[prop] = storage[prop] = value;
      delete target._keys;
      return true;
    }
  });
}
function _attachContext(proxy, context, subProxy, descriptorDefaults) {
  const cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
    override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
  };
  return new Proxy(cache, {
    deleteProperty(target, prop) {
      delete target[prop];
      delete proxy[prop];
      return true;
    },
    get(target, prop, receiver) {
      return _cached(target, prop, () => _resolveWithContext(target, prop, receiver));
    },
    getOwnPropertyDescriptor(target, prop) {
      return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? { enumerable: true, configurable: true } : void 0 : Reflect.getOwnPropertyDescriptor(proxy, prop);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(proxy);
    },
    has(target, prop) {
      return Reflect.has(proxy, prop);
    },
    ownKeys() {
      return Reflect.ownKeys(proxy);
    },
    set(target, prop, value) {
      proxy[prop] = value;
      delete target[prop];
      return true;
    }
  });
}
function _descriptors(proxy, defaults2 = { scriptable: true, indexable: true }) {
  const { _scriptable = defaults2.scriptable, _indexable = defaults2.indexable, _allKeys = defaults2.allKeys } = proxy;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}
function _cached(target, prop, resolve22) {
  if (Object.prototype.hasOwnProperty.call(target, prop)) {
    return target[prop];
  }
  const value = resolve22();
  target[prop] = value;
  return value;
}
function _resolveWithContext(target, prop, receiver) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  let value = _proxy[prop];
  if (isFunction(value) && descriptors2.isScriptable(prop)) {
    value = _resolveScriptable(prop, value, target, receiver);
  }
  if (isArray(value) && value.length) {
    value = _resolveArray(prop, value, target, descriptors2.isIndexable);
  }
  if (needsSubResolver(prop, value)) {
    value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors2);
  }
  return value;
}
function _resolveScriptable(prop, value, target, receiver) {
  const { _proxy, _context, _subProxy, _stack } = target;
  if (_stack.has(prop)) {
    throw new Error("Recursion detected: " + Array.from(_stack).join("->") + "->" + prop);
  }
  _stack.add(prop);
  value = value(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (needsSubResolver(prop, value)) {
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}
function _resolveArray(prop, value, target, isIndexable) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  if (defined(_context.index) && isIndexable(prop)) {
    value = value[_context.index % value.length];
  } else if (isObject(value[0])) {
    const arr = value;
    const scopes = _proxy._scopes.filter((s2) => s2 !== arr);
    value = [];
    for (const item of arr) {
      const resolver = createSubResolver(scopes, _proxy, prop, item);
      value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors2));
    }
  }
  return value;
}
function resolveFallback(fallback, prop, value) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}
function addScopes(set2, parentScopes, key, parentFallback) {
  for (const parent of parentScopes) {
    const scope = getScope(key, parent);
    if (scope) {
      set2.add(scope);
      const fallback = resolveFallback(scope._fallback, key, scope);
      if (defined(fallback) && fallback !== key && fallback !== parentFallback) {
        return fallback;
      }
    } else if (scope === false && defined(parentFallback) && key !== parentFallback) {
      return null;
    }
  }
  return false;
}
function createSubResolver(parentScopes, resolver, prop, value) {
  const rootScopes = resolver._rootScopes;
  const fallback = resolveFallback(resolver._fallback, prop, value);
  const allScopes = [...parentScopes, ...rootScopes];
  const set2 = new Set();
  set2.add(value);
  let key = addScopesFromKey(set2, allScopes, prop, fallback || prop);
  if (key === null) {
    return false;
  }
  if (defined(fallback) && fallback !== prop) {
    key = addScopesFromKey(set2, allScopes, fallback, key);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(Array.from(set2), [""], rootScopes, fallback, () => subGetTarget(resolver, prop, value));
}
function addScopesFromKey(set2, allScopes, key, fallback) {
  while (key) {
    key = addScopes(set2, allScopes, key, fallback);
  }
  return key;
}
function subGetTarget(resolver, prop, value) {
  const parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  const target = parent[prop];
  if (isArray(target) && isObject(value)) {
    return value;
  }
  return target;
}
function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
  let value;
  for (const prefix of prefixes) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (defined(value)) {
      return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
    }
  }
}
function _resolve(key, scopes) {
  for (const scope of scopes) {
    if (!scope) {
      continue;
    }
    const value = scope[key];
    if (defined(value)) {
      return value;
    }
  }
}
function getKeysFromAllScopes(target) {
  let keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}
function resolveKeysFromAllScopes(scopes) {
  const set2 = new Set();
  for (const scope of scopes) {
    for (const key of Object.keys(scope).filter((k) => !k.startsWith("_"))) {
      set2.add(key);
    }
  }
  return Array.from(set2);
}
function splineCurve(firstPoint, middlePoint, afterPoint, t) {
  const previous = firstPoint.skip ? middlePoint : firstPoint;
  const current = middlePoint;
  const next = afterPoint.skip ? middlePoint : afterPoint;
  const d01 = distanceBetweenPoints(current, previous);
  const d12 = distanceBetweenPoints(next, current);
  let s01 = d01 / (d01 + d12);
  let s12 = d12 / (d01 + d12);
  s01 = isNaN(s01) ? 0 : s01;
  s12 = isNaN(s12) ? 0 : s12;
  const fa = t * s01;
  const fb = t * s12;
  return {
    previous: {
      x: current.x - fa * (next.x - previous.x),
      y: current.y - fa * (next.y - previous.y)
    },
    next: {
      x: current.x + fb * (next.x - previous.x),
      y: current.y + fb * (next.y - previous.y)
    }
  };
}
function monotoneAdjust(points, deltaK, mK) {
  const pointsLen = points.length;
  let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen - 1; ++i) {
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent || !pointAfter) {
      continue;
    }
    if (almostEquals(deltaK[i], 0, EPSILON)) {
      mK[i] = mK[i + 1] = 0;
      continue;
    }
    alphaK = mK[i] / deltaK[i];
    betaK = mK[i + 1] / deltaK[i];
    squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
    if (squaredMagnitude <= 9) {
      continue;
    }
    tauK = 3 / Math.sqrt(squaredMagnitude);
    mK[i] = alphaK * tauK * deltaK[i];
    mK[i + 1] = betaK * tauK * deltaK[i];
  }
}
function monotoneCompute(points, mK, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  let delta, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    const iPixel = pointCurrent[indexAxis];
    const vPixel = pointCurrent[valueAxis];
    if (pointBefore) {
      delta = (iPixel - pointBefore[indexAxis]) / 3;
      pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
      pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i];
    }
    if (pointAfter) {
      delta = (pointAfter[indexAxis] - iPixel) / 3;
      pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
      pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i];
    }
  }
}
function splineCurveMonotone(points, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  const deltaK = Array(pointsLen).fill(0);
  const mK = Array(pointsLen);
  let i, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    if (pointAfter) {
      const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
      deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
    }
    mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : sign(deltaK[i - 1]) !== sign(deltaK[i]) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
  }
  monotoneAdjust(points, deltaK, mK);
  monotoneCompute(points, mK, indexAxis);
}
function capControlPoint(pt, min, max) {
  return Math.max(Math.min(pt, max), min);
}
function capBezierPoints(points, area) {
  let i, ilen, point, inArea, inAreaPrev;
  let inAreaNext = _isPointInArea(points[0], area);
  for (i = 0, ilen = points.length; i < ilen; ++i) {
    inAreaPrev = inArea;
    inArea = inAreaNext;
    inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area);
    if (!inArea) {
      continue;
    }
    point = points[i];
    if (inAreaPrev) {
      point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
      point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
    }
    if (inAreaNext) {
      point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
      point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
    }
  }
}
function _updateBezierControlPoints(points, options2, area, loop, indexAxis) {
  let i, ilen, point, controlPoints;
  if (options2.spanGaps) {
    points = points.filter((pt) => !pt.skip);
  }
  if (options2.cubicInterpolationMode === "monotone") {
    splineCurveMonotone(points, indexAxis);
  } else {
    let prev = loop ? points[points.length - 1] : points[0];
    for (i = 0, ilen = points.length; i < ilen; ++i) {
      point = points[i];
      controlPoints = splineCurve(prev, point, points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen], options2.tension);
      point.cp1x = controlPoints.previous.x;
      point.cp1y = controlPoints.previous.y;
      point.cp2x = controlPoints.next.x;
      point.cp2y = controlPoints.next.y;
      prev = point;
    }
  }
  if (options2.capBezierPoints) {
    capBezierPoints(points, area);
  }
}
function _isDomSupported() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
function _getParentNode(domNode) {
  let parent = domNode.parentNode;
  if (parent && parent.toString() === "[object ShadowRoot]") {
    parent = parent.host;
  }
  return parent;
}
function parseMaxStyle(styleValue, node, parentProperty) {
  let valueInPixels;
  if (typeof styleValue === "string") {
    valueInPixels = parseInt(styleValue, 10);
    if (styleValue.indexOf("%") !== -1) {
      valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
    }
  } else {
    valueInPixels = styleValue;
  }
  return valueInPixels;
}
function getStyle(el, property) {
  return getComputedStyle(el).getPropertyValue(property);
}
function getPositionedStyle(styles, style, suffix) {
  const result = {};
  suffix = suffix ? "-" + suffix : "";
  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    result[pos] = parseFloat(styles[style + "-" + pos + suffix]) || 0;
  }
  result.width = result.left + result.right;
  result.height = result.top + result.bottom;
  return result;
}
function getCanvasPosition(evt, canvas) {
  const e = evt.native || evt;
  const touches = e.touches;
  const source = touches && touches.length ? touches[0] : e;
  const { offsetX, offsetY } = source;
  let box = false;
  let x, y;
  if (useOffsetPos(offsetX, offsetY, e.target)) {
    x = offsetX;
    y = offsetY;
  } else {
    const rect = canvas.getBoundingClientRect();
    x = source.clientX - rect.left;
    y = source.clientY - rect.top;
    box = true;
  }
  return { x, y, box };
}
function getRelativePosition$1(evt, chart) {
  const { canvas, currentDevicePixelRatio } = chart;
  const style = getComputedStyle(canvas);
  const borderBox = style.boxSizing === "border-box";
  const paddings = getPositionedStyle(style, "padding");
  const borders = getPositionedStyle(style, "border", "width");
  const { x, y, box } = getCanvasPosition(evt, canvas);
  const xOffset = paddings.left + (box && borders.left);
  const yOffset = paddings.top + (box && borders.top);
  let { width, height } = chart;
  if (borderBox) {
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  return {
    x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
    y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
  };
}
function getContainerSize(canvas, width, height) {
  let maxWidth, maxHeight;
  if (width === void 0 || height === void 0) {
    const container = _getParentNode(canvas);
    if (!container) {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    } else {
      const rect = container.getBoundingClientRect();
      const containerStyle = getComputedStyle(container);
      const containerBorder = getPositionedStyle(containerStyle, "border", "width");
      const containerPadding = getPositionedStyle(containerStyle, "padding");
      width = rect.width - containerPadding.width - containerBorder.width;
      height = rect.height - containerPadding.height - containerBorder.height;
      maxWidth = parseMaxStyle(containerStyle.maxWidth, container, "clientWidth");
      maxHeight = parseMaxStyle(containerStyle.maxHeight, container, "clientHeight");
    }
  }
  return {
    width,
    height,
    maxWidth: maxWidth || INFINITY,
    maxHeight: maxHeight || INFINITY
  };
}
function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
  const style = getComputedStyle(canvas);
  const margins = getPositionedStyle(style, "margin");
  const maxWidth = parseMaxStyle(style.maxWidth, canvas, "clientWidth") || INFINITY;
  const maxHeight = parseMaxStyle(style.maxHeight, canvas, "clientHeight") || INFINITY;
  const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
  let { width, height } = containerSize;
  if (style.boxSizing === "content-box") {
    const borders = getPositionedStyle(style, "border", "width");
    const paddings = getPositionedStyle(style, "padding");
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  width = Math.max(0, width - margins.width);
  height = Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height - margins.height);
  width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
  height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
  if (width && !height) {
    height = round1(width / 2);
  }
  return {
    width,
    height
  };
}
function retinaScale(chart, forceRatio, forceStyle) {
  const pixelRatio = forceRatio || 1;
  const deviceHeight = Math.floor(chart.height * pixelRatio);
  const deviceWidth = Math.floor(chart.width * pixelRatio);
  chart.height = deviceHeight / pixelRatio;
  chart.width = deviceWidth / pixelRatio;
  const canvas = chart.canvas;
  if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
    canvas.style.height = `${chart.height}px`;
    canvas.style.width = `${chart.width}px`;
  }
  if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) {
    chart.currentDevicePixelRatio = pixelRatio;
    canvas.height = deviceHeight;
    canvas.width = deviceWidth;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return true;
  }
  return false;
}
function readUsedSize(element, property) {
  const value = getStyle(element, property);
  const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
  return matches ? +matches[1] : void 0;
}
function _pointInLine(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}
function _steppedInterpolation(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: mode === "middle" ? t < 0.5 ? p1.y : p2.y : mode === "after" ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y
  };
}
function _bezierInterpolation(p1, p2, t, mode) {
  const cp1 = { x: p1.cp2x, y: p1.cp2y };
  const cp2 = { x: p2.cp1x, y: p2.cp1y };
  const a = _pointInLine(p1, cp1, t);
  const b = _pointInLine(cp1, cp2, t);
  const c = _pointInLine(cp2, p2, t);
  const d2 = _pointInLine(a, b, t);
  const e = _pointInLine(b, c, t);
  return _pointInLine(d2, e, t);
}
function getNumberFormat(locale, options2) {
  options2 = options2 || {};
  const cacheKey = locale + JSON.stringify(options2);
  let formatter = intlCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options2);
    intlCache.set(cacheKey, formatter);
  }
  return formatter;
}
function formatNumber(num, locale, options2) {
  return getNumberFormat(locale, options2).format(num);
}
function getRtlAdapter(rtl, rectX, width) {
  return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}
function overrideTextDirection(ctx, direction) {
  let style, original;
  if (direction === "ltr" || direction === "rtl") {
    style = ctx.canvas.style;
    original = [
      style.getPropertyValue("direction"),
      style.getPropertyPriority("direction")
    ];
    style.setProperty("direction", direction, "important");
    ctx.prevTextDirection = original;
  }
}
function restoreTextDirection(ctx, original) {
  if (original !== void 0) {
    delete ctx.prevTextDirection;
    ctx.canvas.style.setProperty("direction", original[0], original[1]);
  }
}
function propertyFn(property) {
  if (property === "angle") {
    return {
      between: _angleBetween,
      compare: _angleDiff,
      normalize: _normalizeAngle
    };
  }
  return {
    between: _isBetween,
    compare: (a, b) => a - b,
    normalize: (x) => x
  };
}
function normalizeSegment({ start, end, count, loop, style }) {
  return {
    start: start % count,
    end: end % count,
    loop: loop && (end - start + 1) % count === 0,
    style
  };
}
function getSegment(segment, points, bounds) {
  const { property, start: startBound, end: endBound } = bounds;
  const { between, normalize: normalize2 } = propertyFn(property);
  const count = points.length;
  let { start, end, loop } = segment;
  let i, ilen;
  if (loop) {
    start += count;
    end += count;
    for (i = 0, ilen = count; i < ilen; ++i) {
      if (!between(normalize2(points[start % count][property]), startBound, endBound)) {
        break;
      }
      start--;
      end--;
    }
    start %= count;
    end %= count;
  }
  if (end < start) {
    end += count;
  }
  return { start, end, loop, style: segment.style };
}
function _boundSegment(segment, points, bounds) {
  if (!bounds) {
    return [segment];
  }
  const { property, start: startBound, end: endBound } = bounds;
  const count = points.length;
  const { compare, between, normalize: normalize2 } = propertyFn(property);
  const { start, end, loop, style } = getSegment(segment, points, bounds);
  const result = [];
  let inside = false;
  let subStart = null;
  let value, point, prevValue;
  const startIsBefore = () => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
  const endIsBefore = () => compare(endBound, value) === 0 || between(endBound, prevValue, value);
  const shouldStart = () => inside || startIsBefore();
  const shouldStop = () => !inside || endIsBefore();
  for (let i = start, prev = start; i <= end; ++i) {
    point = points[i % count];
    if (point.skip) {
      continue;
    }
    value = normalize2(point[property]);
    if (value === prevValue) {
      continue;
    }
    inside = between(value, startBound, endBound);
    if (subStart === null && shouldStart()) {
      subStart = compare(value, startBound) === 0 ? i : prev;
    }
    if (subStart !== null && shouldStop()) {
      result.push(normalizeSegment({ start: subStart, end: i, loop, count, style }));
      subStart = null;
    }
    prev = i;
    prevValue = value;
  }
  if (subStart !== null) {
    result.push(normalizeSegment({ start: subStart, end, loop, count, style }));
  }
  return result;
}
function _boundSegments(line, bounds) {
  const result = [];
  const segments = line.segments;
  for (let i = 0; i < segments.length; i++) {
    const sub = _boundSegment(segments[i], line.points, bounds);
    if (sub.length) {
      result.push(...sub);
    }
  }
  return result;
}
function findStartAndEnd(points, count, loop, spanGaps) {
  let start = 0;
  let end = count - 1;
  if (loop && !spanGaps) {
    while (start < count && !points[start].skip) {
      start++;
    }
  }
  while (start < count && points[start].skip) {
    start++;
  }
  start %= count;
  if (loop) {
    end += start;
  }
  while (end > start && points[end % count].skip) {
    end--;
  }
  end %= count;
  return { start, end };
}
function solidSegments(points, start, max, loop) {
  const count = points.length;
  const result = [];
  let last = start;
  let prev = points[start];
  let end;
  for (end = start + 1; end <= max; ++end) {
    const cur = points[end % count];
    if (cur.skip || cur.stop) {
      if (!prev.skip) {
        loop = false;
        result.push({ start: start % count, end: (end - 1) % count, loop });
        start = last = cur.stop ? end : null;
      }
    } else {
      last = end;
      if (prev.skip) {
        start = end;
      }
    }
    prev = cur;
  }
  if (last !== null) {
    result.push({ start: start % count, end: last % count, loop });
  }
  return result;
}
function _computeSegments(line, segmentOptions) {
  const points = line.points;
  const spanGaps = line.options.spanGaps;
  const count = points.length;
  if (!count) {
    return [];
  }
  const loop = !!line._loop;
  const { start, end } = findStartAndEnd(points, count, loop, spanGaps);
  if (spanGaps === true) {
    return splitByStyles(line, [{ start, end, loop }], points, segmentOptions);
  }
  const max = end < start ? end + count : end;
  const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
  return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}
function splitByStyles(line, segments, points, segmentOptions) {
  if (!segmentOptions || !segmentOptions.setContext || !points) {
    return segments;
  }
  return doSplitByStyles(line, segments, points, segmentOptions);
}
function doSplitByStyles(line, segments, points, segmentOptions) {
  const chartContext = line._chart.getContext();
  const baseStyle = readStyle(line.options);
  const { _datasetIndex: datasetIndex, options: { spanGaps } } = line;
  const count = points.length;
  const result = [];
  let prevStyle = baseStyle;
  let start = segments[0].start;
  let i = start;
  function addStyle(s2, e, l, st) {
    const dir = spanGaps ? -1 : 1;
    if (s2 === e) {
      return;
    }
    s2 += count;
    while (points[s2 % count].skip) {
      s2 -= dir;
    }
    while (points[e % count].skip) {
      e += dir;
    }
    if (s2 % count !== e % count) {
      result.push({ start: s2 % count, end: e % count, loop: l, style: st });
      prevStyle = st;
      start = e % count;
    }
  }
  for (const segment of segments) {
    start = spanGaps ? start : segment.start;
    let prev = points[start % count];
    let style;
    for (i = start + 1; i <= segment.end; i++) {
      const pt = points[i % count];
      style = readStyle(segmentOptions.setContext(createContext(chartContext, {
        type: "segment",
        p0: prev,
        p1: pt,
        p0DataIndex: (i - 1) % count,
        p1DataIndex: i % count,
        datasetIndex
      })));
      if (styleChanged(style, prevStyle)) {
        addStyle(start, i - 1, segment.loop, prevStyle);
      }
      prev = pt;
      prevStyle = style;
    }
    if (start < i - 1) {
      addStyle(start, i - 1, segment.loop, prevStyle);
    }
  }
  return result;
}
function readStyle(options2) {
  return {
    backgroundColor: options2.backgroundColor,
    borderCapStyle: options2.borderCapStyle,
    borderDash: options2.borderDash,
    borderDashOffset: options2.borderDashOffset,
    borderJoinStyle: options2.borderJoinStyle,
    borderWidth: options2.borderWidth,
    borderColor: options2.borderColor
  };
}
function styleChanged(style, prevStyle) {
  return prevStyle && JSON.stringify(style) !== JSON.stringify(prevStyle);
}
function awaitAll(animations, properties) {
  const running = [];
  const keys = Object.keys(properties);
  for (let i = 0; i < keys.length; i++) {
    const anim = animations[keys[i]];
    if (anim && anim.active()) {
      running.push(anim.wait());
    }
  }
  return Promise.all(running);
}
function resolveTargetOptions(target, newOptions) {
  if (!newOptions) {
    return;
  }
  let options2 = target.options;
  if (!options2) {
    target.options = newOptions;
    return;
  }
  if (options2.$shared) {
    target.options = options2 = Object.assign({}, options2, { $shared: false, $animations: {} });
  }
  return options2;
}
function scaleClip(scale, allowedOverflow) {
  const opts = scale && scale.options || {};
  const reverse = opts.reverse;
  const min = opts.min === void 0 ? allowedOverflow : 0;
  const max = opts.max === void 0 ? allowedOverflow : 0;
  return {
    start: reverse ? max : min,
    end: reverse ? min : max
  };
}
function defaultClip(xScale, yScale, allowedOverflow) {
  if (allowedOverflow === false) {
    return false;
  }
  const x = scaleClip(xScale, allowedOverflow);
  const y = scaleClip(yScale, allowedOverflow);
  return {
    top: y.end,
    right: x.end,
    bottom: y.start,
    left: x.start
  };
}
function toClip(value) {
  let t, r, b, l;
  if (isObject(value)) {
    t = value.top;
    r = value.right;
    b = value.bottom;
    l = value.left;
  } else {
    t = r = b = l = value;
  }
  return {
    top: t,
    right: r,
    bottom: b,
    left: l,
    disabled: value === false
  };
}
function getSortedDatasetIndices(chart, filterVisible) {
  const keys = [];
  const metasets = chart._getSortedDatasetMetas(filterVisible);
  let i, ilen;
  for (i = 0, ilen = metasets.length; i < ilen; ++i) {
    keys.push(metasets[i].index);
  }
  return keys;
}
function applyStack(stack, value, dsIndex, options2 = {}) {
  const keys = stack.keys;
  const singleMode = options2.mode === "single";
  let i, ilen, datasetIndex, otherValue;
  if (value === null) {
    return;
  }
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    datasetIndex = +keys[i];
    if (datasetIndex === dsIndex) {
      if (options2.all) {
        continue;
      }
      break;
    }
    otherValue = stack.values[datasetIndex];
    if (isNumberFinite(otherValue) && (singleMode || (value === 0 || sign(value) === sign(otherValue)))) {
      value += otherValue;
    }
  }
  return value;
}
function convertObjectDataToArray(data) {
  const keys = Object.keys(data);
  const adata = new Array(keys.length);
  let i, ilen, key;
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    key = keys[i];
    adata[i] = {
      x: key,
      y: data[key]
    };
  }
  return adata;
}
function isStacked(scale, meta) {
  const stacked = scale && scale.options.stacked;
  return stacked || stacked === void 0 && meta.stack !== void 0;
}
function getStackKey(indexScale, valueScale, meta) {
  return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
}
function getUserBounds(scale) {
  const { min, max, minDefined, maxDefined } = scale.getUserBounds();
  return {
    min: minDefined ? min : Number.NEGATIVE_INFINITY,
    max: maxDefined ? max : Number.POSITIVE_INFINITY
  };
}
function getOrCreateStack(stacks, stackKey, indexValue) {
  const subStack = stacks[stackKey] || (stacks[stackKey] = {});
  return subStack[indexValue] || (subStack[indexValue] = {});
}
function getLastIndexInStack(stack, vScale, positive, type) {
  for (const meta of vScale.getMatchingVisibleMetas(type).reverse()) {
    const value = stack[meta.index];
    if (positive && value > 0 || !positive && value < 0) {
      return meta.index;
    }
  }
  return null;
}
function updateStacks(controller, parsed) {
  const { chart, _cachedMeta: meta } = controller;
  const stacks = chart._stacks || (chart._stacks = {});
  const { iScale, vScale, index: datasetIndex } = meta;
  const iAxis = iScale.axis;
  const vAxis = vScale.axis;
  const key = getStackKey(iScale, vScale, meta);
  const ilen = parsed.length;
  let stack;
  for (let i = 0; i < ilen; ++i) {
    const item = parsed[i];
    const { [iAxis]: index, [vAxis]: value } = item;
    const itemStacks = item._stacks || (item._stacks = {});
    stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
    stack[datasetIndex] = value;
    stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
    stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
  }
}
function getFirstScaleId(chart, axis) {
  const scales2 = chart.scales;
  return Object.keys(scales2).filter((key) => scales2[key].axis === axis).shift();
}
function createDatasetContext(parent, index) {
  return createContext(parent, {
    active: false,
    dataset: void 0,
    datasetIndex: index,
    index,
    mode: "default",
    type: "dataset"
  });
}
function createDataContext(parent, index, element) {
  return createContext(parent, {
    active: false,
    dataIndex: index,
    parsed: void 0,
    raw: void 0,
    element,
    index,
    mode: "default",
    type: "data"
  });
}
function clearStacks(meta, items) {
  const datasetIndex = meta.controller.index;
  const axis = meta.vScale && meta.vScale.axis;
  if (!axis) {
    return;
  }
  items = items || meta._parsed;
  for (const parsed of items) {
    const stacks = parsed._stacks;
    if (!stacks || stacks[axis] === void 0 || stacks[axis][datasetIndex] === void 0) {
      return;
    }
    delete stacks[axis][datasetIndex];
  }
}
function getAllScaleValues(scale, type) {
  if (!scale._cache.$bar) {
    const visibleMetas = scale.getMatchingVisibleMetas(type);
    let values = [];
    for (let i = 0, ilen = visibleMetas.length; i < ilen; i++) {
      values = values.concat(visibleMetas[i].controller.getAllParsedValues(scale));
    }
    scale._cache.$bar = _arrayUnique(values.sort((a, b) => a - b));
  }
  return scale._cache.$bar;
}
function computeMinSampleSize(meta) {
  const scale = meta.iScale;
  const values = getAllScaleValues(scale, meta.type);
  let min = scale._length;
  let i, ilen, curr, prev;
  const updateMinAndPrev = () => {
    if (curr === 32767 || curr === -32768) {
      return;
    }
    if (defined(prev)) {
      min = Math.min(min, Math.abs(curr - prev) || min);
    }
    prev = curr;
  };
  for (i = 0, ilen = values.length; i < ilen; ++i) {
    curr = scale.getPixelForValue(values[i]);
    updateMinAndPrev();
  }
  prev = void 0;
  for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
    curr = scale.getPixelForTick(i);
    updateMinAndPrev();
  }
  return min;
}
function computeFitCategoryTraits(index, ruler, options2, stackCount) {
  const thickness = options2.barThickness;
  let size, ratio;
  if (isNullOrUndef(thickness)) {
    size = ruler.min * options2.categoryPercentage;
    ratio = options2.barPercentage;
  } else {
    size = thickness * stackCount;
    ratio = 1;
  }
  return {
    chunk: size / stackCount,
    ratio,
    start: ruler.pixels[index] - size / 2
  };
}
function computeFlexCategoryTraits(index, ruler, options2, stackCount) {
  const pixels = ruler.pixels;
  const curr = pixels[index];
  let prev = index > 0 ? pixels[index - 1] : null;
  let next = index < pixels.length - 1 ? pixels[index + 1] : null;
  const percent = options2.categoryPercentage;
  if (prev === null) {
    prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
  }
  if (next === null) {
    next = curr + curr - prev;
  }
  const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
  const size = Math.abs(next - prev) / 2 * percent;
  return {
    chunk: size / stackCount,
    ratio: options2.barPercentage,
    start
  };
}
function parseFloatBar(entry, item, vScale, i) {
  const startValue = vScale.parse(entry[0], i);
  const endValue = vScale.parse(entry[1], i);
  const min = Math.min(startValue, endValue);
  const max = Math.max(startValue, endValue);
  let barStart = min;
  let barEnd = max;
  if (Math.abs(min) > Math.abs(max)) {
    barStart = max;
    barEnd = min;
  }
  item[vScale.axis] = barEnd;
  item._custom = {
    barStart,
    barEnd,
    start: startValue,
    end: endValue,
    min,
    max
  };
}
function parseValue(entry, item, vScale, i) {
  if (isArray(entry)) {
    parseFloatBar(entry, item, vScale, i);
  } else {
    item[vScale.axis] = vScale.parse(entry, i);
  }
  return item;
}
function parseArrayOrPrimitive(meta, data, start, count) {
  const iScale = meta.iScale;
  const vScale = meta.vScale;
  const labels = iScale.getLabels();
  const singleScale = iScale === vScale;
  const parsed = [];
  let i, ilen, item, entry;
  for (i = start, ilen = start + count; i < ilen; ++i) {
    entry = data[i];
    item = {};
    item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
    parsed.push(parseValue(entry, item, vScale, i));
  }
  return parsed;
}
function isFloatBar(custom) {
  return custom && custom.barStart !== void 0 && custom.barEnd !== void 0;
}
function barSign(size, vScale, actualBase) {
  if (size !== 0) {
    return sign(size);
  }
  return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
}
function borderProps(properties) {
  let reverse, start, end, top, bottom;
  if (properties.horizontal) {
    reverse = properties.base > properties.x;
    start = "left";
    end = "right";
  } else {
    reverse = properties.base < properties.y;
    start = "bottom";
    end = "top";
  }
  if (reverse) {
    top = "end";
    bottom = "start";
  } else {
    top = "start";
    bottom = "end";
  }
  return { start, end, reverse, top, bottom };
}
function setBorderSkipped(properties, options2, stack, index) {
  let edge = options2.borderSkipped;
  const res = {};
  if (!edge) {
    properties.borderSkipped = res;
    return;
  }
  const { start, end, reverse, top, bottom } = borderProps(properties);
  if (edge === "middle" && stack) {
    properties.enableBorderRadius = true;
    if ((stack._top || 0) === index) {
      edge = top;
    } else if ((stack._bottom || 0) === index) {
      edge = bottom;
    } else {
      res[parseEdge(bottom, start, end, reverse)] = true;
      edge = top;
    }
  }
  res[parseEdge(edge, start, end, reverse)] = true;
  properties.borderSkipped = res;
}
function parseEdge(edge, a, b, reverse) {
  if (reverse) {
    edge = swap(edge, a, b);
    edge = startEnd(edge, b, a);
  } else {
    edge = startEnd(edge, a, b);
  }
  return edge;
}
function swap(orig, v1, v2) {
  return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}
function startEnd(v, start, end) {
  return v === "start" ? start : v === "end" ? end : v;
}
function setInflateAmount(properties, { inflateAmount }, ratio) {
  properties.inflateAmount = inflateAmount === "auto" ? ratio === 1 ? 0.33 : 0 : inflateAmount;
}
function getRatioAndOffset(rotation, circumference, cutout) {
  let ratioX = 1;
  let ratioY = 1;
  let offsetX = 0;
  let offsetY = 0;
  if (circumference < TAU) {
    const startAngle = rotation;
    const endAngle = startAngle + circumference;
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    const calcMax = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout);
    const calcMin = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout);
    const maxX = calcMax(0, startX, endX);
    const maxY = calcMax(HALF_PI, startY, endY);
    const minX = calcMin(PI, startX, endX);
    const minY = calcMin(PI + HALF_PI, startY, endY);
    ratioX = (maxX - minX) / 2;
    ratioY = (maxY - minY) / 2;
    offsetX = -(maxX + minX) / 2;
    offsetY = -(maxY + minY) / 2;
  }
  return { ratioX, ratioY, offsetX, offsetY };
}
function getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
  const pointCount = points.length;
  let start = 0;
  let count = pointCount;
  if (meta._sorted) {
    const { iScale, _parsed } = meta;
    const axis = iScale.axis;
    const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
    if (minDefined) {
      start = _limitValue(Math.min(_lookupByKey(_parsed, iScale.axis, min).lo, animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo), 0, pointCount - 1);
    }
    if (maxDefined) {
      count = _limitValue(Math.max(_lookupByKey(_parsed, iScale.axis, max).hi + 1, animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max)).hi + 1), start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
  }
  return { start, count };
}
function scaleRangesChanged(meta) {
  const { xScale, yScale, _scaleRanges } = meta;
  const newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
  Object.assign(_scaleRanges, newRanges);
  return changed;
}
function abstract() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
function getRelativePosition(e, chart) {
  if ("native" in e) {
    return {
      x: e.x,
      y: e.y
    };
  }
  return getRelativePosition$1(e, chart);
}
function evaluateAllVisibleItems(chart, handler) {
  const metasets = chart.getSortedVisibleDatasetMetas();
  let index, data, element;
  for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
    ({ index, data } = metasets[i]);
    for (let j = 0, jlen = data.length; j < jlen; ++j) {
      element = data[j];
      if (!element.skip) {
        handler(element, index, j);
      }
    }
  }
}
function binarySearch(metaset, axis, value, intersect) {
  const { controller, data, _sorted } = metaset;
  const iScale = controller._cachedMeta.iScale;
  if (iScale && axis === iScale.axis && _sorted && data.length) {
    const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
    if (!intersect) {
      return lookupMethod(data, axis, value);
    } else if (controller._sharedOptions) {
      const el = data[0];
      const range = typeof el.getRange === "function" && el.getRange(axis);
      if (range) {
        const start = lookupMethod(data, axis, value - range);
        const end = lookupMethod(data, axis, value + range);
        return { lo: start.lo, hi: end.hi };
      }
    }
  }
  return { lo: 0, hi: data.length - 1 };
}
function optimizedEvaluateItems(chart, axis, position, handler, intersect) {
  const metasets = chart.getSortedVisibleDatasetMetas();
  const value = position[axis];
  for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
    const { index, data } = metasets[i];
    const { lo, hi } = binarySearch(metasets[i], axis, value, intersect);
    for (let j = lo; j <= hi; ++j) {
      const element = data[j];
      if (!element.skip) {
        handler(element, index, j);
      }
    }
  }
}
function getDistanceMetricForAxis(axis) {
  const useX = axis.indexOf("x") !== -1;
  const useY = axis.indexOf("y") !== -1;
  return function(pt1, pt2) {
    const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
    const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  };
}
function getIntersectItems(chart, position, axis, useFinalPosition) {
  const items = [];
  if (!_isPointInArea(position, chart.chartArea, chart._minPadding)) {
    return items;
  }
  const evaluationFunc = function(element, datasetIndex, index) {
    if (element.inRange(position.x, position.y, useFinalPosition)) {
      items.push({ element, datasetIndex, index });
    }
  };
  optimizedEvaluateItems(chart, axis, position, evaluationFunc, true);
  return items;
}
function getNearestItems(chart, position, axis, intersect, useFinalPosition) {
  const distanceMetric = getDistanceMetricForAxis(axis);
  let minDistance = Number.POSITIVE_INFINITY;
  let items = [];
  if (!_isPointInArea(position, chart.chartArea, chart._minPadding)) {
    return items;
  }
  const evaluationFunc = function(element, datasetIndex, index) {
    if (intersect && !element.inRange(position.x, position.y, useFinalPosition)) {
      return;
    }
    const center = element.getCenterPoint(useFinalPosition);
    if (!_isPointInArea(center, chart.chartArea, chart._minPadding) && !element.inRange(position.x, position.y, useFinalPosition)) {
      return;
    }
    const distance = distanceMetric(position, center);
    if (distance < minDistance) {
      items = [{ element, datasetIndex, index }];
      minDistance = distance;
    } else if (distance === minDistance) {
      items.push({ element, datasetIndex, index });
    }
  };
  optimizedEvaluateItems(chart, axis, position, evaluationFunc);
  return items;
}
function getAxisItems(chart, e, options2, useFinalPosition) {
  const position = getRelativePosition(e, chart);
  const items = [];
  const axis = options2.axis;
  const rangeMethod = axis === "x" ? "inXRange" : "inYRange";
  let intersectsItem = false;
  evaluateAllVisibleItems(chart, (element, datasetIndex, index) => {
    if (element[rangeMethod](position[axis], useFinalPosition)) {
      items.push({ element, datasetIndex, index });
    }
    if (element.inRange(position.x, position.y, useFinalPosition)) {
      intersectsItem = true;
    }
  });
  if (options2.intersect && !intersectsItem) {
    return [];
  }
  return items;
}
function filterByPosition(array, position) {
  return array.filter((v) => v.pos === position);
}
function filterDynamicPositionByAxis(array, axis) {
  return array.filter((v) => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
}
function sortByWeight(array, reverse) {
  return array.sort((a, b) => {
    const v0 = reverse ? b : a;
    const v1 = reverse ? a : b;
    return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
  });
}
function wrapBoxes(boxes) {
  const layoutBoxes = [];
  let i, ilen, box, pos, stack, stackWeight;
  for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
    box = boxes[i];
    ({ position: pos, options: { stack, stackWeight = 1 } } = box);
    layoutBoxes.push({
      index: i,
      box,
      pos,
      horizontal: box.isHorizontal(),
      weight: box.weight,
      stack: stack && pos + stack,
      stackWeight
    });
  }
  return layoutBoxes;
}
function buildStacks(layouts2) {
  const stacks = {};
  for (const wrap of layouts2) {
    const { stack, pos, stackWeight } = wrap;
    if (!stack || !STATIC_POSITIONS.includes(pos)) {
      continue;
    }
    const _stack = stacks[stack] || (stacks[stack] = { count: 0, placed: 0, weight: 0, size: 0 });
    _stack.count++;
    _stack.weight += stackWeight;
  }
  return stacks;
}
function setLayoutDims(layouts2, params) {
  const stacks = buildStacks(layouts2);
  const { vBoxMaxWidth, hBoxMaxHeight } = params;
  let i, ilen, layout;
  for (i = 0, ilen = layouts2.length; i < ilen; ++i) {
    layout = layouts2[i];
    const { fullSize } = layout.box;
    const stack = stacks[layout.stack];
    const factor = stack && layout.stackWeight / stack.weight;
    if (layout.horizontal) {
      layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
      layout.height = hBoxMaxHeight;
    } else {
      layout.width = vBoxMaxWidth;
      layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
    }
  }
  return stacks;
}
function buildLayoutBoxes(boxes) {
  const layoutBoxes = wrapBoxes(boxes);
  const fullSize = sortByWeight(layoutBoxes.filter((wrap) => wrap.box.fullSize), true);
  const left = sortByWeight(filterByPosition(layoutBoxes, "left"), true);
  const right = sortByWeight(filterByPosition(layoutBoxes, "right"));
  const top = sortByWeight(filterByPosition(layoutBoxes, "top"), true);
  const bottom = sortByWeight(filterByPosition(layoutBoxes, "bottom"));
  const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, "x");
  const centerVertical = filterDynamicPositionByAxis(layoutBoxes, "y");
  return {
    fullSize,
    leftAndTop: left.concat(top),
    rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
    chartArea: filterByPosition(layoutBoxes, "chartArea"),
    vertical: left.concat(right).concat(centerVertical),
    horizontal: top.concat(bottom).concat(centerHorizontal)
  };
}
function getCombinedMax(maxPadding, chartArea, a, b) {
  return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}
function updateMaxPadding(maxPadding, boxPadding) {
  maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
  maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
  maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
  maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
}
function updateDims(chartArea, params, layout, stacks) {
  const { pos, box } = layout;
  const maxPadding = chartArea.maxPadding;
  if (!isObject(pos)) {
    if (layout.size) {
      chartArea[pos] -= layout.size;
    }
    const stack = stacks[layout.stack] || { size: 0, count: 1 };
    stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
    layout.size = stack.size / stack.count;
    chartArea[pos] += layout.size;
  }
  if (box.getPadding) {
    updateMaxPadding(maxPadding, box.getPadding());
  }
  const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, "left", "right"));
  const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, "top", "bottom"));
  const widthChanged = newWidth !== chartArea.w;
  const heightChanged = newHeight !== chartArea.h;
  chartArea.w = newWidth;
  chartArea.h = newHeight;
  return layout.horizontal ? { same: widthChanged, other: heightChanged } : { same: heightChanged, other: widthChanged };
}
function handleMaxPadding(chartArea) {
  const maxPadding = chartArea.maxPadding;
  function updatePos(pos) {
    const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
    chartArea[pos] += change;
    return change;
  }
  chartArea.y += updatePos("top");
  chartArea.x += updatePos("left");
  updatePos("right");
  updatePos("bottom");
}
function getMargins(horizontal, chartArea) {
  const maxPadding = chartArea.maxPadding;
  function marginForPositions(positions2) {
    const margin = { left: 0, top: 0, right: 0, bottom: 0 };
    positions2.forEach((pos) => {
      margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
    });
    return margin;
  }
  return horizontal ? marginForPositions(["left", "right"]) : marginForPositions(["top", "bottom"]);
}
function fitBoxes(boxes, chartArea, params, stacks) {
  const refitBoxes = [];
  let i, ilen, layout, box, refit, changed;
  for (i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i) {
    layout = boxes[i];
    box = layout.box;
    box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea));
    const { same, other } = updateDims(chartArea, params, layout, stacks);
    refit |= same && refitBoxes.length;
    changed = changed || other;
    if (!box.fullSize) {
      refitBoxes.push(layout);
    }
  }
  return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
}
function setBoxDims(box, left, top, width, height) {
  box.top = top;
  box.left = left;
  box.right = left + width;
  box.bottom = top + height;
  box.width = width;
  box.height = height;
}
function placeBoxes(boxes, chartArea, params, stacks) {
  const userPadding = params.padding;
  let { x, y } = chartArea;
  for (const layout of boxes) {
    const box = layout.box;
    const stack = stacks[layout.stack] || { count: 1, placed: 0, weight: 1 };
    const weight = layout.stackWeight / stack.weight || 1;
    if (layout.horizontal) {
      const width = chartArea.w * weight;
      const height = stack.size || box.height;
      if (defined(stack.start)) {
        y = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height);
      } else {
        setBoxDims(box, chartArea.left + stack.placed, y, width, height);
      }
      stack.start = y;
      stack.placed += width;
      y = box.bottom;
    } else {
      const height = chartArea.h * weight;
      const width = stack.size || box.width;
      if (defined(stack.start)) {
        x = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, x, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
      } else {
        setBoxDims(box, x, chartArea.top + stack.placed, width, height);
      }
      stack.start = x;
      stack.placed += height;
      x = box.right;
    }
  }
  chartArea.x = x;
  chartArea.y = y;
}
function initCanvas(canvas, aspectRatio) {
  const style = canvas.style;
  const renderHeight = canvas.getAttribute("height");
  const renderWidth = canvas.getAttribute("width");
  canvas[EXPANDO_KEY] = {
    initial: {
      height: renderHeight,
      width: renderWidth,
      style: {
        display: style.display,
        height: style.height,
        width: style.width
      }
    }
  };
  style.display = style.display || "block";
  style.boxSizing = style.boxSizing || "border-box";
  if (isNullOrEmpty(renderWidth)) {
    const displayWidth = readUsedSize(canvas, "width");
    if (displayWidth !== void 0) {
      canvas.width = displayWidth;
    }
  }
  if (isNullOrEmpty(renderHeight)) {
    if (canvas.style.height === "") {
      canvas.height = canvas.width / (aspectRatio || 2);
    } else {
      const displayHeight = readUsedSize(canvas, "height");
      if (displayHeight !== void 0) {
        canvas.height = displayHeight;
      }
    }
  }
  return canvas;
}
function addListener(node, type, listener) {
  node.addEventListener(type, listener, eventListenerOptions);
}
function removeListener(chart, type, listener) {
  chart.canvas.removeEventListener(type, listener, eventListenerOptions);
}
function fromNativeEvent(event, chart) {
  const type = EVENT_TYPES[event.type] || event.type;
  const { x, y } = getRelativePosition$1(event, chart);
  return {
    type,
    chart,
    native: event,
    x: x !== void 0 ? x : null,
    y: y !== void 0 ? y : null
  };
}
function nodeListContains(nodeList, canvas) {
  for (const node of nodeList) {
    if (node === canvas || node.contains(canvas)) {
      return true;
    }
  }
}
function createAttachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.addedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  return observer;
}
function createDetachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.removedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  return observer;
}
function onWindowResize() {
  const dpr = window.devicePixelRatio;
  if (dpr === oldDevicePixelRatio) {
    return;
  }
  oldDevicePixelRatio = dpr;
  drpListeningCharts.forEach((resize, chart) => {
    if (chart.currentDevicePixelRatio !== dpr) {
      resize();
    }
  });
}
function listenDevicePixelRatioChanges(chart, resize) {
  if (!drpListeningCharts.size) {
    window.addEventListener("resize", onWindowResize);
  }
  drpListeningCharts.set(chart, resize);
}
function unlistenDevicePixelRatioChanges(chart) {
  drpListeningCharts.delete(chart);
  if (!drpListeningCharts.size) {
    window.removeEventListener("resize", onWindowResize);
  }
}
function createResizeObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const container = canvas && _getParentNode(canvas);
  if (!container) {
    return;
  }
  const resize = throttled((width, height) => {
    const w = container.clientWidth;
    listener(width, height);
    if (w < container.clientWidth) {
      listener();
    }
  }, window);
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    if (width === 0 && height === 0) {
      return;
    }
    resize(width, height);
  });
  observer.observe(container);
  listenDevicePixelRatioChanges(chart, resize);
  return observer;
}
function releaseObserver(chart, type, observer) {
  if (observer) {
    observer.disconnect();
  }
  if (type === "resize") {
    unlistenDevicePixelRatioChanges(chart);
  }
}
function createProxyAndListen(chart, type, listener) {
  const canvas = chart.canvas;
  const proxy = throttled((event) => {
    if (chart.ctx !== null) {
      listener(fromNativeEvent(event, chart));
    }
  }, chart, (args) => {
    const event = args[0];
    return [event, event.offsetX, event.offsetY];
  });
  addListener(canvas, type, proxy);
  return proxy;
}
function _detectPlatform(canvas) {
  if (!_isDomSupported() || typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return BasicPlatform;
  }
  return DomPlatform;
}
function calculateDelta(tickValue, ticks) {
  let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    delta = tickValue - Math.floor(tickValue);
  }
  return delta;
}
function autoSkip(scale, ticks) {
  const tickOpts = scale.options.ticks;
  const ticksLimit = tickOpts.maxTicksLimit || determineMaxTicks(scale);
  const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
  const numMajorIndices = majorIndices.length;
  const first = majorIndices[0];
  const last = majorIndices[numMajorIndices - 1];
  const newTicks = [];
  if (numMajorIndices > ticksLimit) {
    skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
    return newTicks;
  }
  const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
  if (numMajorIndices > 0) {
    let i, ilen;
    const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
    skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
    for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
      skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
    }
    skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
    return newTicks;
  }
  skip(ticks, newTicks, spacing);
  return newTicks;
}
function determineMaxTicks(scale) {
  const offset = scale.options.offset;
  const tickLength = scale._tickSize();
  const maxScale = scale._length / tickLength + (offset ? 0 : 1);
  const maxChart = scale._maxLength / tickLength;
  return Math.floor(Math.min(maxScale, maxChart));
}
function calculateSpacing(majorIndices, ticks, ticksLimit) {
  const evenMajorSpacing = getEvenSpacing(majorIndices);
  const spacing = ticks.length / ticksLimit;
  if (!evenMajorSpacing) {
    return Math.max(spacing, 1);
  }
  const factors = _factorize(evenMajorSpacing);
  for (let i = 0, ilen = factors.length - 1; i < ilen; i++) {
    const factor = factors[i];
    if (factor > spacing) {
      return factor;
    }
  }
  return Math.max(spacing, 1);
}
function getMajorIndices(ticks) {
  const result = [];
  let i, ilen;
  for (i = 0, ilen = ticks.length; i < ilen; i++) {
    if (ticks[i].major) {
      result.push(i);
    }
  }
  return result;
}
function skipMajors(ticks, newTicks, majorIndices, spacing) {
  let count = 0;
  let next = majorIndices[0];
  let i;
  spacing = Math.ceil(spacing);
  for (i = 0; i < ticks.length; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = majorIndices[count * spacing];
    }
  }
}
function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
  const start = valueOrDefault(majorStart, 0);
  const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
  let count = 0;
  let length, i, next;
  spacing = Math.ceil(spacing);
  if (majorEnd) {
    length = majorEnd - majorStart;
    spacing = length / Math.floor(length / spacing);
  }
  next = start;
  while (next < 0) {
    count++;
    next = Math.round(start + count * spacing);
  }
  for (i = Math.max(start, 0); i < end; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = Math.round(start + count * spacing);
    }
  }
}
function getEvenSpacing(arr) {
  const len = arr.length;
  let i, diff;
  if (len < 2) {
    return false;
  }
  for (diff = arr[0], i = 1; i < len; ++i) {
    if (arr[i] - arr[i - 1] !== diff) {
      return false;
    }
  }
  return diff;
}
function sample(arr, numItems) {
  const result = [];
  const increment = arr.length / numItems;
  const len = arr.length;
  let i = 0;
  for (; i < len; i += increment) {
    result.push(arr[Math.floor(i)]);
  }
  return result;
}
function getPixelForGridLine(scale, index, offsetGridLines) {
  const length = scale.ticks.length;
  const validIndex2 = Math.min(index, length - 1);
  const start = scale._startPixel;
  const end = scale._endPixel;
  const epsilon = 1e-6;
  let lineValue = scale.getPixelForTick(validIndex2);
  let offset;
  if (offsetGridLines) {
    if (length === 1) {
      offset = Math.max(lineValue - start, end - lineValue);
    } else if (index === 0) {
      offset = (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      offset = (lineValue - scale.getPixelForTick(validIndex2 - 1)) / 2;
    }
    lineValue += validIndex2 < index ? offset : -offset;
    if (lineValue < start - epsilon || lineValue > end + epsilon) {
      return;
    }
  }
  return lineValue;
}
function garbageCollect(caches, length) {
  each2(caches, (cache) => {
    const gc = cache.gc;
    const gcLen = gc.length / 2;
    let i;
    if (gcLen > length) {
      for (i = 0; i < gcLen; ++i) {
        delete cache.data[gc[i]];
      }
      gc.splice(0, gcLen);
    }
  });
}
function getTickMarkLength(options2) {
  return options2.drawTicks ? options2.tickLength : 0;
}
function getTitleHeight(options2, fallback) {
  if (!options2.display) {
    return 0;
  }
  const font = toFont(options2.font, fallback);
  const padding = toPadding(options2.padding);
  const lines = isArray(options2.text) ? options2.text.length : 1;
  return lines * font.lineHeight + padding.height;
}
function createScaleContext(parent, scale) {
  return createContext(parent, {
    scale,
    type: "scale"
  });
}
function createTickContext(parent, index, tick) {
  return createContext(parent, {
    tick,
    index,
    type: "tick"
  });
}
function titleAlign(align, position, reverse) {
  let ret = _toLeftRightCenter(align);
  if (reverse && position !== "right" || !reverse && position === "right") {
    ret = reverseAlign(ret);
  }
  return ret;
}
function titleArgs(scale, offset, position, align) {
  const { top, left, bottom, right, chart } = scale;
  const { chartArea, scales: scales2 } = chart;
  let rotation = 0;
  let maxWidth, titleX, titleY;
  const height = bottom - top;
  const width = right - left;
  if (scale.isHorizontal()) {
    titleX = _alignStartEnd(align, left, right);
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleY = scales2[positionAxisID].getPixelForValue(value) + height - offset;
    } else if (position === "center") {
      titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
    } else {
      titleY = offsetFromEdge(scale, position, offset);
    }
    maxWidth = right - left;
  } else {
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleX = scales2[positionAxisID].getPixelForValue(value) - width + offset;
    } else if (position === "center") {
      titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
    }
    titleY = _alignStartEnd(align, bottom, top);
    rotation = position === "left" ? -HALF_PI : HALF_PI;
  }
  return { titleX, titleY, maxWidth, rotation };
}
function registerDefaults(item, scope, parentScope) {
  const itemDefaults = merge(Object.create(null), [
    parentScope ? defaults.get(parentScope) : {},
    defaults.get(scope),
    item.defaults
  ]);
  defaults.set(scope, itemDefaults);
  if (item.defaultRoutes) {
    routeDefaults(scope, item.defaultRoutes);
  }
  if (item.descriptors) {
    defaults.describe(scope, item.descriptors);
  }
}
function routeDefaults(scope, routes) {
  Object.keys(routes).forEach((property) => {
    const propertyParts = property.split(".");
    const sourceName = propertyParts.pop();
    const sourceScope = [scope].concat(propertyParts).join(".");
    const parts = routes[property].split(".");
    const targetName = parts.pop();
    const targetScope = parts.join(".");
    defaults.route(sourceScope, sourceName, targetScope, targetName);
  });
}
function isIChartComponent(proto) {
  return "id" in proto && "defaults" in proto;
}
function allPlugins(config) {
  const plugins2 = [];
  const keys = Object.keys(registry.plugins.items);
  for (let i = 0; i < keys.length; i++) {
    plugins2.push(registry.getPlugin(keys[i]));
  }
  const local = config.plugins || [];
  for (let i = 0; i < local.length; i++) {
    const plugin = local[i];
    if (plugins2.indexOf(plugin) === -1) {
      plugins2.push(plugin);
    }
  }
  return plugins2;
}
function getOpts(options2, all) {
  if (!all && options2 === false) {
    return null;
  }
  if (options2 === true) {
    return {};
  }
  return options2;
}
function createDescriptors(chart, plugins2, options2, all) {
  const result = [];
  const context = chart.getContext();
  for (let i = 0; i < plugins2.length; i++) {
    const plugin = plugins2[i];
    const id = plugin.id;
    const opts = getOpts(options2[id], all);
    if (opts === null) {
      continue;
    }
    result.push({
      plugin,
      options: pluginOpts(chart.config, plugin, opts, context)
    });
  }
  return result;
}
function pluginOpts(config, plugin, opts, context) {
  const keys = config.pluginScopeKeys(plugin);
  const scopes = config.getOptionScopes(opts, keys);
  return config.createResolver(scopes, context, [""], { scriptable: false, indexable: false, allKeys: true });
}
function getIndexAxis(type, options2) {
  const datasetDefaults = defaults.datasets[type] || {};
  const datasetOptions = (options2.datasets || {})[type] || {};
  return datasetOptions.indexAxis || options2.indexAxis || datasetDefaults.indexAxis || "x";
}
function getAxisFromDefaultScaleID(id, indexAxis) {
  let axis = id;
  if (id === "_index_") {
    axis = indexAxis;
  } else if (id === "_value_") {
    axis = indexAxis === "x" ? "y" : "x";
  }
  return axis;
}
function getDefaultScaleIDFromAxis(axis, indexAxis) {
  return axis === indexAxis ? "_index_" : "_value_";
}
function axisFromPosition(position) {
  if (position === "top" || position === "bottom") {
    return "x";
  }
  if (position === "left" || position === "right") {
    return "y";
  }
}
function determineAxis(id, scaleOptions) {
  if (id === "x" || id === "y") {
    return id;
  }
  return scaleOptions.axis || axisFromPosition(scaleOptions.position) || id.charAt(0).toLowerCase();
}
function mergeScaleConfig(config, options2) {
  const chartDefaults = overrides[config.type] || { scales: {} };
  const configScales = options2.scales || {};
  const chartIndexAxis = getIndexAxis(config.type, options2);
  const firstIDs = Object.create(null);
  const scales2 = Object.create(null);
  Object.keys(configScales).forEach((id) => {
    const scaleConf = configScales[id];
    if (!isObject(scaleConf)) {
      return console.error(`Invalid scale configuration for scale: ${id}`);
    }
    if (scaleConf._proxy) {
      return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
    }
    const axis = determineAxis(id, scaleConf);
    const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
    const defaultScaleOptions = chartDefaults.scales || {};
    firstIDs[axis] = firstIDs[axis] || id;
    scales2[id] = mergeIf(Object.create(null), [{ axis }, scaleConf, defaultScaleOptions[axis], defaultScaleOptions[defaultId]]);
  });
  config.data.datasets.forEach((dataset) => {
    const type = dataset.type || config.type;
    const indexAxis = dataset.indexAxis || getIndexAxis(type, options2);
    const datasetDefaults = overrides[type] || {};
    const defaultScaleOptions = datasetDefaults.scales || {};
    Object.keys(defaultScaleOptions).forEach((defaultID) => {
      const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
      const id = dataset[axis + "AxisID"] || firstIDs[axis] || axis;
      scales2[id] = scales2[id] || Object.create(null);
      mergeIf(scales2[id], [{ axis }, configScales[id], defaultScaleOptions[defaultID]]);
    });
  });
  Object.keys(scales2).forEach((key) => {
    const scale = scales2[key];
    mergeIf(scale, [defaults.scales[scale.type], defaults.scale]);
  });
  return scales2;
}
function initOptions(config) {
  const options2 = config.options || (config.options = {});
  options2.plugins = valueOrDefault(options2.plugins, {});
  options2.scales = mergeScaleConfig(config, options2);
}
function initData(data) {
  data = data || {};
  data.datasets = data.datasets || [];
  data.labels = data.labels || [];
  return data;
}
function initConfig(config) {
  config = config || {};
  config.data = initData(config.data);
  initOptions(config);
  return config;
}
function cachedKeys(cacheKey, generate) {
  let keys = keyCache.get(cacheKey);
  if (!keys) {
    keys = generate();
    keyCache.set(cacheKey, keys);
    keysCached.add(keys);
  }
  return keys;
}
function getResolver(resolverCache, scopes, prefixes) {
  let cache = resolverCache.get(scopes);
  if (!cache) {
    cache = new Map();
    resolverCache.set(scopes, cache);
  }
  const cacheKey = prefixes.join();
  let cached = cache.get(cacheKey);
  if (!cached) {
    const resolver = _createResolver(scopes, prefixes);
    cached = {
      resolver,
      subPrefixes: prefixes.filter((p) => !p.toLowerCase().includes("hover"))
    };
    cache.set(cacheKey, cached);
  }
  return cached;
}
function needContext(proxy, names2) {
  const { isScriptable, isIndexable } = _descriptors(proxy);
  for (const prop of names2) {
    const scriptable = isScriptable(prop);
    const indexable = isIndexable(prop);
    const value = (indexable || scriptable) && proxy[prop];
    if (scriptable && (isFunction(value) || hasFunction(value)) || indexable && isArray(value)) {
      return true;
    }
  }
  return false;
}
function positionIsHorizontal(position, axis) {
  return position === "top" || position === "bottom" || KNOWN_POSITIONS.indexOf(position) === -1 && axis === "x";
}
function compare2Level(l1, l2) {
  return function(a, b) {
    return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1];
  };
}
function onAnimationsComplete(context) {
  const chart = context.chart;
  const animationOptions2 = chart.options.animation;
  chart.notifyPlugins("afterRender");
  callback(animationOptions2 && animationOptions2.onComplete, [context], chart);
}
function onAnimationProgress(context) {
  const chart = context.chart;
  const animationOptions2 = chart.options.animation;
  callback(animationOptions2 && animationOptions2.onProgress, [context], chart);
}
function getCanvas(item) {
  if (_isDomSupported() && typeof item === "string") {
    item = document.getElementById(item);
  } else if (item && item.length) {
    item = item[0];
  }
  if (item && item.canvas) {
    item = item.canvas;
  }
  return item;
}
function moveNumericKeys(obj, start, move) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const intKey = +key;
    if (intKey >= start) {
      const value = obj[key];
      delete obj[key];
      if (move > 0 || intKey > start) {
        obj[intKey + move] = value;
      }
    }
  }
}
function clipArc(ctx, element, endAngle) {
  const { startAngle, pixelMargin, x, y, outerRadius, innerRadius } = element;
  let angleMargin = pixelMargin / outerRadius;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
  if (innerRadius > pixelMargin) {
    angleMargin = pixelMargin / innerRadius;
    ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
  } else {
    ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
  }
  ctx.closePath();
  ctx.clip();
}
function toRadiusCorners(value) {
  return _readValueToProps(value, ["outerStart", "outerEnd", "innerStart", "innerEnd"]);
}
function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
  const o = toRadiusCorners(arc.options.borderRadius);
  const halfThickness = (outerRadius - innerRadius) / 2;
  const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
  const computeOuterLimit = (val) => {
    const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
    return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit));
  };
  return {
    outerStart: computeOuterLimit(o.outerStart),
    outerEnd: computeOuterLimit(o.outerEnd),
    innerStart: _limitValue(o.innerStart, 0, innerLimit),
    innerEnd: _limitValue(o.innerEnd, 0, innerLimit)
  };
}
function rThetaToXY(r, theta, x, y) {
  return {
    x: x + r * Math.cos(theta),
    y: y + r * Math.sin(theta)
  };
}
function pathArc(ctx, element, offset, spacing, end) {
  const { x, y, startAngle: start, pixelMargin, innerRadius: innerR } = element;
  const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
  const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
  let spacingOffset = 0;
  const alpha = end - start;
  if (spacing) {
    const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
    const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
    const avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
    const adjustedAngle = avNogSpacingRadius !== 0 ? alpha * avNogSpacingRadius / (avNogSpacingRadius + spacing) : alpha;
    spacingOffset = (alpha - adjustedAngle) / 2;
  }
  const beta = Math.max(1e-3, alpha * outerRadius - offset / PI) / outerRadius;
  const angleOffset = (alpha - beta) / 2;
  const startAngle = start + angleOffset + spacingOffset;
  const endAngle = end - angleOffset - spacingOffset;
  const { outerStart, outerEnd, innerStart, innerEnd } = parseBorderRadius$1(element, innerRadius, outerRadius, endAngle - startAngle);
  const outerStartAdjustedRadius = outerRadius - outerStart;
  const outerEndAdjustedRadius = outerRadius - outerEnd;
  const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
  const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;
  const innerStartAdjustedRadius = innerRadius + innerStart;
  const innerEndAdjustedRadius = innerRadius + innerEnd;
  const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
  const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerEndAdjustedAngle);
  if (outerEnd > 0) {
    const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + HALF_PI);
  }
  const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y);
  ctx.lineTo(p4.x, p4.y);
  if (innerEnd > 0) {
    const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
  }
  ctx.arc(x, y, innerRadius, endAngle - innerEnd / innerRadius, startAngle + innerStart / innerRadius, true);
  if (innerStart > 0) {
    const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - HALF_PI);
  }
  const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y);
  ctx.lineTo(p8.x, p8.y);
  if (outerStart > 0) {
    const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - HALF_PI, outerStartAdjustedAngle);
  }
  ctx.closePath();
}
function drawArc(ctx, element, offset, spacing) {
  const { fullCircles, startAngle, circumference } = element;
  let endAngle = element.endAngle;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, startAngle + TAU);
    for (let i = 0; i < fullCircles; ++i) {
      ctx.fill();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + circumference % TAU;
      if (circumference % TAU === 0) {
        endAngle += TAU;
      }
    }
  }
  pathArc(ctx, element, offset, spacing, endAngle);
  ctx.fill();
  return endAngle;
}
function drawFullCircleBorders(ctx, element, inner) {
  const { x, y, startAngle, pixelMargin, fullCircles } = element;
  const outerRadius = Math.max(element.outerRadius - pixelMargin, 0);
  const innerRadius = element.innerRadius + pixelMargin;
  let i;
  if (inner) {
    clipArc(ctx, element, startAngle + TAU);
  }
  ctx.beginPath();
  ctx.arc(x, y, innerRadius, startAngle + TAU, startAngle, true);
  for (i = 0; i < fullCircles; ++i) {
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle, startAngle + TAU);
  for (i = 0; i < fullCircles; ++i) {
    ctx.stroke();
  }
}
function drawBorder(ctx, element, offset, spacing, endAngle) {
  const { options: options2 } = element;
  const inner = options2.borderAlign === "inner";
  if (!options2.borderWidth) {
    return;
  }
  if (inner) {
    ctx.lineWidth = options2.borderWidth * 2;
    ctx.lineJoin = "round";
  } else {
    ctx.lineWidth = options2.borderWidth;
    ctx.lineJoin = "bevel";
  }
  if (element.fullCircles) {
    drawFullCircleBorders(ctx, element, inner);
  }
  if (inner) {
    clipArc(ctx, element, endAngle);
  }
  pathArc(ctx, element, offset, spacing, endAngle);
  ctx.stroke();
}
function setStyle(ctx, options2, style = options2) {
  ctx.lineCap = valueOrDefault(style.borderCapStyle, options2.borderCapStyle);
  ctx.setLineDash(valueOrDefault(style.borderDash, options2.borderDash));
  ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options2.borderDashOffset);
  ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options2.borderJoinStyle);
  ctx.lineWidth = valueOrDefault(style.borderWidth, options2.borderWidth);
  ctx.strokeStyle = valueOrDefault(style.borderColor, options2.borderColor);
}
function lineTo(ctx, previous, target) {
  ctx.lineTo(target.x, target.y);
}
function getLineMethod(options2) {
  if (options2.stepped) {
    return _steppedLineTo;
  }
  if (options2.tension || options2.cubicInterpolationMode === "monotone") {
    return _bezierCurveTo;
  }
  return lineTo;
}
function pathVars(points, segment, params = {}) {
  const count = points.length;
  const { start: paramsStart = 0, end: paramsEnd = count - 1 } = params;
  const { start: segmentStart, end: segmentEnd } = segment;
  const start = Math.max(paramsStart, segmentStart);
  const end = Math.min(paramsEnd, segmentEnd);
  const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
  return {
    count,
    start,
    loop: segment.loop,
    ilen: end < start && !outside ? count + end - start : end - start
  };
}
function pathSegment(ctx, line, segment, params) {
  const { points, options: options2 } = line;
  const { count, start, loop, ilen } = pathVars(points, segment, params);
  const lineMethod = getLineMethod(options2);
  let { move = true, reverse } = params || {};
  let i, point, prev;
  for (i = 0; i <= ilen; ++i) {
    point = points[(start + (reverse ? ilen - i : i)) % count];
    if (point.skip) {
      continue;
    } else if (move) {
      ctx.moveTo(point.x, point.y);
      move = false;
    } else {
      lineMethod(ctx, prev, point, reverse, options2.stepped);
    }
    prev = point;
  }
  if (loop) {
    point = points[(start + (reverse ? ilen : 0)) % count];
    lineMethod(ctx, prev, point, reverse, options2.stepped);
  }
  return !!loop;
}
function fastPathSegment(ctx, line, segment, params) {
  const points = line.points;
  const { count, start, ilen } = pathVars(points, segment, params);
  const { move = true, reverse } = params || {};
  let avgX = 0;
  let countX = 0;
  let i, point, prevX, minY, maxY, lastY;
  const pointIndex = (index) => (start + (reverse ? ilen - index : index)) % count;
  const drawX = () => {
    if (minY !== maxY) {
      ctx.lineTo(avgX, maxY);
      ctx.lineTo(avgX, minY);
      ctx.lineTo(avgX, lastY);
    }
  };
  if (move) {
    point = points[pointIndex(0)];
    ctx.moveTo(point.x, point.y);
  }
  for (i = 0; i <= ilen; ++i) {
    point = points[pointIndex(i)];
    if (point.skip) {
      continue;
    }
    const x = point.x;
    const y = point.y;
    const truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
      } else if (y > maxY) {
        maxY = y;
      }
      avgX = (countX * avgX + x) / ++countX;
    } else {
      drawX();
      ctx.lineTo(x, y);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
    }
    lastY = y;
  }
  drawX();
}
function _getSegmentMethod(line) {
  const opts = line.options;
  const borderDash = opts.borderDash && opts.borderDash.length;
  const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== "monotone" && !opts.stepped && !borderDash;
  return useFastPath ? fastPathSegment : pathSegment;
}
function _getInterpolationMethod(options2) {
  if (options2.stepped) {
    return _steppedInterpolation;
  }
  if (options2.tension || options2.cubicInterpolationMode === "monotone") {
    return _bezierInterpolation;
  }
  return _pointInLine;
}
function strokePathWithCache(ctx, line, start, count) {
  let path = line._path;
  if (!path) {
    path = line._path = new Path2D();
    if (line.path(path, start, count)) {
      path.closePath();
    }
  }
  setStyle(ctx, line.options);
  ctx.stroke(path);
}
function strokePathDirect(ctx, line, start, count) {
  const { segments, options: options2 } = line;
  const segmentMethod = _getSegmentMethod(line);
  for (const segment of segments) {
    setStyle(ctx, options2, segment.style);
    ctx.beginPath();
    if (segmentMethod(ctx, line, segment, { start, end: start + count - 1 })) {
      ctx.closePath();
    }
    ctx.stroke();
  }
}
function draw(ctx, line, start, count) {
  if (usePath2D && !line.options.segment) {
    strokePathWithCache(ctx, line, start, count);
  } else {
    strokePathDirect(ctx, line, start, count);
  }
}
function inRange$1(el, pos, axis, useFinalPosition) {
  const options2 = el.options;
  const { [axis]: value } = el.getProps([axis], useFinalPosition);
  return Math.abs(pos - value) < options2.radius + options2.hitRadius;
}
function getBarBounds(bar, useFinalPosition) {
  const { x, y, base: base2, width, height } = bar.getProps(["x", "y", "base", "width", "height"], useFinalPosition);
  let left, right, top, bottom, half;
  if (bar.horizontal) {
    half = height / 2;
    left = Math.min(x, base2);
    right = Math.max(x, base2);
    top = y - half;
    bottom = y + half;
  } else {
    half = width / 2;
    left = x - half;
    right = x + half;
    top = Math.min(y, base2);
    bottom = Math.max(y, base2);
  }
  return { left, top, right, bottom };
}
function skipOrLimit(skip2, value, min, max) {
  return skip2 ? 0 : _limitValue(value, min, max);
}
function parseBorderWidth(bar, maxW, maxH) {
  const value = bar.options.borderWidth;
  const skip2 = bar.borderSkipped;
  const o = toTRBL(value);
  return {
    t: skipOrLimit(skip2.top, o.top, 0, maxH),
    r: skipOrLimit(skip2.right, o.right, 0, maxW),
    b: skipOrLimit(skip2.bottom, o.bottom, 0, maxH),
    l: skipOrLimit(skip2.left, o.left, 0, maxW)
  };
}
function parseBorderRadius(bar, maxW, maxH) {
  const { enableBorderRadius } = bar.getProps(["enableBorderRadius"]);
  const value = bar.options.borderRadius;
  const o = toTRBLCorners(value);
  const maxR = Math.min(maxW, maxH);
  const skip2 = bar.borderSkipped;
  const enableBorder = enableBorderRadius || isObject(value);
  return {
    topLeft: skipOrLimit(!enableBorder || skip2.top || skip2.left, o.topLeft, 0, maxR),
    topRight: skipOrLimit(!enableBorder || skip2.top || skip2.right, o.topRight, 0, maxR),
    bottomLeft: skipOrLimit(!enableBorder || skip2.bottom || skip2.left, o.bottomLeft, 0, maxR),
    bottomRight: skipOrLimit(!enableBorder || skip2.bottom || skip2.right, o.bottomRight, 0, maxR)
  };
}
function boundingRects(bar) {
  const bounds = getBarBounds(bar);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(bar, width / 2, height / 2);
  const radius = parseBorderRadius(bar, width / 2, height / 2);
  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b,
      radius: {
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r))
      }
    }
  };
}
function inRange(bar, x, y, useFinalPosition) {
  const skipX = x === null;
  const skipY = y === null;
  const skipBoth = skipX && skipY;
  const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
  return bounds && (skipX || _isBetween(x, bounds.left, bounds.right)) && (skipY || _isBetween(y, bounds.top, bounds.bottom));
}
function hasRadius(radius) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}
function addNormalRectPath(ctx, rect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
}
function inflateRect(rect, amount, refRect = {}) {
  const x = rect.x !== refRect.x ? -amount : 0;
  const y = rect.y !== refRect.y ? -amount : 0;
  const w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x;
  const h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y;
  return {
    x: rect.x + x,
    y: rect.y + y,
    w: rect.w + w,
    h: rect.h + h,
    radius: rect.radius
  };
}
function lttbDecimation(data, start, count, availableWidth, options2) {
  const samples = options2.samples || availableWidth;
  if (samples >= count) {
    return data.slice(start, start + count);
  }
  const decimated = [];
  const bucketWidth = (count - 2) / (samples - 2);
  let sampledIndex = 0;
  const endIndex = start + count - 1;
  let a = start;
  let i, maxAreaPoint, maxArea, area, nextA;
  decimated[sampledIndex++] = data[a];
  for (i = 0; i < samples - 2; i++) {
    let avgX = 0;
    let avgY = 0;
    let j;
    const avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start;
    const avgRangeLength = avgRangeEnd - avgRangeStart;
    for (j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;
    const rangeOffs = Math.floor(i * bucketWidth) + 1 + start;
    const rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start;
    const { x: pointAx, y: pointAy } = data[a];
    maxArea = area = -1;
    for (j = rangeOffs; j < rangeTo; j++) {
      area = 0.5 * Math.abs((pointAx - avgX) * (data[j].y - pointAy) - (pointAx - data[j].x) * (avgY - pointAy));
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
        nextA = j;
      }
    }
    decimated[sampledIndex++] = maxAreaPoint;
    a = nextA;
  }
  decimated[sampledIndex++] = data[endIndex];
  return decimated;
}
function minMaxDecimation(data, start, count, availableWidth) {
  let avgX = 0;
  let countX = 0;
  let i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY;
  const decimated = [];
  const endIndex = start + count - 1;
  const xMin = data[start].x;
  const xMax = data[endIndex].x;
  const dx = xMax - xMin;
  for (i = start; i < start + count; ++i) {
    point = data[i];
    x = (point.x - xMin) / dx * availableWidth;
    y = point.y;
    const truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
        minIndex = i;
      } else if (y > maxY) {
        maxY = y;
        maxIndex = i;
      }
      avgX = (countX * avgX + point.x) / ++countX;
    } else {
      const lastIndex = i - 1;
      if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
        const intermediateIndex1 = Math.min(minIndex, maxIndex);
        const intermediateIndex2 = Math.max(minIndex, maxIndex);
        if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex1],
            x: avgX
          });
        }
        if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex2],
            x: avgX
          });
        }
      }
      if (i > 0 && lastIndex !== startIndex) {
        decimated.push(data[lastIndex]);
      }
      decimated.push(point);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
      minIndex = maxIndex = startIndex = i;
    }
  }
  return decimated;
}
function cleanDecimatedDataset(dataset) {
  if (dataset._decimated) {
    const data = dataset._data;
    delete dataset._decimated;
    delete dataset._data;
    Object.defineProperty(dataset, "data", { value: data });
  }
}
function cleanDecimatedData(chart) {
  chart.data.datasets.forEach((dataset) => {
    cleanDecimatedDataset(dataset);
  });
}
function getStartAndCountOfVisiblePointsSimplified(meta, points) {
  const pointCount = points.length;
  let start = 0;
  let count;
  const { iScale } = meta;
  const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
  if (minDefined) {
    start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1);
  }
  if (maxDefined) {
    count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start;
  } else {
    count = pointCount - start;
  }
  return { start, count };
}
function getLineByIndex(chart, index) {
  const meta = chart.getDatasetMeta(index);
  const visible = meta && chart.isDatasetVisible(index);
  return visible ? meta.dataset : null;
}
function parseFillOption(line) {
  const options2 = line.options;
  const fillOption = options2.fill;
  let fill = valueOrDefault(fillOption && fillOption.target, fillOption);
  if (fill === void 0) {
    fill = !!options2.backgroundColor;
  }
  if (fill === false || fill === null) {
    return false;
  }
  if (fill === true) {
    return "origin";
  }
  return fill;
}
function decodeFill(line, index, count) {
  const fill = parseFillOption(line);
  if (isObject(fill)) {
    return isNaN(fill.value) ? false : fill;
  }
  let target = parseFloat(fill);
  if (isNumberFinite(target) && Math.floor(target) === target) {
    if (fill[0] === "-" || fill[0] === "+") {
      target = index + target;
    }
    if (target === index || target < 0 || target >= count) {
      return false;
    }
    return target;
  }
  return ["origin", "start", "end", "stack", "shape"].indexOf(fill) >= 0 && fill;
}
function computeLinearBoundary(source) {
  const { scale = {}, fill } = source;
  let target = null;
  let horizontal;
  if (fill === "start") {
    target = scale.bottom;
  } else if (fill === "end") {
    target = scale.top;
  } else if (isObject(fill)) {
    target = scale.getPixelForValue(fill.value);
  } else if (scale.getBasePixel) {
    target = scale.getBasePixel();
  }
  if (isNumberFinite(target)) {
    horizontal = scale.isHorizontal();
    return {
      x: horizontal ? target : null,
      y: horizontal ? null : target
    };
  }
  return null;
}
function computeCircularBoundary(source) {
  const { scale, fill } = source;
  const options2 = scale.options;
  const length = scale.getLabels().length;
  const target = [];
  const start = options2.reverse ? scale.max : scale.min;
  const end = options2.reverse ? scale.min : scale.max;
  let i, center, value;
  if (fill === "start") {
    value = start;
  } else if (fill === "end") {
    value = end;
  } else if (isObject(fill)) {
    value = fill.value;
  } else {
    value = scale.getBaseValue();
  }
  if (options2.grid.circular) {
    center = scale.getPointPositionForValue(0, start);
    return new simpleArc({
      x: center.x,
      y: center.y,
      radius: scale.getDistanceFromCenterForValue(value)
    });
  }
  for (i = 0; i < length; ++i) {
    target.push(scale.getPointPositionForValue(i, value));
  }
  return target;
}
function computeBoundary(source) {
  const scale = source.scale || {};
  if (scale.getPointPositionForValue) {
    return computeCircularBoundary(source);
  }
  return computeLinearBoundary(source);
}
function findSegmentEnd(start, end, points) {
  for (; end > start; end--) {
    const point = points[end];
    if (!isNaN(point.x) && !isNaN(point.y)) {
      break;
    }
  }
  return end;
}
function pointsFromSegments(boundary, line) {
  const { x = null, y = null } = boundary || {};
  const linePoints = line.points;
  const points = [];
  line.segments.forEach(({ start, end }) => {
    end = findSegmentEnd(start, end, linePoints);
    const first = linePoints[start];
    const last = linePoints[end];
    if (y !== null) {
      points.push({ x: first.x, y });
      points.push({ x: last.x, y });
    } else if (x !== null) {
      points.push({ x, y: first.y });
      points.push({ x, y: last.y });
    }
  });
  return points;
}
function buildStackLine(source) {
  const { scale, index, line } = source;
  const points = [];
  const segments = line.segments;
  const sourcePoints = line.points;
  const linesBelow = getLinesBelow(scale, index);
  linesBelow.push(createBoundaryLine({ x: null, y: scale.bottom }, line));
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    for (let j = segment.start; j <= segment.end; j++) {
      addPointsBelow(points, sourcePoints[j], linesBelow);
    }
  }
  return new LineElement({ points, options: {} });
}
function getLinesBelow(scale, index) {
  const below = [];
  const metas = scale.getMatchingVisibleMetas("line");
  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    if (meta.index === index) {
      break;
    }
    if (!meta.hidden) {
      below.unshift(meta.dataset);
    }
  }
  return below;
}
function addPointsBelow(points, sourcePoint, linesBelow) {
  const postponed = [];
  for (let j = 0; j < linesBelow.length; j++) {
    const line = linesBelow[j];
    const { first, last, point } = findPoint(line, sourcePoint, "x");
    if (!point || first && last) {
      continue;
    }
    if (first) {
      postponed.unshift(point);
    } else {
      points.push(point);
      if (!last) {
        break;
      }
    }
  }
  points.push(...postponed);
}
function findPoint(line, sourcePoint, property) {
  const point = line.interpolate(sourcePoint, property);
  if (!point) {
    return {};
  }
  const pointValue = point[property];
  const segments = line.segments;
  const linePoints = line.points;
  let first = false;
  let last = false;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const firstValue = linePoints[segment.start][property];
    const lastValue = linePoints[segment.end][property];
    if (_isBetween(pointValue, firstValue, lastValue)) {
      first = pointValue === firstValue;
      last = pointValue === lastValue;
      break;
    }
  }
  return { first, last, point };
}
function getTarget(source) {
  const { chart, fill, line } = source;
  if (isNumberFinite(fill)) {
    return getLineByIndex(chart, fill);
  }
  if (fill === "stack") {
    return buildStackLine(source);
  }
  if (fill === "shape") {
    return true;
  }
  const boundary = computeBoundary(source);
  if (boundary instanceof simpleArc) {
    return boundary;
  }
  return createBoundaryLine(boundary, line);
}
function createBoundaryLine(boundary, line) {
  let points = [];
  let _loop = false;
  if (isArray(boundary)) {
    _loop = true;
    points = boundary;
  } else {
    points = pointsFromSegments(boundary, line);
  }
  return points.length ? new LineElement({
    points,
    options: { tension: 0 },
    _loop,
    _fullLoop: _loop
  }) : null;
}
function resolveTarget(sources, index, propagate) {
  const source = sources[index];
  let fill = source.fill;
  const visited = [index];
  let target;
  if (!propagate) {
    return fill;
  }
  while (fill !== false && visited.indexOf(fill) === -1) {
    if (!isNumberFinite(fill)) {
      return fill;
    }
    target = sources[fill];
    if (!target) {
      return false;
    }
    if (target.visible) {
      return fill;
    }
    visited.push(fill);
    fill = target.fill;
  }
  return false;
}
function _clip(ctx, target, clipY) {
  ctx.beginPath();
  target.path(ctx);
  ctx.lineTo(target.last().x, clipY);
  ctx.lineTo(target.first().x, clipY);
  ctx.closePath();
  ctx.clip();
}
function getBounds(property, first, last, loop) {
  if (loop) {
    return;
  }
  let start = first[property];
  let end = last[property];
  if (property === "angle") {
    start = _normalizeAngle(start);
    end = _normalizeAngle(end);
  }
  return { property, start, end };
}
function _getEdge(a, b, prop, fn) {
  if (a && b) {
    return fn(a[prop], b[prop]);
  }
  return a ? a[prop] : b ? b[prop] : 0;
}
function _segments(line, target, property) {
  const segments = line.segments;
  const points = line.points;
  const tpoints = target.points;
  const parts = [];
  for (const segment of segments) {
    let { start, end } = segment;
    end = findSegmentEnd(start, end, points);
    const bounds = getBounds(property, points[start], points[end], segment.loop);
    if (!target.segments) {
      parts.push({
        source: segment,
        target: bounds,
        start: points[start],
        end: points[end]
      });
      continue;
    }
    const targetSegments = _boundSegments(target, bounds);
    for (const tgt of targetSegments) {
      const subBounds = getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
      const fillSources = _boundSegment(segment, points, subBounds);
      for (const fillSource of fillSources) {
        parts.push({
          source: fillSource,
          target: tgt,
          start: {
            [property]: _getEdge(bounds, subBounds, "start", Math.max)
          },
          end: {
            [property]: _getEdge(bounds, subBounds, "end", Math.min)
          }
        });
      }
    }
  }
  return parts;
}
function clipBounds(ctx, scale, bounds) {
  const { top, bottom } = scale.chart.chartArea;
  const { property, start, end } = bounds || {};
  if (property === "x") {
    ctx.beginPath();
    ctx.rect(start, top, end - start, bottom - top);
    ctx.clip();
  }
}
function interpolatedLineTo(ctx, target, point, property) {
  const interpolatedPoint = target.interpolate(point, property);
  if (interpolatedPoint) {
    ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
  }
}
function _fill(ctx, cfg) {
  const { line, target, property, color: color2, scale } = cfg;
  const segments = _segments(line, target, property);
  for (const { source: src2, target: tgt, start, end } of segments) {
    const { style: { backgroundColor = color2 } = {} } = src2;
    const notShape = target !== true;
    ctx.save();
    ctx.fillStyle = backgroundColor;
    clipBounds(ctx, scale, notShape && getBounds(property, start, end));
    ctx.beginPath();
    const lineLoop = !!line.pathSegment(ctx, src2);
    let loop;
    if (notShape) {
      if (lineLoop) {
        ctx.closePath();
      } else {
        interpolatedLineTo(ctx, target, end, property);
      }
      const targetLoop = !!target.pathSegment(ctx, tgt, { move: lineLoop, reverse: true });
      loop = lineLoop && targetLoop;
      if (!loop) {
        interpolatedLineTo(ctx, target, start, property);
      }
    }
    ctx.closePath();
    ctx.fill(loop ? "evenodd" : "nonzero");
    ctx.restore();
  }
}
function doFill(ctx, cfg) {
  const { line, target, above, below, area, scale } = cfg;
  const property = line._loop ? "angle" : cfg.axis;
  ctx.save();
  if (property === "x" && below !== above) {
    _clip(ctx, target, area.top);
    _fill(ctx, { line, target, color: above, scale, property });
    ctx.restore();
    ctx.save();
    _clip(ctx, target, area.bottom);
  }
  _fill(ctx, { line, target, color: below, scale, property });
  ctx.restore();
}
function drawfill(ctx, source, area) {
  const target = getTarget(source);
  const { line, scale, axis } = source;
  const lineOpts = line.options;
  const fillOption = lineOpts.fill;
  const color2 = lineOpts.backgroundColor;
  const { above = color2, below = color2 } = fillOption || {};
  if (target && line.points.length) {
    clipArea(ctx, area);
    doFill(ctx, { line, target, above, below, area, scale, axis });
    unclipArea(ctx);
  }
}
function isListened(type, opts) {
  if (type === "mousemove" && (opts.onHover || opts.onLeave)) {
    return true;
  }
  if (opts.onClick && (type === "click" || type === "mouseup")) {
    return true;
  }
  return false;
}
function createTitle(chart, titleOpts) {
  const title = new Title({
    ctx: chart.ctx,
    options: titleOpts,
    chart
  });
  layouts.configure(chart, title, titleOpts);
  layouts.addBox(chart, title);
  chart.titleBlock = title;
}
function pushOrConcat(base2, toPush) {
  if (toPush) {
    if (isArray(toPush)) {
      Array.prototype.push.apply(base2, toPush);
    } else {
      base2.push(toPush);
    }
  }
  return base2;
}
function splitNewlines(str) {
  if ((typeof str === "string" || str instanceof String) && str.indexOf("\n") > -1) {
    return str.split("\n");
  }
  return str;
}
function createTooltipItem(chart, item) {
  const { element, datasetIndex, index } = item;
  const controller = chart.getDatasetMeta(datasetIndex).controller;
  const { label, value } = controller.getLabelAndValue(index);
  return {
    chart,
    label,
    parsed: controller.getParsed(index),
    raw: chart.data.datasets[datasetIndex].data[index],
    formattedValue: value,
    dataset: controller.getDataset(),
    dataIndex: index,
    datasetIndex,
    element
  };
}
function getTooltipSize(tooltip, options2) {
  const ctx = tooltip._chart.ctx;
  const { body: body4, footer, title } = tooltip;
  const { boxWidth, boxHeight } = options2;
  const bodyFont = toFont(options2.bodyFont);
  const titleFont = toFont(options2.titleFont);
  const footerFont = toFont(options2.footerFont);
  const titleLineCount = title.length;
  const footerLineCount = footer.length;
  const bodyLineItemCount = body4.length;
  const padding = toPadding(options2.padding);
  let height = padding.height;
  let width = 0;
  let combinedBodyLength = body4.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
  combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
  if (titleLineCount) {
    height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options2.titleSpacing + options2.titleMarginBottom;
  }
  if (combinedBodyLength) {
    const bodyLineHeight = options2.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
    height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options2.bodySpacing;
  }
  if (footerLineCount) {
    height += options2.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options2.footerSpacing;
  }
  let widthPadding = 0;
  const maxLineWidth = function(line) {
    width = Math.max(width, ctx.measureText(line).width + widthPadding);
  };
  ctx.save();
  ctx.font = titleFont.string;
  each2(tooltip.title, maxLineWidth);
  ctx.font = bodyFont.string;
  each2(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
  widthPadding = options2.displayColors ? boxWidth + 2 + options2.boxPadding : 0;
  each2(body4, (bodyItem) => {
    each2(bodyItem.before, maxLineWidth);
    each2(bodyItem.lines, maxLineWidth);
    each2(bodyItem.after, maxLineWidth);
  });
  widthPadding = 0;
  ctx.font = footerFont.string;
  each2(tooltip.footer, maxLineWidth);
  ctx.restore();
  width += padding.width;
  return { width, height };
}
function determineYAlign(chart, size) {
  const { y, height } = size;
  if (y < height / 2) {
    return "top";
  } else if (y > chart.height - height / 2) {
    return "bottom";
  }
  return "center";
}
function doesNotFitWithAlign(xAlign, chart, options2, size) {
  const { x, width } = size;
  const caret = options2.caretSize + options2.caretPadding;
  if (xAlign === "left" && x + width + caret > chart.width) {
    return true;
  }
  if (xAlign === "right" && x - width - caret < 0) {
    return true;
  }
}
function determineXAlign(chart, options2, size, yAlign) {
  const { x, width } = size;
  const { width: chartWidth, chartArea: { left, right } } = chart;
  let xAlign = "center";
  if (yAlign === "center") {
    xAlign = x <= (left + right) / 2 ? "left" : "right";
  } else if (x <= width / 2) {
    xAlign = "left";
  } else if (x >= chartWidth - width / 2) {
    xAlign = "right";
  }
  if (doesNotFitWithAlign(xAlign, chart, options2, size)) {
    xAlign = "center";
  }
  return xAlign;
}
function determineAlignment(chart, options2, size) {
  const yAlign = options2.yAlign || determineYAlign(chart, size);
  return {
    xAlign: options2.xAlign || determineXAlign(chart, options2, size, yAlign),
    yAlign
  };
}
function alignX(size, xAlign) {
  let { x, width } = size;
  if (xAlign === "right") {
    x -= width;
  } else if (xAlign === "center") {
    x -= width / 2;
  }
  return x;
}
function alignY(size, yAlign, paddingAndSize) {
  let { y, height } = size;
  if (yAlign === "top") {
    y += paddingAndSize;
  } else if (yAlign === "bottom") {
    y -= height + paddingAndSize;
  } else {
    y -= height / 2;
  }
  return y;
}
function getBackgroundPoint(options2, size, alignment, chart) {
  const { caretSize, caretPadding, cornerRadius } = options2;
  const { xAlign, yAlign } = alignment;
  const paddingAndSize = caretSize + caretPadding;
  const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
  let x = alignX(size, xAlign);
  const y = alignY(size, yAlign, paddingAndSize);
  if (yAlign === "center") {
    if (xAlign === "left") {
      x += paddingAndSize;
    } else if (xAlign === "right") {
      x -= paddingAndSize;
    }
  } else if (xAlign === "left") {
    x -= Math.max(topLeft, bottomLeft) + caretSize;
  } else if (xAlign === "right") {
    x += Math.max(topRight, bottomRight) + caretSize;
  }
  return {
    x: _limitValue(x, 0, chart.width - size.width),
    y: _limitValue(y, 0, chart.height - size.height)
  };
}
function getAlignedX(tooltip, align, options2) {
  const padding = toPadding(options2.padding);
  return align === "center" ? tooltip.x + tooltip.width / 2 : align === "right" ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
}
function getBeforeAfterBodyLines(callback2) {
  return pushOrConcat([], splitNewlines(callback2));
}
function createTooltipContext(parent, tooltip, tooltipItems) {
  return createContext(parent, {
    tooltip,
    tooltipItems,
    type: "tooltip"
  });
}
function overrideCallbacks(callbacks, context) {
  const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
  return override ? callbacks.override(override) : callbacks;
}
function findOrAddLabel(labels, raw, index, addedLabels) {
  const first = labels.indexOf(raw);
  if (first === -1) {
    return addIfString(labels, raw, index, addedLabels);
  }
  const last = labels.lastIndexOf(raw);
  return first !== last ? index : first;
}
function generateTicks$1(generationOptions, dataRange) {
  const ticks = [];
  const MIN_SPACING = 1e-14;
  const { bounds, step, min, max, precision, count, maxTicks, maxDigits, includeBounds } = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const { min: rmin, max: rmax } = dataRange;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [{ value: rmin }, { value: rmax }];
  }
  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
  }
  if (!isNullOrUndef(precision)) {
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }
  if (bounds === "ticks") {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }
  if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1e3)) {
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    numSpaces = (niceMax - niceMin) / spacing;
    if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1e3)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }
  const decimalPlaces = Math.max(_decimalPlaces(spacing), _decimalPlaces(niceMin));
  factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;
  let j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({ value: min });
      if (niceMin < min) {
        j++;
      }
      if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }
  for (; j < numSpaces; ++j) {
    ticks.push({ value: Math.round((niceMin + j * spacing) * factor) / factor });
  }
  if (maxDefined && includeBounds && niceMax !== max) {
    if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({ value: max });
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({ value: niceMax });
  }
  return ticks;
}
function relativeLabelSize(value, minSpacing, { horizontal, minRotation }) {
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 1e-3;
  const length = 0.75 * minSpacing * ("" + value).length;
  return Math.min(minSpacing / ratio, length);
}
function isMajor(tickVal) {
  const remain = tickVal / Math.pow(10, Math.floor(log10(tickVal)));
  return remain === 1;
}
function generateTicks(generationOptions, dataRange) {
  const endExp = Math.floor(log10(dataRange.max));
  const endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
  const ticks = [];
  let tickVal = finiteOrDefault(generationOptions.min, Math.pow(10, Math.floor(log10(dataRange.min))));
  let exp = Math.floor(log10(tickVal));
  let significand = Math.floor(tickVal / Math.pow(10, exp));
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  do {
    ticks.push({ value: tickVal, major: isMajor(tickVal) });
    ++significand;
    if (significand === 10) {
      significand = 1;
      ++exp;
      precision = exp >= 0 ? 1 : precision;
    }
    tickVal = Math.round(significand * Math.pow(10, exp) * precision) / precision;
  } while (exp < endExp || exp === endExp && significand < endSignificand);
  const lastTick = finiteOrDefault(generationOptions.max, tickVal);
  ticks.push({ value: lastTick, major: isMajor(tickVal) });
  return ticks;
}
function getTickBackdropHeight(opts) {
  const tickOpts = opts.ticks;
  if (tickOpts.display && opts.display) {
    const padding = toPadding(tickOpts.backdropPadding);
    return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height;
  }
  return 0;
}
function measureLabelSize(ctx, font, label) {
  label = isArray(label) ? label : [label];
  return {
    w: _longestText(ctx, font.string, label),
    h: label.length * font.lineHeight
  };
}
function determineLimits(angle, pos, size, min, max) {
  if (angle === min || angle === max) {
    return {
      start: pos - size / 2,
      end: pos + size / 2
    };
  } else if (angle < min || angle > max) {
    return {
      start: pos - size,
      end: pos
    };
  }
  return {
    start: pos,
    end: pos + size
  };
}
function fitWithPointLabels(scale) {
  const furthestLimits = {
    l: 0,
    r: scale.width,
    t: 0,
    b: scale.height - scale.paddingTop
  };
  const furthestAngles = {};
  const labelSizes = [];
  const padding = [];
  const valueCount = scale.getLabels().length;
  for (let i = 0; i < valueCount; i++) {
    const opts = scale.options.pointLabels.setContext(scale.getPointLabelContext(i));
    padding[i] = opts.padding;
    const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i]);
    const plFont = toFont(opts.font);
    const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
    labelSizes[i] = textSize;
    const angleRadians = scale.getIndexAngle(i);
    const angle = toDegrees(angleRadians);
    const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
    const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
    if (hLimits.start < furthestLimits.l) {
      furthestLimits.l = hLimits.start;
      furthestAngles.l = angleRadians;
    }
    if (hLimits.end > furthestLimits.r) {
      furthestLimits.r = hLimits.end;
      furthestAngles.r = angleRadians;
    }
    if (vLimits.start < furthestLimits.t) {
      furthestLimits.t = vLimits.start;
      furthestAngles.t = angleRadians;
    }
    if (vLimits.end > furthestLimits.b) {
      furthestLimits.b = vLimits.end;
      furthestAngles.b = angleRadians;
    }
  }
  scale._setReductions(scale.drawingArea, furthestLimits, furthestAngles);
  scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}
function buildPointLabelItems(scale, labelSizes, padding) {
  const items = [];
  const valueCount = scale.getLabels().length;
  const opts = scale.options;
  const tickBackdropHeight = getTickBackdropHeight(opts);
  const outerDistance = scale.getDistanceFromCenterForValue(opts.ticks.reverse ? scale.min : scale.max);
  for (let i = 0; i < valueCount; i++) {
    const extra = i === 0 ? tickBackdropHeight / 2 : 0;
    const pointLabelPosition = scale.getPointPosition(i, outerDistance + extra + padding[i]);
    const angle = toDegrees(scale.getIndexAngle(i));
    const size = labelSizes[i];
    const y = yForAngle(pointLabelPosition.y, size.h, angle);
    const textAlign = getTextAlignForAngle(angle);
    const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
    items.push({
      x: pointLabelPosition.x,
      y,
      textAlign,
      left,
      top: y,
      right: left + size.w,
      bottom: y + size.h
    });
  }
  return items;
}
function getTextAlignForAngle(angle) {
  if (angle === 0 || angle === 180) {
    return "center";
  } else if (angle < 180) {
    return "left";
  }
  return "right";
}
function leftForTextAlign(x, w, align) {
  if (align === "right") {
    x -= w;
  } else if (align === "center") {
    x -= w / 2;
  }
  return x;
}
function yForAngle(y, h, angle) {
  if (angle === 90 || angle === 270) {
    y -= h / 2;
  } else if (angle > 270 || angle < 90) {
    y -= h;
  }
  return y;
}
function drawPointLabels(scale, labelCount) {
  const { ctx, options: { pointLabels } } = scale;
  for (let i = labelCount - 1; i >= 0; i--) {
    const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
    const plFont = toFont(optsAtIndex.font);
    const { x, y, textAlign, left, top, right, bottom } = scale._pointLabelItems[i];
    const { backdropColor } = optsAtIndex;
    if (!isNullOrUndef(backdropColor)) {
      const padding = toPadding(optsAtIndex.backdropPadding);
      ctx.fillStyle = backdropColor;
      ctx.fillRect(left - padding.left, top - padding.top, right - left + padding.width, bottom - top + padding.height);
    }
    renderText(ctx, scale._pointLabels[i], x, y + plFont.lineHeight / 2, plFont, {
      color: optsAtIndex.color,
      textAlign,
      textBaseline: "middle"
    });
  }
}
function pathRadiusLine(scale, radius, circular, labelCount) {
  const { ctx } = scale;
  if (circular) {
    ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
  } else {
    let pointPosition = scale.getPointPosition(0, radius);
    ctx.moveTo(pointPosition.x, pointPosition.y);
    for (let i = 1; i < labelCount; i++) {
      pointPosition = scale.getPointPosition(i, radius);
      ctx.lineTo(pointPosition.x, pointPosition.y);
    }
  }
}
function drawRadiusLine(scale, gridLineOpts, radius, labelCount) {
  const ctx = scale.ctx;
  const circular = gridLineOpts.circular;
  const { color: color2, lineWidth } = gridLineOpts;
  if (!circular && !labelCount || !color2 || !lineWidth || radius < 0) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = color2;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(gridLineOpts.borderDash);
  ctx.lineDashOffset = gridLineOpts.borderDashOffset;
  ctx.beginPath();
  pathRadiusLine(scale, radius, circular, labelCount);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
function numberOrZero(param) {
  return isNumber(param) ? param : 0;
}
function createPointLabelContext(parent, index, label) {
  return createContext(parent, {
    label,
    index,
    type: "pointLabel"
  });
}
function sorter(a, b) {
  return a - b;
}
function parse(scale, input) {
  if (isNullOrUndef(input)) {
    return null;
  }
  const adapter = scale._adapter;
  const { parser, round: round2, isoWeekday } = scale._parseOpts;
  let value = input;
  if (typeof parser === "function") {
    value = parser(value);
  }
  if (!isNumberFinite(value)) {
    value = typeof parser === "string" ? adapter.parse(value, parser) : adapter.parse(value);
  }
  if (value === null) {
    return null;
  }
  if (round2) {
    value = round2 === "week" && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, "isoWeek", isoWeekday) : adapter.startOf(value, round2);
  }
  return +value;
}
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
  const ilen = UNITS.length;
  for (let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
    const interval = INTERVALS[UNITS[i]];
    const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
    if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
      return UNITS[i];
    }
  }
  return UNITS[ilen - 1];
}
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
  for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
    const unit = UNITS[i];
    if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
      return unit;
    }
  }
  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
function determineMajorUnit(unit) {
  for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
    if (INTERVALS[UNITS[i]].common) {
      return UNITS[i];
    }
  }
}
function addTick(ticks, time, timestamps) {
  if (!timestamps) {
    ticks[time] = true;
  } else if (timestamps.length) {
    const { lo, hi } = _lookup(timestamps, time);
    const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
    ticks[timestamp] = true;
  }
}
function setMajorTicks(scale, ticks, map2, majorUnit) {
  const adapter = scale._adapter;
  const first = +adapter.startOf(ticks[0].value, majorUnit);
  const last = ticks[ticks.length - 1].value;
  let major, index;
  for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
    index = map2[major];
    if (index >= 0) {
      ticks[index].major = true;
    }
  }
  return ticks;
}
function ticksFromTimestamps(scale, values, majorUnit) {
  const ticks = [];
  const map2 = {};
  const ilen = values.length;
  let i, value;
  for (i = 0; i < ilen; ++i) {
    value = values[i];
    map2[value] = i;
    ticks.push({
      value,
      major: false
    });
  }
  return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map2, majorUnit);
}
function interpolate(table, val, reverse) {
  let lo = 0;
  let hi = table.length - 1;
  let prevSource, nextSource, prevTarget, nextTarget;
  if (reverse) {
    if (val >= table[lo].pos && val <= table[hi].pos) {
      ({ lo, hi } = _lookupByKey(table, "pos", val));
    }
    ({ pos: prevSource, time: prevTarget } = table[lo]);
    ({ pos: nextSource, time: nextTarget } = table[hi]);
  } else {
    if (val >= table[lo].time && val <= table[hi].time) {
      ({ lo, hi } = _lookupByKey(table, "time", val));
    }
    ({ time: prevSource, pos: prevTarget } = table[lo]);
    ({ time: nextSource, pos: nextTarget } = table[hi]);
  }
  const span = nextSource - prevSource;
  return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
var requestAnimFrame, _toLeftRightCenter, _alignStartEnd, _textX, uid, isNumberFinite, toPercentage, toDimension, emptyString, dot, defined, isFunction, setsEqual, PI, TAU, PITAU, INFINITY, RAD_PER_DEG, HALF_PI, QUARTER_PI, TWO_THIRDS_PI, log10, sign, atEdge, elasticIn, elasticOut, effects, map$1, hex, h1, h2, eq, lim, RGB_RE, HUE_RE, map$1$1, names, names$1, Color, isPatternOrGradient, overrides, descriptors, Defaults, defaults, LINE_HEIGHT, FONT_STYLE, numberOrZero$1, _lookupByKey, _rlookupByKey, arrayEvents, readKey, needsSubResolver, getScope, EPSILON, getPoint, getValueAxis, getComputedStyle, positions, useOffsetPos, round1, supportsEventListenerOptions, intlCache, getRightToLeftAdapter, getLeftToRightAdapter, Animator, animator, transparent, interpolators, Animation, numbers, colors, animationOptions, Animations, isDirectUpdateMode, cloneIfNotShared, createStack, DatasetController, BarController, BubbleController, DoughnutController, LineController, PolarAreaController, PieController, RadarController, ScatterController, controllers, DateAdapter, adapters, Interaction, STATIC_POSITIONS, layouts, BasePlatform, BasicPlatform, EXPANDO_KEY, EVENT_TYPES, isNullOrEmpty, eventListenerOptions, drpListeningCharts, oldDevicePixelRatio, DomPlatform, Element, formatters, Ticks, reverseAlign, offsetFromEdge, Scale, TypedRegistry, Registry, registry, PluginService, keyCache, keysCached, addIfFound, Config, hasFunction, version, KNOWN_POSITIONS, instances, getChart, Chart$1, invalidatePlugins, enumerable, ArcElement, usePath2D, LineElement, PointElement, BarElement, elements, plugin_decimation, simpleArc, plugin_filler, getBoxSize, itemsEqual, Legend, plugin_legend, Title, plugin_title, map, plugin_subtitle, positioners, Tooltip, plugin_tooltip, plugins, addIfString, validIndex, CategoryScale, LinearScaleBase, LinearScale, LogarithmicScale, RadialLinearScale, INTERVALS, UNITS, TimeScale, TimeSeriesScale, scales, registerables, Base, Line, css7, Chart;
var init_chart_4d567f48 = __esm({
  ".svelte-kit/output/server/chunks/chart-4d567f48.js"() {
    init_shims();
    init_app_2fdd64e5();
    requestAnimFrame = function() {
      if (typeof window === "undefined") {
        return function(callback2) {
          return callback2();
        };
      }
      return window.requestAnimationFrame;
    }();
    _toLeftRightCenter = (align) => align === "start" ? "left" : align === "end" ? "right" : "center";
    _alignStartEnd = (align, start, end) => align === "start" ? start : align === "end" ? end : (start + end) / 2;
    _textX = (align, left, right, rtl) => {
      const check = rtl ? "left" : "right";
      return align === check ? right : align === "center" ? (left + right) / 2 : left;
    };
    uid = function() {
      let id = 0;
      return function() {
        return id++;
      };
    }();
    isNumberFinite = (value) => (typeof value === "number" || value instanceof Number) && isFinite(+value);
    toPercentage = (value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 : value / dimension;
    toDimension = (value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 * dimension : +value;
    emptyString = "";
    dot = ".";
    defined = (value) => typeof value !== "undefined";
    isFunction = (value) => typeof value === "function";
    setsEqual = (a, b) => {
      if (a.size !== b.size) {
        return false;
      }
      for (const item of a) {
        if (!b.has(item)) {
          return false;
        }
      }
      return true;
    };
    PI = Math.PI;
    TAU = 2 * PI;
    PITAU = TAU + PI;
    INFINITY = Number.POSITIVE_INFINITY;
    RAD_PER_DEG = PI / 180;
    HALF_PI = PI / 2;
    QUARTER_PI = PI / 4;
    TWO_THIRDS_PI = PI * 2 / 3;
    log10 = Math.log10;
    sign = Math.sign;
    atEdge = (t) => t === 0 || t === 1;
    elasticIn = (t, s2, p) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s2) * TAU / p));
    elasticOut = (t, s2, p) => Math.pow(2, -10 * t) * Math.sin((t - s2) * TAU / p) + 1;
    effects = {
      linear: (t) => t,
      easeInQuad: (t) => t * t,
      easeOutQuad: (t) => -t * (t - 2),
      easeInOutQuad: (t) => (t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1),
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => (t -= 1) * t * t + 1,
      easeInOutCubic: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2),
      easeInQuart: (t) => t * t * t * t,
      easeOutQuart: (t) => -((t -= 1) * t * t * t - 1),
      easeInOutQuart: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2),
      easeInQuint: (t) => t * t * t * t * t,
      easeOutQuint: (t) => (t -= 1) * t * t * t * t + 1,
      easeInOutQuint: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2),
      easeInSine: (t) => -Math.cos(t * HALF_PI) + 1,
      easeOutSine: (t) => Math.sin(t * HALF_PI),
      easeInOutSine: (t) => -0.5 * (Math.cos(PI * t) - 1),
      easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
      easeOutExpo: (t) => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
      easeInOutExpo: (t) => atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),
      easeInCirc: (t) => t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1),
      easeOutCirc: (t) => Math.sqrt(1 - (t -= 1) * t),
      easeInOutCirc: (t) => (t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
      easeInElastic: (t) => atEdge(t) ? t : elasticIn(t, 0.075, 0.3),
      easeOutElastic: (t) => atEdge(t) ? t : elasticOut(t, 0.075, 0.3),
      easeInOutElastic(t) {
        const s2 = 0.1125;
        const p = 0.45;
        return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s2, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s2, p);
      },
      easeInBack(t) {
        const s2 = 1.70158;
        return t * t * ((s2 + 1) * t - s2);
      },
      easeOutBack(t) {
        const s2 = 1.70158;
        return (t -= 1) * t * ((s2 + 1) * t + s2) + 1;
      },
      easeInOutBack(t) {
        let s2 = 1.70158;
        if ((t /= 0.5) < 1) {
          return 0.5 * (t * t * (((s2 *= 1.525) + 1) * t - s2));
        }
        return 0.5 * ((t -= 2) * t * (((s2 *= 1.525) + 1) * t + s2) + 2);
      },
      easeInBounce: (t) => 1 - effects.easeOutBounce(1 - t),
      easeOutBounce(t) {
        const m = 7.5625;
        const d2 = 2.75;
        if (t < 1 / d2) {
          return m * t * t;
        }
        if (t < 2 / d2) {
          return m * (t -= 1.5 / d2) * t + 0.75;
        }
        if (t < 2.5 / d2) {
          return m * (t -= 2.25 / d2) * t + 0.9375;
        }
        return m * (t -= 2.625 / d2) * t + 0.984375;
      },
      easeInOutBounce: (t) => t < 0.5 ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
    };
    map$1 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 };
    hex = "0123456789ABCDEF";
    h1 = (b) => hex[b & 15];
    h2 = (b) => hex[(b & 240) >> 4] + hex[b & 15];
    eq = (b) => (b & 240) >> 4 === (b & 15);
    lim = (v, l, h) => Math.max(Math.min(v, h), l);
    RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
    HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
    map$1$1 = {
      x: "dark",
      Z: "light",
      Y: "re",
      X: "blu",
      W: "gr",
      V: "medium",
      U: "slate",
      A: "ee",
      T: "ol",
      S: "or",
      B: "ra",
      C: "lateg",
      D: "ights",
      R: "in",
      Q: "turquois",
      E: "hi",
      P: "ro",
      O: "al",
      N: "le",
      M: "de",
      L: "yello",
      F: "en",
      K: "ch",
      G: "arks",
      H: "ea",
      I: "ightg",
      J: "wh"
    };
    names = {
      OiceXe: "f0f8ff",
      antiquewEte: "faebd7",
      aqua: "ffff",
      aquamarRe: "7fffd4",
      azuY: "f0ffff",
      beige: "f5f5dc",
      bisque: "ffe4c4",
      black: "0",
      blanKedOmond: "ffebcd",
      Xe: "ff",
      XeviTet: "8a2be2",
      bPwn: "a52a2a",
      burlywood: "deb887",
      caMtXe: "5f9ea0",
      KartYuse: "7fff00",
      KocTate: "d2691e",
      cSO: "ff7f50",
      cSnflowerXe: "6495ed",
      cSnsilk: "fff8dc",
      crimson: "dc143c",
      cyan: "ffff",
      xXe: "8b",
      xcyan: "8b8b",
      xgTMnPd: "b8860b",
      xWay: "a9a9a9",
      xgYF: "6400",
      xgYy: "a9a9a9",
      xkhaki: "bdb76b",
      xmagFta: "8b008b",
      xTivegYF: "556b2f",
      xSange: "ff8c00",
      xScEd: "9932cc",
      xYd: "8b0000",
      xsOmon: "e9967a",
      xsHgYF: "8fbc8f",
      xUXe: "483d8b",
      xUWay: "2f4f4f",
      xUgYy: "2f4f4f",
      xQe: "ced1",
      xviTet: "9400d3",
      dAppRk: "ff1493",
      dApskyXe: "bfff",
      dimWay: "696969",
      dimgYy: "696969",
      dodgerXe: "1e90ff",
      fiYbrick: "b22222",
      flSOwEte: "fffaf0",
      foYstWAn: "228b22",
      fuKsia: "ff00ff",
      gaRsbSo: "dcdcdc",
      ghostwEte: "f8f8ff",
      gTd: "ffd700",
      gTMnPd: "daa520",
      Way: "808080",
      gYF: "8000",
      gYFLw: "adff2f",
      gYy: "808080",
      honeyMw: "f0fff0",
      hotpRk: "ff69b4",
      RdianYd: "cd5c5c",
      Rdigo: "4b0082",
      ivSy: "fffff0",
      khaki: "f0e68c",
      lavFMr: "e6e6fa",
      lavFMrXsh: "fff0f5",
      lawngYF: "7cfc00",
      NmoncEffon: "fffacd",
      ZXe: "add8e6",
      ZcSO: "f08080",
      Zcyan: "e0ffff",
      ZgTMnPdLw: "fafad2",
      ZWay: "d3d3d3",
      ZgYF: "90ee90",
      ZgYy: "d3d3d3",
      ZpRk: "ffb6c1",
      ZsOmon: "ffa07a",
      ZsHgYF: "20b2aa",
      ZskyXe: "87cefa",
      ZUWay: "778899",
      ZUgYy: "778899",
      ZstAlXe: "b0c4de",
      ZLw: "ffffe0",
      lime: "ff00",
      limegYF: "32cd32",
      lRF: "faf0e6",
      magFta: "ff00ff",
      maPon: "800000",
      VaquamarRe: "66cdaa",
      VXe: "cd",
      VScEd: "ba55d3",
      VpurpN: "9370db",
      VsHgYF: "3cb371",
      VUXe: "7b68ee",
      VsprRggYF: "fa9a",
      VQe: "48d1cc",
      VviTetYd: "c71585",
      midnightXe: "191970",
      mRtcYam: "f5fffa",
      mistyPse: "ffe4e1",
      moccasR: "ffe4b5",
      navajowEte: "ffdead",
      navy: "80",
      Tdlace: "fdf5e6",
      Tive: "808000",
      TivedBb: "6b8e23",
      Sange: "ffa500",
      SangeYd: "ff4500",
      ScEd: "da70d6",
      pOegTMnPd: "eee8aa",
      pOegYF: "98fb98",
      pOeQe: "afeeee",
      pOeviTetYd: "db7093",
      papayawEp: "ffefd5",
      pHKpuff: "ffdab9",
      peru: "cd853f",
      pRk: "ffc0cb",
      plum: "dda0dd",
      powMrXe: "b0e0e6",
      purpN: "800080",
      YbeccapurpN: "663399",
      Yd: "ff0000",
      Psybrown: "bc8f8f",
      PyOXe: "4169e1",
      saddNbPwn: "8b4513",
      sOmon: "fa8072",
      sandybPwn: "f4a460",
      sHgYF: "2e8b57",
      sHshell: "fff5ee",
      siFna: "a0522d",
      silver: "c0c0c0",
      skyXe: "87ceeb",
      UXe: "6a5acd",
      UWay: "708090",
      UgYy: "708090",
      snow: "fffafa",
      sprRggYF: "ff7f",
      stAlXe: "4682b4",
      tan: "d2b48c",
      teO: "8080",
      tEstN: "d8bfd8",
      tomato: "ff6347",
      Qe: "40e0d0",
      viTet: "ee82ee",
      JHt: "f5deb3",
      wEte: "ffffff",
      wEtesmoke: "f5f5f5",
      Lw: "ffff00",
      LwgYF: "9acd32"
    };
    Color = class {
      constructor(input) {
        if (input instanceof Color) {
          return input;
        }
        const type = typeof input;
        let v;
        if (type === "object") {
          v = fromObject(input);
        } else if (type === "string") {
          v = hexParse(input) || nameParse(input) || functionParse(input);
        }
        this._rgb = v;
        this._valid = !!v;
      }
      get valid() {
        return this._valid;
      }
      get rgb() {
        var v = clone2(this._rgb);
        if (v) {
          v.a = b2n(v.a);
        }
        return v;
      }
      set rgb(obj) {
        this._rgb = fromObject(obj);
      }
      rgbString() {
        return this._valid ? rgbString(this._rgb) : this._rgb;
      }
      hexString() {
        return this._valid ? hexString(this._rgb) : this._rgb;
      }
      hslString() {
        return this._valid ? hslString(this._rgb) : this._rgb;
      }
      mix(color2, weight) {
        const me = this;
        if (color2) {
          const c1 = me.rgb;
          const c2 = color2.rgb;
          let w2;
          const p = weight === w2 ? 0.5 : weight;
          const w = 2 * p - 1;
          const a = c1.a - c2.a;
          const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
          w2 = 1 - w1;
          c1.r = 255 & w1 * c1.r + w2 * c2.r + 0.5;
          c1.g = 255 & w1 * c1.g + w2 * c2.g + 0.5;
          c1.b = 255 & w1 * c1.b + w2 * c2.b + 0.5;
          c1.a = p * c1.a + (1 - p) * c2.a;
          me.rgb = c1;
        }
        return me;
      }
      clone() {
        return new Color(this.rgb);
      }
      alpha(a) {
        this._rgb.a = n2b(a);
        return this;
      }
      clearer(ratio) {
        const rgb = this._rgb;
        rgb.a *= 1 - ratio;
        return this;
      }
      greyscale() {
        const rgb = this._rgb;
        const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
        rgb.r = rgb.g = rgb.b = val;
        return this;
      }
      opaquer(ratio) {
        const rgb = this._rgb;
        rgb.a *= 1 + ratio;
        return this;
      }
      negate() {
        const v = this._rgb;
        v.r = 255 - v.r;
        v.g = 255 - v.g;
        v.b = 255 - v.b;
        return this;
      }
      lighten(ratio) {
        modHSL(this._rgb, 2, ratio);
        return this;
      }
      darken(ratio) {
        modHSL(this._rgb, 2, -ratio);
        return this;
      }
      saturate(ratio) {
        modHSL(this._rgb, 1, ratio);
        return this;
      }
      desaturate(ratio) {
        modHSL(this._rgb, 1, -ratio);
        return this;
      }
      rotate(deg) {
        rotate(this._rgb, deg);
        return this;
      }
    };
    isPatternOrGradient = (value) => value instanceof CanvasGradient || value instanceof CanvasPattern;
    overrides = Object.create(null);
    descriptors = Object.create(null);
    Defaults = class {
      constructor(_descriptors2) {
        this.animation = void 0;
        this.backgroundColor = "rgba(0,0,0,0.1)";
        this.borderColor = "rgba(0,0,0,0.1)";
        this.color = "#666";
        this.datasets = {};
        this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
        this.elements = {};
        this.events = [
          "mousemove",
          "mouseout",
          "click",
          "touchstart",
          "touchmove"
        ];
        this.font = {
          family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          size: 12,
          style: "normal",
          lineHeight: 1.2,
          weight: null
        };
        this.hover = {};
        this.hoverBackgroundColor = (ctx, options2) => getHoverColor(options2.backgroundColor);
        this.hoverBorderColor = (ctx, options2) => getHoverColor(options2.borderColor);
        this.hoverColor = (ctx, options2) => getHoverColor(options2.color);
        this.indexAxis = "x";
        this.interaction = {
          mode: "nearest",
          intersect: true
        };
        this.maintainAspectRatio = true;
        this.onHover = null;
        this.onClick = null;
        this.parsing = true;
        this.plugins = {};
        this.responsive = true;
        this.scale = void 0;
        this.scales = {};
        this.showLine = true;
        this.describe(_descriptors2);
      }
      set(scope, values) {
        return set(this, scope, values);
      }
      get(scope) {
        return getScope$1(this, scope);
      }
      describe(scope, values) {
        return set(descriptors, scope, values);
      }
      override(scope, values) {
        return set(overrides, scope, values);
      }
      route(scope, name, targetScope, targetName) {
        const scopeObject = getScope$1(this, scope);
        const targetScopeObject = getScope$1(this, targetScope);
        const privateName = "_" + name;
        Object.defineProperties(scopeObject, {
          [privateName]: {
            value: scopeObject[name],
            writable: true
          },
          [name]: {
            enumerable: true,
            get() {
              const local = this[privateName];
              const target = targetScopeObject[targetName];
              if (isObject(local)) {
                return Object.assign({}, target, local);
              }
              return valueOrDefault(local, target);
            },
            set(value) {
              this[privateName] = value;
            }
          }
        });
      }
    };
    defaults = new Defaults({
      _scriptable: (name) => !name.startsWith("on"),
      _indexable: (name) => name !== "events",
      hover: {
        _fallback: "interaction"
      },
      interaction: {
        _scriptable: false,
        _indexable: false
      }
    });
    LINE_HEIGHT = new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
    FONT_STYLE = new RegExp(/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/);
    numberOrZero$1 = (v) => +v || 0;
    _lookupByKey = (table, key, value) => _lookup(table, value, (index) => table[index][key] < value);
    _rlookupByKey = (table, key, value) => _lookup(table, value, (index) => table[index][key] >= value);
    arrayEvents = ["push", "pop", "shift", "splice", "unshift"];
    readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name;
    needsSubResolver = (prop, value) => isObject(value) && prop !== "adapters" && (Object.getPrototypeOf(value) === null || value.constructor === Object);
    getScope = (key, parent) => key === true ? parent : typeof key === "string" ? resolveObjectKey(parent, key) : void 0;
    EPSILON = Number.EPSILON || 1e-14;
    getPoint = (points, i) => i < points.length && !points[i].skip && points[i];
    getValueAxis = (indexAxis) => indexAxis === "x" ? "y" : "x";
    getComputedStyle = (element) => window.getComputedStyle(element, null);
    positions = ["top", "right", "bottom", "left"];
    useOffsetPos = (x, y, target) => (x > 0 || y > 0) && (!target || !target.shadowRoot);
    round1 = (v) => Math.round(v * 10) / 10;
    supportsEventListenerOptions = function() {
      let passiveSupported = false;
      try {
        const options2 = {
          get passive() {
            passiveSupported = true;
            return false;
          }
        };
        window.addEventListener("test", null, options2);
        window.removeEventListener("test", null, options2);
      } catch (e) {
      }
      return passiveSupported;
    }();
    intlCache = new Map();
    getRightToLeftAdapter = function(rectX, width) {
      return {
        x(x) {
          return rectX + rectX + width - x;
        },
        setWidth(w) {
          width = w;
        },
        textAlign(align) {
          if (align === "center") {
            return align;
          }
          return align === "right" ? "left" : "right";
        },
        xPlus(x, value) {
          return x - value;
        },
        leftForLtr(x, itemWidth) {
          return x - itemWidth;
        }
      };
    };
    getLeftToRightAdapter = function() {
      return {
        x(x) {
          return x;
        },
        setWidth(w) {
        },
        textAlign(align) {
          return align;
        },
        xPlus(x, value) {
          return x + value;
        },
        leftForLtr(x, _itemWidth) {
          return x;
        }
      };
    };
    Animator = class {
      constructor() {
        this._request = null;
        this._charts = new Map();
        this._running = false;
        this._lastDate = void 0;
      }
      _notify(chart, anims, date, type) {
        const callbacks = anims.listeners[type];
        const numSteps = anims.duration;
        callbacks.forEach((fn) => fn({
          chart,
          initial: anims.initial,
          numSteps,
          currentStep: Math.min(date - anims.start, numSteps)
        }));
      }
      _refresh() {
        if (this._request) {
          return;
        }
        this._running = true;
        this._request = requestAnimFrame.call(window, () => {
          this._update();
          this._request = null;
          if (this._running) {
            this._refresh();
          }
        });
      }
      _update(date = Date.now()) {
        let remaining = 0;
        this._charts.forEach((anims, chart) => {
          if (!anims.running || !anims.items.length) {
            return;
          }
          const items = anims.items;
          let i = items.length - 1;
          let draw2 = false;
          let item;
          for (; i >= 0; --i) {
            item = items[i];
            if (item._active) {
              if (item._total > anims.duration) {
                anims.duration = item._total;
              }
              item.tick(date);
              draw2 = true;
            } else {
              items[i] = items[items.length - 1];
              items.pop();
            }
          }
          if (draw2) {
            chart.draw();
            this._notify(chart, anims, date, "progress");
          }
          if (!items.length) {
            anims.running = false;
            this._notify(chart, anims, date, "complete");
            anims.initial = false;
          }
          remaining += items.length;
        });
        this._lastDate = date;
        if (remaining === 0) {
          this._running = false;
        }
      }
      _getAnims(chart) {
        const charts = this._charts;
        let anims = charts.get(chart);
        if (!anims) {
          anims = {
            running: false,
            initial: true,
            items: [],
            listeners: {
              complete: [],
              progress: []
            }
          };
          charts.set(chart, anims);
        }
        return anims;
      }
      listen(chart, event, cb) {
        this._getAnims(chart).listeners[event].push(cb);
      }
      add(chart, items) {
        if (!items || !items.length) {
          return;
        }
        this._getAnims(chart).items.push(...items);
      }
      has(chart) {
        return this._getAnims(chart).items.length > 0;
      }
      start(chart) {
        const anims = this._charts.get(chart);
        if (!anims) {
          return;
        }
        anims.running = true;
        anims.start = Date.now();
        anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
        this._refresh();
      }
      running(chart) {
        if (!this._running) {
          return false;
        }
        const anims = this._charts.get(chart);
        if (!anims || !anims.running || !anims.items.length) {
          return false;
        }
        return true;
      }
      stop(chart) {
        const anims = this._charts.get(chart);
        if (!anims || !anims.items.length) {
          return;
        }
        const items = anims.items;
        let i = items.length - 1;
        for (; i >= 0; --i) {
          items[i].cancel();
        }
        anims.items = [];
        this._notify(chart, anims, Date.now(), "complete");
      }
      remove(chart) {
        return this._charts.delete(chart);
      }
    };
    animator = new Animator();
    transparent = "transparent";
    interpolators = {
      boolean(from, to, factor) {
        return factor > 0.5 ? to : from;
      },
      color(from, to, factor) {
        const c0 = color(from || transparent);
        const c1 = c0.valid && color(to || transparent);
        return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to;
      },
      number(from, to, factor) {
        return from + (to - from) * factor;
      }
    };
    Animation = class {
      constructor(cfg, target, prop, to) {
        const currentValue = target[prop];
        to = resolve([cfg.to, to, currentValue, cfg.from]);
        const from = resolve([cfg.from, currentValue, to]);
        this._active = true;
        this._fn = cfg.fn || interpolators[cfg.type || typeof from];
        this._easing = effects[cfg.easing] || effects.linear;
        this._start = Math.floor(Date.now() + (cfg.delay || 0));
        this._duration = this._total = Math.floor(cfg.duration);
        this._loop = !!cfg.loop;
        this._target = target;
        this._prop = prop;
        this._from = from;
        this._to = to;
        this._promises = void 0;
      }
      active() {
        return this._active;
      }
      update(cfg, to, date) {
        if (this._active) {
          this._notify(false);
          const currentValue = this._target[this._prop];
          const elapsed = date - this._start;
          const remain = this._duration - elapsed;
          this._start = date;
          this._duration = Math.floor(Math.max(remain, cfg.duration));
          this._total += elapsed;
          this._loop = !!cfg.loop;
          this._to = resolve([cfg.to, to, currentValue, cfg.from]);
          this._from = resolve([cfg.from, currentValue, to]);
        }
      }
      cancel() {
        if (this._active) {
          this.tick(Date.now());
          this._active = false;
          this._notify(false);
        }
      }
      tick(date) {
        const elapsed = date - this._start;
        const duration = this._duration;
        const prop = this._prop;
        const from = this._from;
        const loop = this._loop;
        const to = this._to;
        let factor;
        this._active = from !== to && (loop || elapsed < duration);
        if (!this._active) {
          this._target[prop] = to;
          this._notify(true);
          return;
        }
        if (elapsed < 0) {
          this._target[prop] = from;
          return;
        }
        factor = elapsed / duration % 2;
        factor = loop && factor > 1 ? 2 - factor : factor;
        factor = this._easing(Math.min(1, Math.max(0, factor)));
        this._target[prop] = this._fn(from, to, factor);
      }
      wait() {
        const promises = this._promises || (this._promises = []);
        return new Promise((res, rej) => {
          promises.push({ res, rej });
        });
      }
      _notify(resolved) {
        const method = resolved ? "res" : "rej";
        const promises = this._promises || [];
        for (let i = 0; i < promises.length; i++) {
          promises[i][method]();
        }
      }
    };
    numbers = ["x", "y", "borderWidth", "radius", "tension"];
    colors = ["color", "borderColor", "backgroundColor"];
    defaults.set("animation", {
      delay: void 0,
      duration: 1e3,
      easing: "easeOutQuart",
      fn: void 0,
      from: void 0,
      loop: void 0,
      to: void 0,
      type: void 0
    });
    animationOptions = Object.keys(defaults.animation);
    defaults.describe("animation", {
      _fallback: false,
      _indexable: false,
      _scriptable: (name) => name !== "onProgress" && name !== "onComplete" && name !== "fn"
    });
    defaults.set("animations", {
      colors: {
        type: "color",
        properties: colors
      },
      numbers: {
        type: "number",
        properties: numbers
      }
    });
    defaults.describe("animations", {
      _fallback: "animation"
    });
    defaults.set("transitions", {
      active: {
        animation: {
          duration: 400
        }
      },
      resize: {
        animation: {
          duration: 0
        }
      },
      show: {
        animations: {
          colors: {
            from: "transparent"
          },
          visible: {
            type: "boolean",
            duration: 0
          }
        }
      },
      hide: {
        animations: {
          colors: {
            to: "transparent"
          },
          visible: {
            type: "boolean",
            easing: "linear",
            fn: (v) => v | 0
          }
        }
      }
    });
    Animations = class {
      constructor(chart, config) {
        this._chart = chart;
        this._properties = new Map();
        this.configure(config);
      }
      configure(config) {
        if (!isObject(config)) {
          return;
        }
        const animatedProps = this._properties;
        Object.getOwnPropertyNames(config).forEach((key) => {
          const cfg = config[key];
          if (!isObject(cfg)) {
            return;
          }
          const resolved = {};
          for (const option of animationOptions) {
            resolved[option] = cfg[option];
          }
          (isArray(cfg.properties) && cfg.properties || [key]).forEach((prop) => {
            if (prop === key || !animatedProps.has(prop)) {
              animatedProps.set(prop, resolved);
            }
          });
        });
      }
      _animateOptions(target, values) {
        const newOptions = values.options;
        const options2 = resolveTargetOptions(target, newOptions);
        if (!options2) {
          return [];
        }
        const animations = this._createAnimations(options2, newOptions);
        if (newOptions.$shared) {
          awaitAll(target.options.$animations, newOptions).then(() => {
            target.options = newOptions;
          }, () => {
          });
        }
        return animations;
      }
      _createAnimations(target, values) {
        const animatedProps = this._properties;
        const animations = [];
        const running = target.$animations || (target.$animations = {});
        const props = Object.keys(values);
        const date = Date.now();
        let i;
        for (i = props.length - 1; i >= 0; --i) {
          const prop = props[i];
          if (prop.charAt(0) === "$") {
            continue;
          }
          if (prop === "options") {
            animations.push(...this._animateOptions(target, values));
            continue;
          }
          const value = values[prop];
          let animation = running[prop];
          const cfg = animatedProps.get(prop);
          if (animation) {
            if (cfg && animation.active()) {
              animation.update(cfg, value, date);
              continue;
            } else {
              animation.cancel();
            }
          }
          if (!cfg || !cfg.duration) {
            target[prop] = value;
            continue;
          }
          running[prop] = animation = new Animation(cfg, target, prop, value);
          animations.push(animation);
        }
        return animations;
      }
      update(target, values) {
        if (this._properties.size === 0) {
          Object.assign(target, values);
          return;
        }
        const animations = this._createAnimations(target, values);
        if (animations.length) {
          animator.add(this._chart, animations);
          return true;
        }
      }
    };
    isDirectUpdateMode = (mode) => mode === "reset" || mode === "none";
    cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached);
    createStack = (canStack, meta, chart) => canStack && !meta.hidden && meta._stacked && { keys: getSortedDatasetIndices(chart, true), values: null };
    DatasetController = class {
      constructor(chart, datasetIndex) {
        this.chart = chart;
        this._ctx = chart.ctx;
        this.index = datasetIndex;
        this._cachedDataOpts = {};
        this._cachedMeta = this.getMeta();
        this._type = this._cachedMeta.type;
        this.options = void 0;
        this._parsing = false;
        this._data = void 0;
        this._objectData = void 0;
        this._sharedOptions = void 0;
        this._drawStart = void 0;
        this._drawCount = void 0;
        this.enableOptionSharing = false;
        this.$context = void 0;
        this._syncList = [];
        this.initialize();
      }
      initialize() {
        const meta = this._cachedMeta;
        this.configure();
        this.linkScales();
        meta._stacked = isStacked(meta.vScale, meta);
        this.addElements();
      }
      updateIndex(datasetIndex) {
        if (this.index !== datasetIndex) {
          clearStacks(this._cachedMeta);
        }
        this.index = datasetIndex;
      }
      linkScales() {
        const chart = this.chart;
        const meta = this._cachedMeta;
        const dataset = this.getDataset();
        const chooseId = (axis, x, y, r) => axis === "x" ? x : axis === "r" ? r : y;
        const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, "x"));
        const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, "y"));
        const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, "r"));
        const indexAxis = meta.indexAxis;
        const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
        const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
        meta.xScale = this.getScaleForId(xid);
        meta.yScale = this.getScaleForId(yid);
        meta.rScale = this.getScaleForId(rid);
        meta.iScale = this.getScaleForId(iid);
        meta.vScale = this.getScaleForId(vid);
      }
      getDataset() {
        return this.chart.data.datasets[this.index];
      }
      getMeta() {
        return this.chart.getDatasetMeta(this.index);
      }
      getScaleForId(scaleID) {
        return this.chart.scales[scaleID];
      }
      _getOtherScale(scale) {
        const meta = this._cachedMeta;
        return scale === meta.iScale ? meta.vScale : meta.iScale;
      }
      reset() {
        this._update("reset");
      }
      _destroy() {
        const meta = this._cachedMeta;
        if (this._data) {
          unlistenArrayEvents(this._data, this);
        }
        if (meta._stacked) {
          clearStacks(meta);
        }
      }
      _dataCheck() {
        const dataset = this.getDataset();
        const data = dataset.data || (dataset.data = []);
        const _data = this._data;
        if (isObject(data)) {
          this._data = convertObjectDataToArray(data);
        } else if (_data !== data) {
          if (_data) {
            unlistenArrayEvents(_data, this);
            const meta = this._cachedMeta;
            clearStacks(meta);
            meta._parsed = [];
          }
          if (data && Object.isExtensible(data)) {
            listenArrayEvents(data, this);
          }
          this._syncList = [];
          this._data = data;
        }
      }
      addElements() {
        const meta = this._cachedMeta;
        this._dataCheck();
        if (this.datasetElementType) {
          meta.dataset = new this.datasetElementType();
        }
      }
      buildOrUpdateElements(resetNewElements) {
        const meta = this._cachedMeta;
        const dataset = this.getDataset();
        let stackChanged = false;
        this._dataCheck();
        const oldStacked = meta._stacked;
        meta._stacked = isStacked(meta.vScale, meta);
        if (meta.stack !== dataset.stack) {
          stackChanged = true;
          clearStacks(meta);
          meta.stack = dataset.stack;
        }
        this._resyncElements(resetNewElements);
        if (stackChanged || oldStacked !== meta._stacked) {
          updateStacks(this, meta._parsed);
        }
      }
      configure() {
        const config = this.chart.config;
        const scopeKeys = config.datasetScopeKeys(this._type);
        const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
        this.options = config.createResolver(scopes, this.getContext());
        this._parsing = this.options.parsing;
        this._cachedDataOpts = {};
      }
      parse(start, count) {
        const { _cachedMeta: meta, _data: data } = this;
        const { iScale, _stacked } = meta;
        const iAxis = iScale.axis;
        let sorted = start === 0 && count === data.length ? true : meta._sorted;
        let prev = start > 0 && meta._parsed[start - 1];
        let i, cur, parsed;
        if (this._parsing === false) {
          meta._parsed = data;
          meta._sorted = true;
          parsed = data;
        } else {
          if (isArray(data[start])) {
            parsed = this.parseArrayData(meta, data, start, count);
          } else if (isObject(data[start])) {
            parsed = this.parseObjectData(meta, data, start, count);
          } else {
            parsed = this.parsePrimitiveData(meta, data, start, count);
          }
          const isNotInOrderComparedToPrev = () => cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis];
          for (i = 0; i < count; ++i) {
            meta._parsed[i + start] = cur = parsed[i];
            if (sorted) {
              if (isNotInOrderComparedToPrev()) {
                sorted = false;
              }
              prev = cur;
            }
          }
          meta._sorted = sorted;
        }
        if (_stacked) {
          updateStacks(this, parsed);
        }
      }
      parsePrimitiveData(meta, data, start, count) {
        const { iScale, vScale } = meta;
        const iAxis = iScale.axis;
        const vAxis = vScale.axis;
        const labels = iScale.getLabels();
        const singleScale = iScale === vScale;
        const parsed = new Array(count);
        let i, ilen, index;
        for (i = 0, ilen = count; i < ilen; ++i) {
          index = i + start;
          parsed[i] = {
            [iAxis]: singleScale || iScale.parse(labels[index], index),
            [vAxis]: vScale.parse(data[index], index)
          };
        }
        return parsed;
      }
      parseArrayData(meta, data, start, count) {
        const { xScale, yScale } = meta;
        const parsed = new Array(count);
        let i, ilen, index, item;
        for (i = 0, ilen = count; i < ilen; ++i) {
          index = i + start;
          item = data[index];
          parsed[i] = {
            x: xScale.parse(item[0], index),
            y: yScale.parse(item[1], index)
          };
        }
        return parsed;
      }
      parseObjectData(meta, data, start, count) {
        const { xScale, yScale } = meta;
        const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
        const parsed = new Array(count);
        let i, ilen, index, item;
        for (i = 0, ilen = count; i < ilen; ++i) {
          index = i + start;
          item = data[index];
          parsed[i] = {
            x: xScale.parse(resolveObjectKey(item, xAxisKey), index),
            y: yScale.parse(resolveObjectKey(item, yAxisKey), index)
          };
        }
        return parsed;
      }
      getParsed(index) {
        return this._cachedMeta._parsed[index];
      }
      getDataElement(index) {
        return this._cachedMeta.data[index];
      }
      applyStack(scale, parsed, mode) {
        const chart = this.chart;
        const meta = this._cachedMeta;
        const value = parsed[scale.axis];
        const stack = {
          keys: getSortedDatasetIndices(chart, true),
          values: parsed._stacks[scale.axis]
        };
        return applyStack(stack, value, meta.index, { mode });
      }
      updateRangeFromParsed(range, scale, parsed, stack) {
        const parsedValue = parsed[scale.axis];
        let value = parsedValue === null ? NaN : parsedValue;
        const values = stack && parsed._stacks[scale.axis];
        if (stack && values) {
          stack.values = values;
          value = applyStack(stack, parsedValue, this._cachedMeta.index);
        }
        range.min = Math.min(range.min, value);
        range.max = Math.max(range.max, value);
      }
      getMinMax(scale, canStack) {
        const meta = this._cachedMeta;
        const _parsed = meta._parsed;
        const sorted = meta._sorted && scale === meta.iScale;
        const ilen = _parsed.length;
        const otherScale = this._getOtherScale(scale);
        const stack = createStack(canStack, meta, this.chart);
        const range = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY };
        const { min: otherMin, max: otherMax } = getUserBounds(otherScale);
        let i, parsed;
        function _skip() {
          parsed = _parsed[i];
          const otherValue = parsed[otherScale.axis];
          return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
        }
        for (i = 0; i < ilen; ++i) {
          if (_skip()) {
            continue;
          }
          this.updateRangeFromParsed(range, scale, parsed, stack);
          if (sorted) {
            break;
          }
        }
        if (sorted) {
          for (i = ilen - 1; i >= 0; --i) {
            if (_skip()) {
              continue;
            }
            this.updateRangeFromParsed(range, scale, parsed, stack);
            break;
          }
        }
        return range;
      }
      getAllParsedValues(scale) {
        const parsed = this._cachedMeta._parsed;
        const values = [];
        let i, ilen, value;
        for (i = 0, ilen = parsed.length; i < ilen; ++i) {
          value = parsed[i][scale.axis];
          if (isNumberFinite(value)) {
            values.push(value);
          }
        }
        return values;
      }
      getMaxOverflow() {
        return false;
      }
      getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const iScale = meta.iScale;
        const vScale = meta.vScale;
        const parsed = this.getParsed(index);
        return {
          label: iScale ? "" + iScale.getLabelForValue(parsed[iScale.axis]) : "",
          value: vScale ? "" + vScale.getLabelForValue(parsed[vScale.axis]) : ""
        };
      }
      _update(mode) {
        const meta = this._cachedMeta;
        this.update(mode || "default");
        meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
      }
      update(mode) {
      }
      draw() {
        const ctx = this._ctx;
        const chart = this.chart;
        const meta = this._cachedMeta;
        const elements2 = meta.data || [];
        const area = chart.chartArea;
        const active = [];
        const start = this._drawStart || 0;
        const count = this._drawCount || elements2.length - start;
        let i;
        if (meta.dataset) {
          meta.dataset.draw(ctx, area, start, count);
        }
        for (i = start; i < start + count; ++i) {
          const element = elements2[i];
          if (element.hidden) {
            continue;
          }
          if (element.active) {
            active.push(element);
          } else {
            element.draw(ctx, area);
          }
        }
        for (i = 0; i < active.length; ++i) {
          active[i].draw(ctx, area);
        }
      }
      getStyle(index, active) {
        const mode = active ? "active" : "default";
        return index === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index || 0, mode);
      }
      getContext(index, active, mode) {
        const dataset = this.getDataset();
        let context;
        if (index >= 0 && index < this._cachedMeta.data.length) {
          const element = this._cachedMeta.data[index];
          context = element.$context || (element.$context = createDataContext(this.getContext(), index, element));
          context.parsed = this.getParsed(index);
          context.raw = dataset.data[index];
          context.index = context.dataIndex = index;
        } else {
          context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
          context.dataset = dataset;
          context.index = context.datasetIndex = this.index;
        }
        context.active = !!active;
        context.mode = mode;
        return context;
      }
      resolveDatasetElementOptions(mode) {
        return this._resolveElementOptions(this.datasetElementType.id, mode);
      }
      resolveDataElementOptions(index, mode) {
        return this._resolveElementOptions(this.dataElementType.id, mode, index);
      }
      _resolveElementOptions(elementType, mode = "default", index) {
        const active = mode === "active";
        const cache = this._cachedDataOpts;
        const cacheKey = elementType + "-" + mode;
        const cached = cache[cacheKey];
        const sharing = this.enableOptionSharing && defined(index);
        if (cached) {
          return cloneIfNotShared(cached, sharing);
        }
        const config = this.chart.config;
        const scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
        const prefixes = active ? [`${elementType}Hover`, "hover", elementType, ""] : [elementType, ""];
        const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
        const names2 = Object.keys(defaults.elements[elementType]);
        const context = () => this.getContext(index, active);
        const values = config.resolveNamedOptions(scopes, names2, context, prefixes);
        if (values.$shared) {
          values.$shared = sharing;
          cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
        }
        return values;
      }
      _resolveAnimations(index, transition, active) {
        const chart = this.chart;
        const cache = this._cachedDataOpts;
        const cacheKey = `animation-${transition}`;
        const cached = cache[cacheKey];
        if (cached) {
          return cached;
        }
        let options2;
        if (chart.options.animation !== false) {
          const config = this.chart.config;
          const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
          const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
          options2 = config.createResolver(scopes, this.getContext(index, active, transition));
        }
        const animations = new Animations(chart, options2 && options2.animations);
        if (options2 && options2._cacheable) {
          cache[cacheKey] = Object.freeze(animations);
        }
        return animations;
      }
      getSharedOptions(options2) {
        if (!options2.$shared) {
          return;
        }
        return this._sharedOptions || (this._sharedOptions = Object.assign({}, options2));
      }
      includeOptions(mode, sharedOptions) {
        return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
      }
      updateElement(element, index, properties, mode) {
        if (isDirectUpdateMode(mode)) {
          Object.assign(element, properties);
        } else {
          this._resolveAnimations(index, mode).update(element, properties);
        }
      }
      updateSharedOptions(sharedOptions, mode, newOptions) {
        if (sharedOptions && !isDirectUpdateMode(mode)) {
          this._resolveAnimations(void 0, mode).update(sharedOptions, newOptions);
        }
      }
      _setStyle(element, index, mode, active) {
        element.active = active;
        const options2 = this.getStyle(index, active);
        this._resolveAnimations(index, mode, active).update(element, {
          options: !active && this.getSharedOptions(options2) || options2
        });
      }
      removeHoverStyle(element, datasetIndex, index) {
        this._setStyle(element, index, "active", false);
      }
      setHoverStyle(element, datasetIndex, index) {
        this._setStyle(element, index, "active", true);
      }
      _removeDatasetHoverStyle() {
        const element = this._cachedMeta.dataset;
        if (element) {
          this._setStyle(element, void 0, "active", false);
        }
      }
      _setDatasetHoverStyle() {
        const element = this._cachedMeta.dataset;
        if (element) {
          this._setStyle(element, void 0, "active", true);
        }
      }
      _resyncElements(resetNewElements) {
        const data = this._data;
        const elements2 = this._cachedMeta.data;
        for (const [method, arg1, arg2] of this._syncList) {
          this[method](arg1, arg2);
        }
        this._syncList = [];
        const numMeta = elements2.length;
        const numData = data.length;
        const count = Math.min(numData, numMeta);
        if (count) {
          this.parse(0, count);
        }
        if (numData > numMeta) {
          this._insertElements(numMeta, numData - numMeta, resetNewElements);
        } else if (numData < numMeta) {
          this._removeElements(numData, numMeta - numData);
        }
      }
      _insertElements(start, count, resetNewElements = true) {
        const meta = this._cachedMeta;
        const data = meta.data;
        const end = start + count;
        let i;
        const move = (arr) => {
          arr.length += count;
          for (i = arr.length - 1; i >= end; i--) {
            arr[i] = arr[i - count];
          }
        };
        move(data);
        for (i = start; i < end; ++i) {
          data[i] = new this.dataElementType();
        }
        if (this._parsing) {
          move(meta._parsed);
        }
        this.parse(start, count);
        if (resetNewElements) {
          this.updateElements(data, start, count, "reset");
        }
      }
      updateElements(element, start, count, mode) {
      }
      _removeElements(start, count) {
        const meta = this._cachedMeta;
        if (this._parsing) {
          const removed = meta._parsed.splice(start, count);
          if (meta._stacked) {
            clearStacks(meta, removed);
          }
        }
        meta.data.splice(start, count);
      }
      _sync(args) {
        if (this._parsing) {
          this._syncList.push(args);
        } else {
          const [method, arg1, arg2] = args;
          this[method](arg1, arg2);
        }
        this.chart._dataChanges.push([this.index, ...args]);
      }
      _onDataPush() {
        const count = arguments.length;
        this._sync(["_insertElements", this.getDataset().data.length - count, count]);
      }
      _onDataPop() {
        this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]);
      }
      _onDataShift() {
        this._sync(["_removeElements", 0, 1]);
      }
      _onDataSplice(start, count) {
        if (count) {
          this._sync(["_removeElements", start, count]);
        }
        const newCount = arguments.length - 2;
        if (newCount) {
          this._sync(["_insertElements", start, newCount]);
        }
      }
      _onDataUnshift() {
        this._sync(["_insertElements", 0, arguments.length]);
      }
    };
    DatasetController.defaults = {};
    DatasetController.prototype.datasetElementType = null;
    DatasetController.prototype.dataElementType = null;
    BarController = class extends DatasetController {
      parsePrimitiveData(meta, data, start, count) {
        return parseArrayOrPrimitive(meta, data, start, count);
      }
      parseArrayData(meta, data, start, count) {
        return parseArrayOrPrimitive(meta, data, start, count);
      }
      parseObjectData(meta, data, start, count) {
        const { iScale, vScale } = meta;
        const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
        const iAxisKey = iScale.axis === "x" ? xAxisKey : yAxisKey;
        const vAxisKey = vScale.axis === "x" ? xAxisKey : yAxisKey;
        const parsed = [];
        let i, ilen, item, obj;
        for (i = start, ilen = start + count; i < ilen; ++i) {
          obj = data[i];
          item = {};
          item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i);
          parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i));
        }
        return parsed;
      }
      updateRangeFromParsed(range, scale, parsed, stack) {
        super.updateRangeFromParsed(range, scale, parsed, stack);
        const custom = parsed._custom;
        if (custom && scale === this._cachedMeta.vScale) {
          range.min = Math.min(range.min, custom.min);
          range.max = Math.max(range.max, custom.max);
        }
      }
      getMaxOverflow() {
        return 0;
      }
      getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const { iScale, vScale } = meta;
        const parsed = this.getParsed(index);
        const custom = parsed._custom;
        const value = isFloatBar(custom) ? "[" + custom.start + ", " + custom.end + "]" : "" + vScale.getLabelForValue(parsed[vScale.axis]);
        return {
          label: "" + iScale.getLabelForValue(parsed[iScale.axis]),
          value
        };
      }
      initialize() {
        this.enableOptionSharing = true;
        super.initialize();
        const meta = this._cachedMeta;
        meta.stack = this.getDataset().stack;
      }
      update(mode) {
        const meta = this._cachedMeta;
        this.updateElements(meta.data, 0, meta.data.length, mode);
      }
      updateElements(bars, start, count, mode) {
        const reset = mode === "reset";
        const { index, _cachedMeta: { vScale } } = this;
        const base2 = vScale.getBasePixel();
        const horizontal = vScale.isHorizontal();
        const ruler = this._getRuler();
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions);
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
        for (let i = start; i < start + count; i++) {
          const parsed = this.getParsed(i);
          const vpixels = reset || isNullOrUndef(parsed[vScale.axis]) ? { base: base2, head: base2 } : this._calculateBarValuePixels(i);
          const ipixels = this._calculateBarIndexPixels(i, ruler);
          const stack = (parsed._stacks || {})[vScale.axis];
          const properties = {
            horizontal,
            base: vpixels.base,
            enableBorderRadius: !stack || isFloatBar(parsed._custom) || (index === stack._top || index === stack._bottom),
            x: horizontal ? vpixels.head : ipixels.center,
            y: horizontal ? ipixels.center : vpixels.head,
            height: horizontal ? ipixels.size : Math.abs(vpixels.size),
            width: horizontal ? Math.abs(vpixels.size) : ipixels.size
          };
          if (includeOptions) {
            properties.options = sharedOptions || this.resolveDataElementOptions(i, bars[i].active ? "active" : mode);
          }
          const options2 = properties.options || bars[i].options;
          setBorderSkipped(properties, options2, stack, index);
          setInflateAmount(properties, options2, ruler.ratio);
          this.updateElement(bars[i], i, properties, mode);
        }
      }
      _getStacks(last, dataIndex) {
        const meta = this._cachedMeta;
        const iScale = meta.iScale;
        const metasets = iScale.getMatchingVisibleMetas(this._type);
        const stacked = iScale.options.stacked;
        const ilen = metasets.length;
        const stacks = [];
        let i, item;
        for (i = 0; i < ilen; ++i) {
          item = metasets[i];
          if (!item.controller.options.grouped) {
            continue;
          }
          if (typeof dataIndex !== "undefined") {
            const val = item.controller.getParsed(dataIndex)[item.controller._cachedMeta.vScale.axis];
            if (isNullOrUndef(val) || isNaN(val)) {
              continue;
            }
          }
          if (stacked === false || stacks.indexOf(item.stack) === -1 || stacked === void 0 && item.stack === void 0) {
            stacks.push(item.stack);
          }
          if (item.index === last) {
            break;
          }
        }
        if (!stacks.length) {
          stacks.push(void 0);
        }
        return stacks;
      }
      _getStackCount(index) {
        return this._getStacks(void 0, index).length;
      }
      _getStackIndex(datasetIndex, name, dataIndex) {
        const stacks = this._getStacks(datasetIndex, dataIndex);
        const index = name !== void 0 ? stacks.indexOf(name) : -1;
        return index === -1 ? stacks.length - 1 : index;
      }
      _getRuler() {
        const opts = this.options;
        const meta = this._cachedMeta;
        const iScale = meta.iScale;
        const pixels = [];
        let i, ilen;
        for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
          pixels.push(iScale.getPixelForValue(this.getParsed(i)[iScale.axis], i));
        }
        const barThickness = opts.barThickness;
        const min = barThickness || computeMinSampleSize(meta);
        return {
          min,
          pixels,
          start: iScale._startPixel,
          end: iScale._endPixel,
          stackCount: this._getStackCount(),
          scale: iScale,
          grouped: opts.grouped,
          ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
        };
      }
      _calculateBarValuePixels(index) {
        const { _cachedMeta: { vScale, _stacked }, options: { base: baseValue, minBarLength } } = this;
        const actualBase = baseValue || 0;
        const parsed = this.getParsed(index);
        const custom = parsed._custom;
        const floating = isFloatBar(custom);
        let value = parsed[vScale.axis];
        let start = 0;
        let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
        let head, size;
        if (length !== value) {
          start = length - value;
          length = value;
        }
        if (floating) {
          value = custom.barStart;
          length = custom.barEnd - custom.barStart;
          if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
            start = 0;
          }
          start += value;
        }
        const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
        let base2 = vScale.getPixelForValue(startValue);
        if (this.chart.getDataVisibility(index)) {
          head = vScale.getPixelForValue(start + length);
        } else {
          head = base2;
        }
        size = head - base2;
        if (Math.abs(size) < minBarLength) {
          size = barSign(size, vScale, actualBase) * minBarLength;
          if (value === actualBase) {
            base2 -= size / 2;
          }
          head = base2 + size;
        }
        if (base2 === vScale.getPixelForValue(actualBase)) {
          const halfGrid = sign(size) * vScale.getLineWidthForValue(actualBase) / 2;
          base2 += halfGrid;
          size -= halfGrid;
        }
        return {
          size,
          base: base2,
          head,
          center: head + size / 2
        };
      }
      _calculateBarIndexPixels(index, ruler) {
        const scale = ruler.scale;
        const options2 = this.options;
        const skipNull = options2.skipNull;
        const maxBarThickness = valueOrDefault(options2.maxBarThickness, Infinity);
        let center, size;
        if (ruler.grouped) {
          const stackCount = skipNull ? this._getStackCount(index) : ruler.stackCount;
          const range = options2.barThickness === "flex" ? computeFlexCategoryTraits(index, ruler, options2, stackCount) : computeFitCategoryTraits(index, ruler, options2, stackCount);
          const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index : void 0);
          center = range.start + range.chunk * stackIndex + range.chunk / 2;
          size = Math.min(maxBarThickness, range.chunk * range.ratio);
        } else {
          center = scale.getPixelForValue(this.getParsed(index)[scale.axis], index);
          size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
        }
        return {
          base: center - size / 2,
          head: center + size / 2,
          center,
          size
        };
      }
      draw() {
        const meta = this._cachedMeta;
        const vScale = meta.vScale;
        const rects = meta.data;
        const ilen = rects.length;
        let i = 0;
        for (; i < ilen; ++i) {
          if (this.getParsed(i)[vScale.axis] !== null) {
            rects[i].draw(this._ctx);
          }
        }
      }
    };
    BarController.id = "bar";
    BarController.defaults = {
      datasetElementType: false,
      dataElementType: "bar",
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      grouped: true,
      animations: {
        numbers: {
          type: "number",
          properties: ["x", "y", "base", "width", "height"]
        }
      }
    };
    BarController.overrides = {
      scales: {
        _index_: {
          type: "category",
          offset: true,
          grid: {
            offset: true
          }
        },
        _value_: {
          type: "linear",
          beginAtZero: true
        }
      }
    };
    BubbleController = class extends DatasetController {
      initialize() {
        this.enableOptionSharing = true;
        super.initialize();
      }
      parsePrimitiveData(meta, data, start, count) {
        const parsed = super.parsePrimitiveData(meta, data, start, count);
        for (let i = 0; i < parsed.length; i++) {
          parsed[i]._custom = this.resolveDataElementOptions(i + start).radius;
        }
        return parsed;
      }
      parseArrayData(meta, data, start, count) {
        const parsed = super.parseArrayData(meta, data, start, count);
        for (let i = 0; i < parsed.length; i++) {
          const item = data[start + i];
          parsed[i]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i + start).radius);
        }
        return parsed;
      }
      parseObjectData(meta, data, start, count) {
        const parsed = super.parseObjectData(meta, data, start, count);
        for (let i = 0; i < parsed.length; i++) {
          const item = data[start + i];
          parsed[i]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius);
        }
        return parsed;
      }
      getMaxOverflow() {
        const data = this._cachedMeta.data;
        let max = 0;
        for (let i = data.length - 1; i >= 0; --i) {
          max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
        }
        return max > 0 && max;
      }
      getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const { xScale, yScale } = meta;
        const parsed = this.getParsed(index);
        const x = xScale.getLabelForValue(parsed.x);
        const y = yScale.getLabelForValue(parsed.y);
        const r = parsed._custom;
        return {
          label: meta.label,
          value: "(" + x + ", " + y + (r ? ", " + r : "") + ")"
        };
      }
      update(mode) {
        const points = this._cachedMeta.data;
        this.updateElements(points, 0, points.length, mode);
      }
      updateElements(points, start, count, mode) {
        const reset = mode === "reset";
        const { iScale, vScale } = this._cachedMeta;
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions);
        const iAxis = iScale.axis;
        const vAxis = vScale.axis;
        for (let i = start; i < start + count; i++) {
          const point = points[i];
          const parsed = !reset && this.getParsed(i);
          const properties = {};
          const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
          const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
          properties.skip = isNaN(iPixel) || isNaN(vPixel);
          if (includeOptions) {
            properties.options = this.resolveDataElementOptions(i, point.active ? "active" : mode);
            if (reset) {
              properties.options.radius = 0;
            }
          }
          this.updateElement(point, i, properties, mode);
        }
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
      }
      resolveDataElementOptions(index, mode) {
        const parsed = this.getParsed(index);
        let values = super.resolveDataElementOptions(index, mode);
        if (values.$shared) {
          values = Object.assign({}, values, { $shared: false });
        }
        const radius = values.radius;
        if (mode !== "active") {
          values.radius = 0;
        }
        values.radius += valueOrDefault(parsed && parsed._custom, radius);
        return values;
      }
    };
    BubbleController.id = "bubble";
    BubbleController.defaults = {
      datasetElementType: false,
      dataElementType: "point",
      animations: {
        numbers: {
          type: "number",
          properties: ["x", "y", "borderWidth", "radius"]
        }
      }
    };
    BubbleController.overrides = {
      scales: {
        x: {
          type: "linear"
        },
        y: {
          type: "linear"
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title() {
              return "";
            }
          }
        }
      }
    };
    DoughnutController = class extends DatasetController {
      constructor(chart, datasetIndex) {
        super(chart, datasetIndex);
        this.enableOptionSharing = true;
        this.innerRadius = void 0;
        this.outerRadius = void 0;
        this.offsetX = void 0;
        this.offsetY = void 0;
      }
      linkScales() {
      }
      parse(start, count) {
        const data = this.getDataset().data;
        const meta = this._cachedMeta;
        if (this._parsing === false) {
          meta._parsed = data;
        } else {
          let getter = (i2) => +data[i2];
          if (isObject(data[start])) {
            const { key = "value" } = this._parsing;
            getter = (i2) => +resolveObjectKey(data[i2], key);
          }
          let i, ilen;
          for (i = start, ilen = start + count; i < ilen; ++i) {
            meta._parsed[i] = getter(i);
          }
        }
      }
      _getRotation() {
        return toRadians(this.options.rotation - 90);
      }
      _getCircumference() {
        return toRadians(this.options.circumference);
      }
      _getRotationExtents() {
        let min = TAU;
        let max = -TAU;
        for (let i = 0; i < this.chart.data.datasets.length; ++i) {
          if (this.chart.isDatasetVisible(i)) {
            const controller = this.chart.getDatasetMeta(i).controller;
            const rotation = controller._getRotation();
            const circumference = controller._getCircumference();
            min = Math.min(min, rotation);
            max = Math.max(max, rotation + circumference);
          }
        }
        return {
          rotation: min,
          circumference: max - min
        };
      }
      update(mode) {
        const chart = this.chart;
        const { chartArea } = chart;
        const meta = this._cachedMeta;
        const arcs = meta.data;
        const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
        const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
        const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
        const chartWeight = this._getRingWeight(this.index);
        const { circumference, rotation } = this._getRotationExtents();
        const { ratioX, ratioY, offsetX, offsetY } = getRatioAndOffset(rotation, circumference, cutout);
        const maxWidth = (chartArea.width - spacing) / ratioX;
        const maxHeight = (chartArea.height - spacing) / ratioY;
        const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
        const outerRadius = toDimension(this.options.radius, maxRadius);
        const innerRadius = Math.max(outerRadius * cutout, 0);
        const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
        this.offsetX = offsetX * outerRadius;
        this.offsetY = offsetY * outerRadius;
        meta.total = this.calculateTotal();
        this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
        this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
        this.updateElements(arcs, 0, arcs.length, mode);
      }
      _circumference(i, reset) {
        const opts = this.options;
        const meta = this._cachedMeta;
        const circumference = this._getCircumference();
        if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) {
          return 0;
        }
        return this.calculateCircumference(meta._parsed[i] * circumference / TAU);
      }
      updateElements(arcs, start, count, mode) {
        const reset = mode === "reset";
        const chart = this.chart;
        const chartArea = chart.chartArea;
        const opts = chart.options;
        const animationOpts = opts.animation;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        const animateScale = reset && animationOpts.animateScale;
        const innerRadius = animateScale ? 0 : this.innerRadius;
        const outerRadius = animateScale ? 0 : this.outerRadius;
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions);
        let startAngle = this._getRotation();
        let i;
        for (i = 0; i < start; ++i) {
          startAngle += this._circumference(i, reset);
        }
        for (i = start; i < start + count; ++i) {
          const circumference = this._circumference(i, reset);
          const arc = arcs[i];
          const properties = {
            x: centerX + this.offsetX,
            y: centerY + this.offsetY,
            startAngle,
            endAngle: startAngle + circumference,
            circumference,
            outerRadius,
            innerRadius
          };
          if (includeOptions) {
            properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? "active" : mode);
          }
          startAngle += circumference;
          this.updateElement(arc, i, properties, mode);
        }
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
      }
      calculateTotal() {
        const meta = this._cachedMeta;
        const metaData = meta.data;
        let total = 0;
        let i;
        for (i = 0; i < metaData.length; i++) {
          const value = meta._parsed[i];
          if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) {
            total += Math.abs(value);
          }
        }
        return total;
      }
      calculateCircumference(value) {
        const total = this._cachedMeta.total;
        if (total > 0 && !isNaN(value)) {
          return TAU * (Math.abs(value) / total);
        }
        return 0;
      }
      getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const chart = this.chart;
        const labels = chart.data.labels || [];
        const value = formatNumber(meta._parsed[index], chart.options.locale);
        return {
          label: labels[index] || "",
          value
        };
      }
      getMaxBorderWidth(arcs) {
        let max = 0;
        const chart = this.chart;
        let i, ilen, meta, controller, options2;
        if (!arcs) {
          for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
            if (chart.isDatasetVisible(i)) {
              meta = chart.getDatasetMeta(i);
              arcs = meta.data;
              controller = meta.controller;
              break;
            }
          }
        }
        if (!arcs) {
          return 0;
        }
        for (i = 0, ilen = arcs.length; i < ilen; ++i) {
          options2 = controller.resolveDataElementOptions(i);
          if (options2.borderAlign !== "inner") {
            max = Math.max(max, options2.borderWidth || 0, options2.hoverBorderWidth || 0);
          }
        }
        return max;
      }
      getMaxOffset(arcs) {
        let max = 0;
        for (let i = 0, ilen = arcs.length; i < ilen; ++i) {
          const options2 = this.resolveDataElementOptions(i);
          max = Math.max(max, options2.offset || 0, options2.hoverOffset || 0);
        }
        return max;
      }
      _getRingWeightOffset(datasetIndex) {
        let ringWeightOffset = 0;
        for (let i = 0; i < datasetIndex; ++i) {
          if (this.chart.isDatasetVisible(i)) {
            ringWeightOffset += this._getRingWeight(i);
          }
        }
        return ringWeightOffset;
      }
      _getRingWeight(datasetIndex) {
        return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
      }
      _getVisibleDatasetWeightTotal() {
        return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
      }
    };
    DoughnutController.id = "doughnut";
    DoughnutController.defaults = {
      datasetElementType: false,
      dataElementType: "arc",
      animation: {
        animateRotate: true,
        animateScale: false
      },
      animations: {
        numbers: {
          type: "number",
          properties: ["circumference", "endAngle", "innerRadius", "outerRadius", "startAngle", "x", "y", "offset", "borderWidth", "spacing"]
        }
      },
      cutout: "50%",
      rotation: 0,
      circumference: 360,
      radius: "100%",
      spacing: 0,
      indexAxis: "r"
    };
    DoughnutController.descriptors = {
      _scriptable: (name) => name !== "spacing",
      _indexable: (name) => name !== "spacing"
    };
    DoughnutController.overrides = {
      aspectRatio: 1,
      plugins: {
        legend: {
          labels: {
            generateLabels(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const { labels: { pointStyle } } = chart.legend.options;
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  return {
                    text: label,
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    pointStyle,
                    hidden: !chart.getDataVisibility(i),
                    index: i
                  };
                });
              }
              return [];
            }
          },
          onClick(e, legendItem, legend) {
            legend.chart.toggleDataVisibility(legendItem.index);
            legend.chart.update();
          }
        },
        tooltip: {
          callbacks: {
            title() {
              return "";
            },
            label(tooltipItem) {
              let dataLabel = tooltipItem.label;
              const value = ": " + tooltipItem.formattedValue;
              if (isArray(dataLabel)) {
                dataLabel = dataLabel.slice();
                dataLabel[0] += value;
              } else {
                dataLabel += value;
              }
              return dataLabel;
            }
          }
        }
      }
    };
    LineController = class extends DatasetController {
      initialize() {
        this.enableOptionSharing = true;
        super.initialize();
      }
      update(mode) {
        const meta = this._cachedMeta;
        const { dataset: line, data: points = [], _dataset } = meta;
        const animationsDisabled = this.chart._animationsDisabled;
        let { start, count } = getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
        this._drawStart = start;
        this._drawCount = count;
        if (scaleRangesChanged(meta)) {
          start = 0;
          count = points.length;
        }
        line._chart = this.chart;
        line._datasetIndex = this.index;
        line._decimated = !!_dataset._decimated;
        line.points = points;
        const options2 = this.resolveDatasetElementOptions(mode);
        if (!this.options.showLine) {
          options2.borderWidth = 0;
        }
        options2.segment = this.options.segment;
        this.updateElement(line, void 0, {
          animated: !animationsDisabled,
          options: options2
        }, mode);
        this.updateElements(points, start, count, mode);
      }
      updateElements(points, start, count, mode) {
        const reset = mode === "reset";
        const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions);
        const iAxis = iScale.axis;
        const vAxis = vScale.axis;
        const { spanGaps, segment } = this.options;
        const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
        const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
        let prevParsed = start > 0 && this.getParsed(start - 1);
        for (let i = start; i < start + count; ++i) {
          const point = points[i];
          const parsed = this.getParsed(i);
          const properties = directUpdate ? point : {};
          const nullData = isNullOrUndef(parsed[vAxis]);
          const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
          const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
          properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
          properties.stop = i > 0 && parsed[iAxis] - prevParsed[iAxis] > maxGapLength;
          if (segment) {
            properties.parsed = parsed;
            properties.raw = _dataset.data[i];
          }
          if (includeOptions) {
            properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
          }
          if (!directUpdate) {
            this.updateElement(point, i, properties, mode);
          }
          prevParsed = parsed;
        }
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
      }
      getMaxOverflow() {
        const meta = this._cachedMeta;
        const dataset = meta.dataset;
        const border = dataset.options && dataset.options.borderWidth || 0;
        const data = meta.data || [];
        if (!data.length) {
          return border;
        }
        const firstPoint = data[0].size(this.resolveDataElementOptions(0));
        const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
        return Math.max(border, firstPoint, lastPoint) / 2;
      }
      draw() {
        const meta = this._cachedMeta;
        meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
        super.draw();
      }
    };
    LineController.id = "line";
    LineController.defaults = {
      datasetElementType: "line",
      dataElementType: "point",
      showLine: true,
      spanGaps: false
    };
    LineController.overrides = {
      scales: {
        _index_: {
          type: "category"
        },
        _value_: {
          type: "linear"
        }
      }
    };
    PolarAreaController = class extends DatasetController {
      constructor(chart, datasetIndex) {
        super(chart, datasetIndex);
        this.innerRadius = void 0;
        this.outerRadius = void 0;
      }
      getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const chart = this.chart;
        const labels = chart.data.labels || [];
        const value = formatNumber(meta._parsed[index].r, chart.options.locale);
        return {
          label: labels[index] || "",
          value
        };
      }
      update(mode) {
        const arcs = this._cachedMeta.data;
        this._updateRadius();
        this.updateElements(arcs, 0, arcs.length, mode);
      }
      _updateRadius() {
        const chart = this.chart;
        const chartArea = chart.chartArea;
        const opts = chart.options;
        const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        const outerRadius = Math.max(minSize / 2, 0);
        const innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
        const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
        this.outerRadius = outerRadius - radiusLength * this.index;
        this.innerRadius = this.outerRadius - radiusLength;
      }
      updateElements(arcs, start, count, mode) {
        const reset = mode === "reset";
        const chart = this.chart;
        const dataset = this.getDataset();
        const opts = chart.options;
        const animationOpts = opts.animation;
        const scale = this._cachedMeta.rScale;
        const centerX = scale.xCenter;
        const centerY = scale.yCenter;
        const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
        let angle = datasetStartAngle;
        let i;
        const defaultAngle = 360 / this.countVisibleElements();
        for (i = 0; i < start; ++i) {
          angle += this._computeAngle(i, mode, defaultAngle);
        }
        for (i = start; i < start + count; i++) {
          const arc = arcs[i];
          let startAngle = angle;
          let endAngle = angle + this._computeAngle(i, mode, defaultAngle);
          let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(dataset.data[i]) : 0;
          angle = endAngle;
          if (reset) {
            if (animationOpts.animateScale) {
              outerRadius = 0;
            }
            if (animationOpts.animateRotate) {
              startAngle = endAngle = datasetStartAngle;
            }
          }
          const properties = {
            x: centerX,
            y: centerY,
            innerRadius: 0,
            outerRadius,
            startAngle,
            endAngle,
            options: this.resolveDataElementOptions(i, arc.active ? "active" : mode)
          };
          this.updateElement(arc, i, properties, mode);
        }
      }
      countVisibleElements() {
        const dataset = this.getDataset();
        const meta = this._cachedMeta;
        let count = 0;
        meta.data.forEach((element, index) => {
          if (!isNaN(dataset.data[index]) && this.chart.getDataVisibility(index)) {
            count++;
          }
        });
        return count;
      }
      _computeAngle(index, mode, defaultAngle) {
        return this.chart.getDataVisibility(index) ? toRadians(this.resolveDataElementOptions(index, mode).angle || defaultAngle) : 0;
      }
    };
    PolarAreaController.id = "polarArea";
    PolarAreaController.defaults = {
      dataElementType: "arc",
      animation: {
        animateRotate: true,
        animateScale: true
      },
      animations: {
        numbers: {
          type: "number",
          properties: ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"]
        }
      },
      indexAxis: "r",
      startAngle: 0
    };
    PolarAreaController.overrides = {
      aspectRatio: 1,
      plugins: {
        legend: {
          labels: {
            generateLabels(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const { labels: { pointStyle } } = chart.legend.options;
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  return {
                    text: label,
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    pointStyle,
                    hidden: !chart.getDataVisibility(i),
                    index: i
                  };
                });
              }
              return [];
            }
          },
          onClick(e, legendItem, legend) {
            legend.chart.toggleDataVisibility(legendItem.index);
            legend.chart.update();
          }
        },
        tooltip: {
          callbacks: {
            title() {
              return "";
            },
            label(context) {
              return context.chart.data.labels[context.dataIndex] + ": " + context.formattedValue;
            }
          }
        }
      },
      scales: {
        r: {
          type: "radialLinear",
          angleLines: {
            display: false
          },
          beginAtZero: true,
          grid: {
            circular: true
          },
          pointLabels: {
            display: false
          },
          startAngle: 0
        }
      }
    };
    PieController = class extends DoughnutController {
    };
    PieController.id = "pie";
    PieController.defaults = {
      cutout: 0,
      rotation: 0,
      circumference: 360,
      radius: "100%"
    };
    RadarController = class extends DatasetController {
      getLabelAndValue(index) {
        const vScale = this._cachedMeta.vScale;
        const parsed = this.getParsed(index);
        return {
          label: vScale.getLabels()[index],
          value: "" + vScale.getLabelForValue(parsed[vScale.axis])
        };
      }
      update(mode) {
        const meta = this._cachedMeta;
        const line = meta.dataset;
        const points = meta.data || [];
        const labels = meta.iScale.getLabels();
        line.points = points;
        if (mode !== "resize") {
          const options2 = this.resolveDatasetElementOptions(mode);
          if (!this.options.showLine) {
            options2.borderWidth = 0;
          }
          const properties = {
            _loop: true,
            _fullLoop: labels.length === points.length,
            options: options2
          };
          this.updateElement(line, void 0, properties, mode);
        }
        this.updateElements(points, 0, points.length, mode);
      }
      updateElements(points, start, count, mode) {
        const dataset = this.getDataset();
        const scale = this._cachedMeta.rScale;
        const reset = mode === "reset";
        for (let i = start; i < start + count; i++) {
          const point = points[i];
          const options2 = this.resolveDataElementOptions(i, point.active ? "active" : mode);
          const pointPosition = scale.getPointPositionForValue(i, dataset.data[i]);
          const x = reset ? scale.xCenter : pointPosition.x;
          const y = reset ? scale.yCenter : pointPosition.y;
          const properties = {
            x,
            y,
            angle: pointPosition.angle,
            skip: isNaN(x) || isNaN(y),
            options: options2
          };
          this.updateElement(point, i, properties, mode);
        }
      }
    };
    RadarController.id = "radar";
    RadarController.defaults = {
      datasetElementType: "line",
      dataElementType: "point",
      indexAxis: "r",
      showLine: true,
      elements: {
        line: {
          fill: "start"
        }
      }
    };
    RadarController.overrides = {
      aspectRatio: 1,
      scales: {
        r: {
          type: "radialLinear"
        }
      }
    };
    ScatterController = class extends LineController {
    };
    ScatterController.id = "scatter";
    ScatterController.defaults = {
      showLine: false,
      fill: false
    };
    ScatterController.overrides = {
      interaction: {
        mode: "point"
      },
      plugins: {
        tooltip: {
          callbacks: {
            title() {
              return "";
            },
            label(item) {
              return "(" + item.label + ", " + item.formattedValue + ")";
            }
          }
        }
      },
      scales: {
        x: {
          type: "linear"
        },
        y: {
          type: "linear"
        }
      }
    };
    controllers = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      BarController,
      BubbleController,
      DoughnutController,
      LineController,
      PolarAreaController,
      PieController,
      RadarController,
      ScatterController
    });
    DateAdapter = class {
      constructor(options2) {
        this.options = options2 || {};
      }
      formats() {
        return abstract();
      }
      parse(value, format2) {
        return abstract();
      }
      format(timestamp, format2) {
        return abstract();
      }
      add(timestamp, amount, unit) {
        return abstract();
      }
      diff(a, b, unit) {
        return abstract();
      }
      startOf(timestamp, unit, weekday) {
        return abstract();
      }
      endOf(timestamp, unit) {
        return abstract();
      }
    };
    DateAdapter.override = function(members) {
      Object.assign(DateAdapter.prototype, members);
    };
    adapters = {
      _date: DateAdapter
    };
    Interaction = {
      modes: {
        index(chart, e, options2, useFinalPosition) {
          const position = getRelativePosition(e, chart);
          const axis = options2.axis || "x";
          const items = options2.intersect ? getIntersectItems(chart, position, axis, useFinalPosition) : getNearestItems(chart, position, axis, false, useFinalPosition);
          const elements2 = [];
          if (!items.length) {
            return [];
          }
          chart.getSortedVisibleDatasetMetas().forEach((meta) => {
            const index = items[0].index;
            const element = meta.data[index];
            if (element && !element.skip) {
              elements2.push({ element, datasetIndex: meta.index, index });
            }
          });
          return elements2;
        },
        dataset(chart, e, options2, useFinalPosition) {
          const position = getRelativePosition(e, chart);
          const axis = options2.axis || "xy";
          let items = options2.intersect ? getIntersectItems(chart, position, axis, useFinalPosition) : getNearestItems(chart, position, axis, false, useFinalPosition);
          if (items.length > 0) {
            const datasetIndex = items[0].datasetIndex;
            const data = chart.getDatasetMeta(datasetIndex).data;
            items = [];
            for (let i = 0; i < data.length; ++i) {
              items.push({ element: data[i], datasetIndex, index: i });
            }
          }
          return items;
        },
        point(chart, e, options2, useFinalPosition) {
          const position = getRelativePosition(e, chart);
          const axis = options2.axis || "xy";
          return getIntersectItems(chart, position, axis, useFinalPosition);
        },
        nearest(chart, e, options2, useFinalPosition) {
          const position = getRelativePosition(e, chart);
          const axis = options2.axis || "xy";
          return getNearestItems(chart, position, axis, options2.intersect, useFinalPosition);
        },
        x(chart, e, options2, useFinalPosition) {
          return getAxisItems(chart, e, { axis: "x", intersect: options2.intersect }, useFinalPosition);
        },
        y(chart, e, options2, useFinalPosition) {
          return getAxisItems(chart, e, { axis: "y", intersect: options2.intersect }, useFinalPosition);
        }
      }
    };
    STATIC_POSITIONS = ["left", "top", "right", "bottom"];
    defaults.set("layout", {
      autoPadding: true,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
    layouts = {
      addBox(chart, item) {
        if (!chart.boxes) {
          chart.boxes = [];
        }
        item.fullSize = item.fullSize || false;
        item.position = item.position || "top";
        item.weight = item.weight || 0;
        item._layers = item._layers || function() {
          return [{
            z: 0,
            draw(chartArea) {
              item.draw(chartArea);
            }
          }];
        };
        chart.boxes.push(item);
      },
      removeBox(chart, layoutItem) {
        const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
        if (index !== -1) {
          chart.boxes.splice(index, 1);
        }
      },
      configure(chart, item, options2) {
        item.fullSize = options2.fullSize;
        item.position = options2.position;
        item.weight = options2.weight;
      },
      update(chart, width, height, minPadding) {
        if (!chart) {
          return;
        }
        const padding = toPadding(chart.options.layout.padding);
        const availableWidth = Math.max(width - padding.width, 0);
        const availableHeight = Math.max(height - padding.height, 0);
        const boxes = buildLayoutBoxes(chart.boxes);
        const verticalBoxes = boxes.vertical;
        const horizontalBoxes = boxes.horizontal;
        each2(chart.boxes, (box) => {
          if (typeof box.beforeLayout === "function") {
            box.beforeLayout();
          }
        });
        const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) => wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
        const params = Object.freeze({
          outerWidth: width,
          outerHeight: height,
          padding,
          availableWidth,
          availableHeight,
          vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
          hBoxMaxHeight: availableHeight / 2
        });
        const maxPadding = Object.assign({}, padding);
        updateMaxPadding(maxPadding, toPadding(minPadding));
        const chartArea = Object.assign({
          maxPadding,
          w: availableWidth,
          h: availableHeight,
          x: padding.left,
          y: padding.top
        }, padding);
        const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
        fitBoxes(boxes.fullSize, chartArea, params, stacks);
        fitBoxes(verticalBoxes, chartArea, params, stacks);
        if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
          fitBoxes(verticalBoxes, chartArea, params, stacks);
        }
        handleMaxPadding(chartArea);
        placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
        chartArea.x += chartArea.w;
        chartArea.y += chartArea.h;
        placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
        chart.chartArea = {
          left: chartArea.left,
          top: chartArea.top,
          right: chartArea.left + chartArea.w,
          bottom: chartArea.top + chartArea.h,
          height: chartArea.h,
          width: chartArea.w
        };
        each2(boxes.chartArea, (layout) => {
          const box = layout.box;
          Object.assign(box, chart.chartArea);
          box.update(chartArea.w, chartArea.h, { left: 0, top: 0, right: 0, bottom: 0 });
        });
      }
    };
    BasePlatform = class {
      acquireContext(canvas, aspectRatio) {
      }
      releaseContext(context) {
        return false;
      }
      addEventListener(chart, type, listener) {
      }
      removeEventListener(chart, type, listener) {
      }
      getDevicePixelRatio() {
        return 1;
      }
      getMaximumSize(element, width, height, aspectRatio) {
        width = Math.max(0, width || element.width);
        height = height || element.height;
        return {
          width,
          height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
        };
      }
      isAttached(canvas) {
        return true;
      }
      updateConfig(config) {
      }
    };
    BasicPlatform = class extends BasePlatform {
      acquireContext(item) {
        return item && item.getContext && item.getContext("2d") || null;
      }
      updateConfig(config) {
        config.options.animation = false;
      }
    };
    EXPANDO_KEY = "$chartjs";
    EVENT_TYPES = {
      touchstart: "mousedown",
      touchmove: "mousemove",
      touchend: "mouseup",
      pointerenter: "mouseenter",
      pointerdown: "mousedown",
      pointermove: "mousemove",
      pointerup: "mouseup",
      pointerleave: "mouseout",
      pointerout: "mouseout"
    };
    isNullOrEmpty = (value) => value === null || value === "";
    eventListenerOptions = supportsEventListenerOptions ? { passive: true } : false;
    drpListeningCharts = new Map();
    oldDevicePixelRatio = 0;
    DomPlatform = class extends BasePlatform {
      acquireContext(canvas, aspectRatio) {
        const context = canvas && canvas.getContext && canvas.getContext("2d");
        if (context && context.canvas === canvas) {
          initCanvas(canvas, aspectRatio);
          return context;
        }
        return null;
      }
      releaseContext(context) {
        const canvas = context.canvas;
        if (!canvas[EXPANDO_KEY]) {
          return false;
        }
        const initial = canvas[EXPANDO_KEY].initial;
        ["height", "width"].forEach((prop) => {
          const value = initial[prop];
          if (isNullOrUndef(value)) {
            canvas.removeAttribute(prop);
          } else {
            canvas.setAttribute(prop, value);
          }
        });
        const style = initial.style || {};
        Object.keys(style).forEach((key) => {
          canvas.style[key] = style[key];
        });
        canvas.width = canvas.width;
        delete canvas[EXPANDO_KEY];
        return true;
      }
      addEventListener(chart, type, listener) {
        this.removeEventListener(chart, type);
        const proxies = chart.$proxies || (chart.$proxies = {});
        const handlers = {
          attach: createAttachObserver,
          detach: createDetachObserver,
          resize: createResizeObserver
        };
        const handler = handlers[type] || createProxyAndListen;
        proxies[type] = handler(chart, type, listener);
      }
      removeEventListener(chart, type) {
        const proxies = chart.$proxies || (chart.$proxies = {});
        const proxy = proxies[type];
        if (!proxy) {
          return;
        }
        const handlers = {
          attach: releaseObserver,
          detach: releaseObserver,
          resize: releaseObserver
        };
        const handler = handlers[type] || removeListener;
        handler(chart, type, proxy);
        proxies[type] = void 0;
      }
      getDevicePixelRatio() {
        return window.devicePixelRatio;
      }
      getMaximumSize(canvas, width, height, aspectRatio) {
        return getMaximumSize(canvas, width, height, aspectRatio);
      }
      isAttached(canvas) {
        const container = _getParentNode(canvas);
        return !!(container && container.isConnected);
      }
    };
    Element = class {
      constructor() {
        this.x = void 0;
        this.y = void 0;
        this.active = false;
        this.options = void 0;
        this.$animations = void 0;
      }
      tooltipPosition(useFinalPosition) {
        const { x, y } = this.getProps(["x", "y"], useFinalPosition);
        return { x, y };
      }
      hasValue() {
        return isNumber(this.x) && isNumber(this.y);
      }
      getProps(props, final) {
        const anims = this.$animations;
        if (!final || !anims) {
          return this;
        }
        const ret = {};
        props.forEach((prop) => {
          ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
        });
        return ret;
      }
    };
    Element.defaults = {};
    Element.defaultRoutes = void 0;
    formatters = {
      values(value) {
        return isArray(value) ? value : "" + value;
      },
      numeric(tickValue, index, ticks) {
        if (tickValue === 0) {
          return "0";
        }
        const locale = this.chart.options.locale;
        let notation;
        let delta = tickValue;
        if (ticks.length > 1) {
          const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
          if (maxTick < 1e-4 || maxTick > 1e15) {
            notation = "scientific";
          }
          delta = calculateDelta(tickValue, ticks);
        }
        const logDelta = log10(Math.abs(delta));
        const numDecimal = Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
        const options2 = { notation, minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal };
        Object.assign(options2, this.options.ticks.format);
        return formatNumber(tickValue, locale, options2);
      },
      logarithmic(tickValue, index, ticks) {
        if (tickValue === 0) {
          return "0";
        }
        const remain = tickValue / Math.pow(10, Math.floor(log10(tickValue)));
        if (remain === 1 || remain === 2 || remain === 5) {
          return formatters.numeric.call(this, tickValue, index, ticks);
        }
        return "";
      }
    };
    Ticks = { formatters };
    defaults.set("scale", {
      display: true,
      offset: false,
      reverse: false,
      beginAtZero: false,
      bounds: "ticks",
      grace: 0,
      grid: {
        display: true,
        lineWidth: 1,
        drawBorder: true,
        drawOnChartArea: true,
        drawTicks: true,
        tickLength: 8,
        tickWidth: (_ctx, options2) => options2.lineWidth,
        tickColor: (_ctx, options2) => options2.color,
        offset: false,
        borderDash: [],
        borderDashOffset: 0,
        borderWidth: 1
      },
      title: {
        display: false,
        text: "",
        padding: {
          top: 4,
          bottom: 4
        }
      },
      ticks: {
        minRotation: 0,
        maxRotation: 50,
        mirror: false,
        textStrokeWidth: 0,
        textStrokeColor: "",
        padding: 3,
        display: true,
        autoSkip: true,
        autoSkipPadding: 3,
        labelOffset: 0,
        callback: Ticks.formatters.values,
        minor: {},
        major: {},
        align: "center",
        crossAlign: "near",
        showLabelBackdrop: false,
        backdropColor: "rgba(255, 255, 255, 0.75)",
        backdropPadding: 2
      }
    });
    defaults.route("scale.ticks", "color", "", "color");
    defaults.route("scale.grid", "color", "", "borderColor");
    defaults.route("scale.grid", "borderColor", "", "borderColor");
    defaults.route("scale.title", "color", "", "color");
    defaults.describe("scale", {
      _fallback: false,
      _scriptable: (name) => !name.startsWith("before") && !name.startsWith("after") && name !== "callback" && name !== "parser",
      _indexable: (name) => name !== "borderDash" && name !== "tickBorderDash"
    });
    defaults.describe("scales", {
      _fallback: "scale"
    });
    defaults.describe("scale.ticks", {
      _scriptable: (name) => name !== "backdropPadding" && name !== "callback",
      _indexable: (name) => name !== "backdropPadding"
    });
    reverseAlign = (align) => align === "left" ? "right" : align === "right" ? "left" : align;
    offsetFromEdge = (scale, edge, offset) => edge === "top" || edge === "left" ? scale[edge] + offset : scale[edge] - offset;
    Scale = class extends Element {
      constructor(cfg) {
        super();
        this.id = cfg.id;
        this.type = cfg.type;
        this.options = void 0;
        this.ctx = cfg.ctx;
        this.chart = cfg.chart;
        this.top = void 0;
        this.bottom = void 0;
        this.left = void 0;
        this.right = void 0;
        this.width = void 0;
        this.height = void 0;
        this._margins = {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        };
        this.maxWidth = void 0;
        this.maxHeight = void 0;
        this.paddingTop = void 0;
        this.paddingBottom = void 0;
        this.paddingLeft = void 0;
        this.paddingRight = void 0;
        this.axis = void 0;
        this.labelRotation = void 0;
        this.min = void 0;
        this.max = void 0;
        this._range = void 0;
        this.ticks = [];
        this._gridLineItems = null;
        this._labelItems = null;
        this._labelSizes = null;
        this._length = 0;
        this._maxLength = 0;
        this._longestTextCache = {};
        this._startPixel = void 0;
        this._endPixel = void 0;
        this._reversePixels = false;
        this._userMax = void 0;
        this._userMin = void 0;
        this._suggestedMax = void 0;
        this._suggestedMin = void 0;
        this._ticksLength = 0;
        this._borderValue = 0;
        this._cache = {};
        this._dataLimitsCached = false;
        this.$context = void 0;
      }
      init(options2) {
        this.options = options2.setContext(this.getContext());
        this.axis = options2.axis;
        this._userMin = this.parse(options2.min);
        this._userMax = this.parse(options2.max);
        this._suggestedMin = this.parse(options2.suggestedMin);
        this._suggestedMax = this.parse(options2.suggestedMax);
      }
      parse(raw, index) {
        return raw;
      }
      getUserBounds() {
        let { _userMin, _userMax, _suggestedMin, _suggestedMax } = this;
        _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
        _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
        _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
        _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
        return {
          min: finiteOrDefault(_userMin, _suggestedMin),
          max: finiteOrDefault(_userMax, _suggestedMax),
          minDefined: isNumberFinite(_userMin),
          maxDefined: isNumberFinite(_userMax)
        };
      }
      getMinMax(canStack) {
        let { min, max, minDefined, maxDefined } = this.getUserBounds();
        let range;
        if (minDefined && maxDefined) {
          return { min, max };
        }
        const metas = this.getMatchingVisibleMetas();
        for (let i = 0, ilen = metas.length; i < ilen; ++i) {
          range = metas[i].controller.getMinMax(this, canStack);
          if (!minDefined) {
            min = Math.min(min, range.min);
          }
          if (!maxDefined) {
            max = Math.max(max, range.max);
          }
        }
        min = maxDefined && min > max ? max : min;
        max = minDefined && min > max ? min : max;
        return {
          min: finiteOrDefault(min, finiteOrDefault(max, min)),
          max: finiteOrDefault(max, finiteOrDefault(min, max))
        };
      }
      getPadding() {
        return {
          left: this.paddingLeft || 0,
          top: this.paddingTop || 0,
          right: this.paddingRight || 0,
          bottom: this.paddingBottom || 0
        };
      }
      getTicks() {
        return this.ticks;
      }
      getLabels() {
        const data = this.chart.data;
        return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
      }
      beforeLayout() {
        this._cache = {};
        this._dataLimitsCached = false;
      }
      beforeUpdate() {
        callback(this.options.beforeUpdate, [this]);
      }
      update(maxWidth, maxHeight, margins) {
        const { beginAtZero, grace, ticks: tickOpts } = this.options;
        const sampleSize = tickOpts.sampleSize;
        this.beforeUpdate();
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this._margins = margins = Object.assign({
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }, margins);
        this.ticks = null;
        this._labelSizes = null;
        this._gridLineItems = null;
        this._labelItems = null;
        this.beforeSetDimensions();
        this.setDimensions();
        this.afterSetDimensions();
        this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
        if (!this._dataLimitsCached) {
          this.beforeDataLimits();
          this.determineDataLimits();
          this.afterDataLimits();
          this._range = _addGrace(this, grace, beginAtZero);
          this._dataLimitsCached = true;
        }
        this.beforeBuildTicks();
        this.ticks = this.buildTicks() || [];
        this.afterBuildTicks();
        const samplingEnabled = sampleSize < this.ticks.length;
        this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
        this.configure();
        this.beforeCalculateLabelRotation();
        this.calculateLabelRotation();
        this.afterCalculateLabelRotation();
        if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === "auto")) {
          this.ticks = autoSkip(this, this.ticks);
          this._labelSizes = null;
        }
        if (samplingEnabled) {
          this._convertTicksToLabels(this.ticks);
        }
        this.beforeFit();
        this.fit();
        this.afterFit();
        this.afterUpdate();
      }
      configure() {
        let reversePixels = this.options.reverse;
        let startPixel, endPixel;
        if (this.isHorizontal()) {
          startPixel = this.left;
          endPixel = this.right;
        } else {
          startPixel = this.top;
          endPixel = this.bottom;
          reversePixels = !reversePixels;
        }
        this._startPixel = startPixel;
        this._endPixel = endPixel;
        this._reversePixels = reversePixels;
        this._length = endPixel - startPixel;
        this._alignToPixels = this.options.alignToPixels;
      }
      afterUpdate() {
        callback(this.options.afterUpdate, [this]);
      }
      beforeSetDimensions() {
        callback(this.options.beforeSetDimensions, [this]);
      }
      setDimensions() {
        if (this.isHorizontal()) {
          this.width = this.maxWidth;
          this.left = 0;
          this.right = this.width;
        } else {
          this.height = this.maxHeight;
          this.top = 0;
          this.bottom = this.height;
        }
        this.paddingLeft = 0;
        this.paddingTop = 0;
        this.paddingRight = 0;
        this.paddingBottom = 0;
      }
      afterSetDimensions() {
        callback(this.options.afterSetDimensions, [this]);
      }
      _callHooks(name) {
        this.chart.notifyPlugins(name, this.getContext());
        callback(this.options[name], [this]);
      }
      beforeDataLimits() {
        this._callHooks("beforeDataLimits");
      }
      determineDataLimits() {
      }
      afterDataLimits() {
        this._callHooks("afterDataLimits");
      }
      beforeBuildTicks() {
        this._callHooks("beforeBuildTicks");
      }
      buildTicks() {
        return [];
      }
      afterBuildTicks() {
        this._callHooks("afterBuildTicks");
      }
      beforeTickToLabelConversion() {
        callback(this.options.beforeTickToLabelConversion, [this]);
      }
      generateTickLabels(ticks) {
        const tickOpts = this.options.ticks;
        let i, ilen, tick;
        for (i = 0, ilen = ticks.length; i < ilen; i++) {
          tick = ticks[i];
          tick.label = callback(tickOpts.callback, [tick.value, i, ticks], this);
        }
      }
      afterTickToLabelConversion() {
        callback(this.options.afterTickToLabelConversion, [this]);
      }
      beforeCalculateLabelRotation() {
        callback(this.options.beforeCalculateLabelRotation, [this]);
      }
      calculateLabelRotation() {
        const options2 = this.options;
        const tickOpts = options2.ticks;
        const numTicks = this.ticks.length;
        const minRotation = tickOpts.minRotation || 0;
        const maxRotation = tickOpts.maxRotation;
        let labelRotation = minRotation;
        let tickWidth, maxHeight, maxLabelDiagonal;
        if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
          this.labelRotation = minRotation;
          return;
        }
        const labelSizes = this._getLabelSizes();
        const maxLabelWidth = labelSizes.widest.width;
        const maxLabelHeight = labelSizes.highest.height;
        const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
        tickWidth = options2.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
        if (maxLabelWidth + 6 > tickWidth) {
          tickWidth = maxWidth / (numTicks - (options2.offset ? 0.5 : 1));
          maxHeight = this.maxHeight - getTickMarkLength(options2.grid) - tickOpts.padding - getTitleHeight(options2.title, this.chart.options.font);
          maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
          labelRotation = toDegrees(Math.min(Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))));
          labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
        }
        this.labelRotation = labelRotation;
      }
      afterCalculateLabelRotation() {
        callback(this.options.afterCalculateLabelRotation, [this]);
      }
      beforeFit() {
        callback(this.options.beforeFit, [this]);
      }
      fit() {
        const minSize = {
          width: 0,
          height: 0
        };
        const { chart, options: { ticks: tickOpts, title: titleOpts, grid: gridOpts } } = this;
        const display = this._isVisible();
        const isHorizontal = this.isHorizontal();
        if (display) {
          const titleHeight = getTitleHeight(titleOpts, chart.options.font);
          if (isHorizontal) {
            minSize.width = this.maxWidth;
            minSize.height = getTickMarkLength(gridOpts) + titleHeight;
          } else {
            minSize.height = this.maxHeight;
            minSize.width = getTickMarkLength(gridOpts) + titleHeight;
          }
          if (tickOpts.display && this.ticks.length) {
            const { first, last, widest, highest } = this._getLabelSizes();
            const tickPadding = tickOpts.padding * 2;
            const angleRadians = toRadians(this.labelRotation);
            const cos = Math.cos(angleRadians);
            const sin = Math.sin(angleRadians);
            if (isHorizontal) {
              const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
              minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
            } else {
              const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
              minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
            }
            this._calculatePadding(first, last, sin, cos);
          }
        }
        this._handleMargins();
        if (isHorizontal) {
          this.width = this._length = chart.width - this._margins.left - this._margins.right;
          this.height = minSize.height;
        } else {
          this.width = minSize.width;
          this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
        }
      }
      _calculatePadding(first, last, sin, cos) {
        const { ticks: { align, padding }, position } = this.options;
        const isRotated = this.labelRotation !== 0;
        const labelsBelowTicks = position !== "top" && this.axis === "x";
        if (this.isHorizontal()) {
          const offsetLeft = this.getPixelForTick(0) - this.left;
          const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
          let paddingLeft = 0;
          let paddingRight = 0;
          if (isRotated) {
            if (labelsBelowTicks) {
              paddingLeft = cos * first.width;
              paddingRight = sin * last.height;
            } else {
              paddingLeft = sin * first.height;
              paddingRight = cos * last.width;
            }
          } else if (align === "start") {
            paddingRight = last.width;
          } else if (align === "end") {
            paddingLeft = first.width;
          } else {
            paddingLeft = first.width / 2;
            paddingRight = last.width / 2;
          }
          this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
          this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
        } else {
          let paddingTop = last.height / 2;
          let paddingBottom = first.height / 2;
          if (align === "start") {
            paddingTop = 0;
            paddingBottom = first.height;
          } else if (align === "end") {
            paddingTop = last.height;
            paddingBottom = 0;
          }
          this.paddingTop = paddingTop + padding;
          this.paddingBottom = paddingBottom + padding;
        }
      }
      _handleMargins() {
        if (this._margins) {
          this._margins.left = Math.max(this.paddingLeft, this._margins.left);
          this._margins.top = Math.max(this.paddingTop, this._margins.top);
          this._margins.right = Math.max(this.paddingRight, this._margins.right);
          this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
        }
      }
      afterFit() {
        callback(this.options.afterFit, [this]);
      }
      isHorizontal() {
        const { axis, position } = this.options;
        return position === "top" || position === "bottom" || axis === "x";
      }
      isFullSize() {
        return this.options.fullSize;
      }
      _convertTicksToLabels(ticks) {
        this.beforeTickToLabelConversion();
        this.generateTickLabels(ticks);
        let i, ilen;
        for (i = 0, ilen = ticks.length; i < ilen; i++) {
          if (isNullOrUndef(ticks[i].label)) {
            ticks.splice(i, 1);
            ilen--;
            i--;
          }
        }
        this.afterTickToLabelConversion();
      }
      _getLabelSizes() {
        let labelSizes = this._labelSizes;
        if (!labelSizes) {
          const sampleSize = this.options.ticks.sampleSize;
          let ticks = this.ticks;
          if (sampleSize < ticks.length) {
            ticks = sample(ticks, sampleSize);
          }
          this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length);
        }
        return labelSizes;
      }
      _computeLabelSizes(ticks, length) {
        const { ctx, _longestTextCache: caches } = this;
        const widths = [];
        const heights = [];
        let widestLabelSize = 0;
        let highestLabelSize = 0;
        let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
        for (i = 0; i < length; ++i) {
          label = ticks[i].label;
          tickFont = this._resolveTickFontOptions(i);
          ctx.font = fontString = tickFont.string;
          cache = caches[fontString] = caches[fontString] || { data: {}, gc: [] };
          lineHeight = tickFont.lineHeight;
          width = height = 0;
          if (!isNullOrUndef(label) && !isArray(label)) {
            width = _measureText(ctx, cache.data, cache.gc, width, label);
            height = lineHeight;
          } else if (isArray(label)) {
            for (j = 0, jlen = label.length; j < jlen; ++j) {
              nestedLabel = label[j];
              if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
                width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
                height += lineHeight;
              }
            }
          }
          widths.push(width);
          heights.push(height);
          widestLabelSize = Math.max(width, widestLabelSize);
          highestLabelSize = Math.max(height, highestLabelSize);
        }
        garbageCollect(caches, length);
        const widest = widths.indexOf(widestLabelSize);
        const highest = heights.indexOf(highestLabelSize);
        const valueAt = (idx) => ({ width: widths[idx] || 0, height: heights[idx] || 0 });
        return {
          first: valueAt(0),
          last: valueAt(length - 1),
          widest: valueAt(widest),
          highest: valueAt(highest),
          widths,
          heights
        };
      }
      getLabelForValue(value) {
        return value;
      }
      getPixelForValue(value, index) {
        return NaN;
      }
      getValueForPixel(pixel) {
      }
      getPixelForTick(index) {
        const ticks = this.ticks;
        if (index < 0 || index > ticks.length - 1) {
          return null;
        }
        return this.getPixelForValue(ticks[index].value);
      }
      getPixelForDecimal(decimal) {
        if (this._reversePixels) {
          decimal = 1 - decimal;
        }
        const pixel = this._startPixel + decimal * this._length;
        return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
      }
      getDecimalForPixel(pixel) {
        const decimal = (pixel - this._startPixel) / this._length;
        return this._reversePixels ? 1 - decimal : decimal;
      }
      getBasePixel() {
        return this.getPixelForValue(this.getBaseValue());
      }
      getBaseValue() {
        const { min, max } = this;
        return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
      }
      getContext(index) {
        const ticks = this.ticks || [];
        if (index >= 0 && index < ticks.length) {
          const tick = ticks[index];
          return tick.$context || (tick.$context = createTickContext(this.getContext(), index, tick));
        }
        return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
      }
      _tickSize() {
        const optionTicks = this.options.ticks;
        const rot = toRadians(this.labelRotation);
        const cos = Math.abs(Math.cos(rot));
        const sin = Math.abs(Math.sin(rot));
        const labelSizes = this._getLabelSizes();
        const padding = optionTicks.autoSkipPadding || 0;
        const w = labelSizes ? labelSizes.widest.width + padding : 0;
        const h = labelSizes ? labelSizes.highest.height + padding : 0;
        return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin;
      }
      _isVisible() {
        const display = this.options.display;
        if (display !== "auto") {
          return !!display;
        }
        return this.getMatchingVisibleMetas().length > 0;
      }
      _computeGridLineItems(chartArea) {
        const axis = this.axis;
        const chart = this.chart;
        const options2 = this.options;
        const { grid, position } = options2;
        const offset = grid.offset;
        const isHorizontal = this.isHorizontal();
        const ticks = this.ticks;
        const ticksLength = ticks.length + (offset ? 1 : 0);
        const tl = getTickMarkLength(grid);
        const items = [];
        const borderOpts = grid.setContext(this.getContext());
        const axisWidth = borderOpts.drawBorder ? borderOpts.borderWidth : 0;
        const axisHalfWidth = axisWidth / 2;
        const alignBorderValue = function(pixel) {
          return _alignPixel(chart, pixel, axisWidth);
        };
        let borderValue, i, lineValue, alignedLineValue;
        let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
        if (position === "top") {
          borderValue = alignBorderValue(this.bottom);
          ty1 = this.bottom - tl;
          ty2 = borderValue - axisHalfWidth;
          y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
          y2 = chartArea.bottom;
        } else if (position === "bottom") {
          borderValue = alignBorderValue(this.top);
          y1 = chartArea.top;
          y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
          ty1 = borderValue + axisHalfWidth;
          ty2 = this.top + tl;
        } else if (position === "left") {
          borderValue = alignBorderValue(this.right);
          tx1 = this.right - tl;
          tx2 = borderValue - axisHalfWidth;
          x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
          x2 = chartArea.right;
        } else if (position === "right") {
          borderValue = alignBorderValue(this.left);
          x1 = chartArea.left;
          x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
          tx1 = borderValue + axisHalfWidth;
          tx2 = this.left + tl;
        } else if (axis === "x") {
          if (position === "center") {
            borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
          } else if (isObject(position)) {
            const positionAxisID = Object.keys(position)[0];
            const value = position[positionAxisID];
            borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
          }
          y1 = chartArea.top;
          y2 = chartArea.bottom;
          ty1 = borderValue + axisHalfWidth;
          ty2 = ty1 + tl;
        } else if (axis === "y") {
          if (position === "center") {
            borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
          } else if (isObject(position)) {
            const positionAxisID = Object.keys(position)[0];
            const value = position[positionAxisID];
            borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
          }
          tx1 = borderValue - axisHalfWidth;
          tx2 = tx1 - tl;
          x1 = chartArea.left;
          x2 = chartArea.right;
        }
        const limit = valueOrDefault(options2.ticks.maxTicksLimit, ticksLength);
        const step = Math.max(1, Math.ceil(ticksLength / limit));
        for (i = 0; i < ticksLength; i += step) {
          const optsAtIndex = grid.setContext(this.getContext(i));
          const lineWidth = optsAtIndex.lineWidth;
          const lineColor = optsAtIndex.color;
          const borderDash = grid.borderDash || [];
          const borderDashOffset = optsAtIndex.borderDashOffset;
          const tickWidth = optsAtIndex.tickWidth;
          const tickColor = optsAtIndex.tickColor;
          const tickBorderDash = optsAtIndex.tickBorderDash || [];
          const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
          lineValue = getPixelForGridLine(this, i, offset);
          if (lineValue === void 0) {
            continue;
          }
          alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
          if (isHorizontal) {
            tx1 = tx2 = x1 = x2 = alignedLineValue;
          } else {
            ty1 = ty2 = y1 = y2 = alignedLineValue;
          }
          items.push({
            tx1,
            ty1,
            tx2,
            ty2,
            x1,
            y1,
            x2,
            y2,
            width: lineWidth,
            color: lineColor,
            borderDash,
            borderDashOffset,
            tickWidth,
            tickColor,
            tickBorderDash,
            tickBorderDashOffset
          });
        }
        this._ticksLength = ticksLength;
        this._borderValue = borderValue;
        return items;
      }
      _computeLabelItems(chartArea) {
        const axis = this.axis;
        const options2 = this.options;
        const { position, ticks: optionTicks } = options2;
        const isHorizontal = this.isHorizontal();
        const ticks = this.ticks;
        const { align, crossAlign, padding, mirror } = optionTicks;
        const tl = getTickMarkLength(options2.grid);
        const tickAndPadding = tl + padding;
        const hTickAndPadding = mirror ? -padding : tickAndPadding;
        const rotation = -toRadians(this.labelRotation);
        const items = [];
        let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
        let textBaseline = "middle";
        if (position === "top") {
          y = this.bottom - hTickAndPadding;
          textAlign = this._getXAxisLabelAlignment();
        } else if (position === "bottom") {
          y = this.top + hTickAndPadding;
          textAlign = this._getXAxisLabelAlignment();
        } else if (position === "left") {
          const ret = this._getYAxisLabelAlignment(tl);
          textAlign = ret.textAlign;
          x = ret.x;
        } else if (position === "right") {
          const ret = this._getYAxisLabelAlignment(tl);
          textAlign = ret.textAlign;
          x = ret.x;
        } else if (axis === "x") {
          if (position === "center") {
            y = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
          } else if (isObject(position)) {
            const positionAxisID = Object.keys(position)[0];
            const value = position[positionAxisID];
            y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
          }
          textAlign = this._getXAxisLabelAlignment();
        } else if (axis === "y") {
          if (position === "center") {
            x = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
          } else if (isObject(position)) {
            const positionAxisID = Object.keys(position)[0];
            const value = position[positionAxisID];
            x = this.chart.scales[positionAxisID].getPixelForValue(value);
          }
          textAlign = this._getYAxisLabelAlignment(tl).textAlign;
        }
        if (axis === "y") {
          if (align === "start") {
            textBaseline = "top";
          } else if (align === "end") {
            textBaseline = "bottom";
          }
        }
        const labelSizes = this._getLabelSizes();
        for (i = 0, ilen = ticks.length; i < ilen; ++i) {
          tick = ticks[i];
          label = tick.label;
          const optsAtIndex = optionTicks.setContext(this.getContext(i));
          pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
          font = this._resolveTickFontOptions(i);
          lineHeight = font.lineHeight;
          lineCount = isArray(label) ? label.length : 1;
          const halfCount = lineCount / 2;
          const color2 = optsAtIndex.color;
          const strokeColor = optsAtIndex.textStrokeColor;
          const strokeWidth = optsAtIndex.textStrokeWidth;
          if (isHorizontal) {
            x = pixel;
            if (position === "top") {
              if (crossAlign === "near" || rotation !== 0) {
                textOffset = -lineCount * lineHeight + lineHeight / 2;
              } else if (crossAlign === "center") {
                textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
              } else {
                textOffset = -labelSizes.highest.height + lineHeight / 2;
              }
            } else {
              if (crossAlign === "near" || rotation !== 0) {
                textOffset = lineHeight / 2;
              } else if (crossAlign === "center") {
                textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
              } else {
                textOffset = labelSizes.highest.height - lineCount * lineHeight;
              }
            }
            if (mirror) {
              textOffset *= -1;
            }
          } else {
            y = pixel;
            textOffset = (1 - lineCount) * lineHeight / 2;
          }
          let backdrop;
          if (optsAtIndex.showLabelBackdrop) {
            const labelPadding = toPadding(optsAtIndex.backdropPadding);
            const height = labelSizes.heights[i];
            const width = labelSizes.widths[i];
            let top = y + textOffset - labelPadding.top;
            let left = x - labelPadding.left;
            switch (textBaseline) {
              case "middle":
                top -= height / 2;
                break;
              case "bottom":
                top -= height;
                break;
            }
            switch (textAlign) {
              case "center":
                left -= width / 2;
                break;
              case "right":
                left -= width;
                break;
            }
            backdrop = {
              left,
              top,
              width: width + labelPadding.width,
              height: height + labelPadding.height,
              color: optsAtIndex.backdropColor
            };
          }
          items.push({
            rotation,
            label,
            font,
            color: color2,
            strokeColor,
            strokeWidth,
            textOffset,
            textAlign,
            textBaseline,
            translation: [x, y],
            backdrop
          });
        }
        return items;
      }
      _getXAxisLabelAlignment() {
        const { position, ticks } = this.options;
        const rotation = -toRadians(this.labelRotation);
        if (rotation) {
          return position === "top" ? "left" : "right";
        }
        let align = "center";
        if (ticks.align === "start") {
          align = "left";
        } else if (ticks.align === "end") {
          align = "right";
        }
        return align;
      }
      _getYAxisLabelAlignment(tl) {
        const { position, ticks: { crossAlign, mirror, padding } } = this.options;
        const labelSizes = this._getLabelSizes();
        const tickAndPadding = tl + padding;
        const widest = labelSizes.widest.width;
        let textAlign;
        let x;
        if (position === "left") {
          if (mirror) {
            x = this.right + padding;
            if (crossAlign === "near") {
              textAlign = "left";
            } else if (crossAlign === "center") {
              textAlign = "center";
              x += widest / 2;
            } else {
              textAlign = "right";
              x += widest;
            }
          } else {
            x = this.right - tickAndPadding;
            if (crossAlign === "near") {
              textAlign = "right";
            } else if (crossAlign === "center") {
              textAlign = "center";
              x -= widest / 2;
            } else {
              textAlign = "left";
              x = this.left;
            }
          }
        } else if (position === "right") {
          if (mirror) {
            x = this.left + padding;
            if (crossAlign === "near") {
              textAlign = "right";
            } else if (crossAlign === "center") {
              textAlign = "center";
              x -= widest / 2;
            } else {
              textAlign = "left";
              x -= widest;
            }
          } else {
            x = this.left + tickAndPadding;
            if (crossAlign === "near") {
              textAlign = "left";
            } else if (crossAlign === "center") {
              textAlign = "center";
              x += widest / 2;
            } else {
              textAlign = "right";
              x = this.right;
            }
          }
        } else {
          textAlign = "right";
        }
        return { textAlign, x };
      }
      _computeLabelArea() {
        if (this.options.ticks.mirror) {
          return;
        }
        const chart = this.chart;
        const position = this.options.position;
        if (position === "left" || position === "right") {
          return { top: 0, left: this.left, bottom: chart.height, right: this.right };
        }
        if (position === "top" || position === "bottom") {
          return { top: this.top, left: 0, bottom: this.bottom, right: chart.width };
        }
      }
      drawBackground() {
        const { ctx, options: { backgroundColor }, left, top, width, height } = this;
        if (backgroundColor) {
          ctx.save();
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(left, top, width, height);
          ctx.restore();
        }
      }
      getLineWidthForValue(value) {
        const grid = this.options.grid;
        if (!this._isVisible() || !grid.display) {
          return 0;
        }
        const ticks = this.ticks;
        const index = ticks.findIndex((t) => t.value === value);
        if (index >= 0) {
          const opts = grid.setContext(this.getContext(index));
          return opts.lineWidth;
        }
        return 0;
      }
      drawGrid(chartArea) {
        const grid = this.options.grid;
        const ctx = this.ctx;
        const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
        let i, ilen;
        const drawLine = (p1, p2, style) => {
          if (!style.width || !style.color) {
            return;
          }
          ctx.save();
          ctx.lineWidth = style.width;
          ctx.strokeStyle = style.color;
          ctx.setLineDash(style.borderDash || []);
          ctx.lineDashOffset = style.borderDashOffset;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();
        };
        if (grid.display) {
          for (i = 0, ilen = items.length; i < ilen; ++i) {
            const item = items[i];
            if (grid.drawOnChartArea) {
              drawLine({ x: item.x1, y: item.y1 }, { x: item.x2, y: item.y2 }, item);
            }
            if (grid.drawTicks) {
              drawLine({ x: item.tx1, y: item.ty1 }, { x: item.tx2, y: item.ty2 }, {
                color: item.tickColor,
                width: item.tickWidth,
                borderDash: item.tickBorderDash,
                borderDashOffset: item.tickBorderDashOffset
              });
            }
          }
        }
      }
      drawBorder() {
        const { chart, ctx, options: { grid } } = this;
        const borderOpts = grid.setContext(this.getContext());
        const axisWidth = grid.drawBorder ? borderOpts.borderWidth : 0;
        if (!axisWidth) {
          return;
        }
        const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
        const borderValue = this._borderValue;
        let x1, x2, y1, y2;
        if (this.isHorizontal()) {
          x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2;
          x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2;
          y1 = y2 = borderValue;
        } else {
          y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2;
          y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
          x1 = x2 = borderValue;
        }
        ctx.save();
        ctx.lineWidth = borderOpts.borderWidth;
        ctx.strokeStyle = borderOpts.borderColor;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      }
      drawLabels(chartArea) {
        const optionTicks = this.options.ticks;
        if (!optionTicks.display) {
          return;
        }
        const ctx = this.ctx;
        const area = this._computeLabelArea();
        if (area) {
          clipArea(ctx, area);
        }
        const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
        let i, ilen;
        for (i = 0, ilen = items.length; i < ilen; ++i) {
          const item = items[i];
          const tickFont = item.font;
          const label = item.label;
          if (item.backdrop) {
            ctx.fillStyle = item.backdrop.color;
            ctx.fillRect(item.backdrop.left, item.backdrop.top, item.backdrop.width, item.backdrop.height);
          }
          let y = item.textOffset;
          renderText(ctx, label, 0, y, tickFont, item);
        }
        if (area) {
          unclipArea(ctx);
        }
      }
      drawTitle() {
        const { ctx, options: { position, title, reverse } } = this;
        if (!title.display) {
          return;
        }
        const font = toFont(title.font);
        const padding = toPadding(title.padding);
        const align = title.align;
        let offset = font.lineHeight / 2;
        if (position === "bottom" || position === "center" || isObject(position)) {
          offset += padding.bottom;
          if (isArray(title.text)) {
            offset += font.lineHeight * (title.text.length - 1);
          }
        } else {
          offset += padding.top;
        }
        const { titleX, titleY, maxWidth, rotation } = titleArgs(this, offset, position, align);
        renderText(ctx, title.text, 0, 0, font, {
          color: title.color,
          maxWidth,
          rotation,
          textAlign: titleAlign(align, position, reverse),
          textBaseline: "middle",
          translation: [titleX, titleY]
        });
      }
      draw(chartArea) {
        if (!this._isVisible()) {
          return;
        }
        this.drawBackground();
        this.drawGrid(chartArea);
        this.drawBorder();
        this.drawTitle();
        this.drawLabels(chartArea);
      }
      _layers() {
        const opts = this.options;
        const tz = opts.ticks && opts.ticks.z || 0;
        const gz = valueOrDefault(opts.grid && opts.grid.z, -1);
        if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
          return [{
            z: tz,
            draw: (chartArea) => {
              this.draw(chartArea);
            }
          }];
        }
        return [{
          z: gz,
          draw: (chartArea) => {
            this.drawBackground();
            this.drawGrid(chartArea);
            this.drawTitle();
          }
        }, {
          z: gz + 1,
          draw: () => {
            this.drawBorder();
          }
        }, {
          z: tz,
          draw: (chartArea) => {
            this.drawLabels(chartArea);
          }
        }];
      }
      getMatchingVisibleMetas(type) {
        const metas = this.chart.getSortedVisibleDatasetMetas();
        const axisID = this.axis + "AxisID";
        const result = [];
        let i, ilen;
        for (i = 0, ilen = metas.length; i < ilen; ++i) {
          const meta = metas[i];
          if (meta[axisID] === this.id && (!type || meta.type === type)) {
            result.push(meta);
          }
        }
        return result;
      }
      _resolveTickFontOptions(index) {
        const opts = this.options.ticks.setContext(this.getContext(index));
        return toFont(opts.font);
      }
      _maxDigits() {
        const fontSize = this._resolveTickFontOptions(0).lineHeight;
        return (this.isHorizontal() ? this.width : this.height) / fontSize;
      }
    };
    TypedRegistry = class {
      constructor(type, scope, override) {
        this.type = type;
        this.scope = scope;
        this.override = override;
        this.items = Object.create(null);
      }
      isForType(type) {
        return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
      }
      register(item) {
        const proto = Object.getPrototypeOf(item);
        let parentScope;
        if (isIChartComponent(proto)) {
          parentScope = this.register(proto);
        }
        const items = this.items;
        const id = item.id;
        const scope = this.scope + "." + id;
        if (!id) {
          throw new Error("class does not have id: " + item);
        }
        if (id in items) {
          return scope;
        }
        items[id] = item;
        registerDefaults(item, scope, parentScope);
        if (this.override) {
          defaults.override(item.id, item.overrides);
        }
        return scope;
      }
      get(id) {
        return this.items[id];
      }
      unregister(item) {
        const items = this.items;
        const id = item.id;
        const scope = this.scope;
        if (id in items) {
          delete items[id];
        }
        if (scope && id in defaults[scope]) {
          delete defaults[scope][id];
          if (this.override) {
            delete overrides[id];
          }
        }
      }
    };
    Registry = class {
      constructor() {
        this.controllers = new TypedRegistry(DatasetController, "datasets", true);
        this.elements = new TypedRegistry(Element, "elements");
        this.plugins = new TypedRegistry(Object, "plugins");
        this.scales = new TypedRegistry(Scale, "scales");
        this._typedRegistries = [this.controllers, this.scales, this.elements];
      }
      add(...args) {
        this._each("register", args);
      }
      remove(...args) {
        this._each("unregister", args);
      }
      addControllers(...args) {
        this._each("register", args, this.controllers);
      }
      addElements(...args) {
        this._each("register", args, this.elements);
      }
      addPlugins(...args) {
        this._each("register", args, this.plugins);
      }
      addScales(...args) {
        this._each("register", args, this.scales);
      }
      getController(id) {
        return this._get(id, this.controllers, "controller");
      }
      getElement(id) {
        return this._get(id, this.elements, "element");
      }
      getPlugin(id) {
        return this._get(id, this.plugins, "plugin");
      }
      getScale(id) {
        return this._get(id, this.scales, "scale");
      }
      removeControllers(...args) {
        this._each("unregister", args, this.controllers);
      }
      removeElements(...args) {
        this._each("unregister", args, this.elements);
      }
      removePlugins(...args) {
        this._each("unregister", args, this.plugins);
      }
      removeScales(...args) {
        this._each("unregister", args, this.scales);
      }
      _each(method, args, typedRegistry) {
        [...args].forEach((arg) => {
          const reg = typedRegistry || this._getRegistryForType(arg);
          if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
            this._exec(method, reg, arg);
          } else {
            each2(arg, (item) => {
              const itemReg = typedRegistry || this._getRegistryForType(item);
              this._exec(method, itemReg, item);
            });
          }
        });
      }
      _exec(method, registry2, component) {
        const camelMethod = _capitalize(method);
        callback(component["before" + camelMethod], [], component);
        registry2[method](component);
        callback(component["after" + camelMethod], [], component);
      }
      _getRegistryForType(type) {
        for (let i = 0; i < this._typedRegistries.length; i++) {
          const reg = this._typedRegistries[i];
          if (reg.isForType(type)) {
            return reg;
          }
        }
        return this.plugins;
      }
      _get(id, typedRegistry, type) {
        const item = typedRegistry.get(id);
        if (item === void 0) {
          throw new Error('"' + id + '" is not a registered ' + type + ".");
        }
        return item;
      }
    };
    registry = new Registry();
    PluginService = class {
      constructor() {
        this._init = [];
      }
      notify(chart, hook, args, filter) {
        if (hook === "beforeInit") {
          this._init = this._createDescriptors(chart, true);
          this._notify(this._init, chart, "install");
        }
        const descriptors2 = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
        const result = this._notify(descriptors2, chart, hook, args);
        if (hook === "destroy") {
          this._notify(descriptors2, chart, "stop");
          this._notify(this._init, chart, "uninstall");
        }
        return result;
      }
      _notify(descriptors2, chart, hook, args) {
        args = args || {};
        for (const descriptor of descriptors2) {
          const plugin = descriptor.plugin;
          const method = plugin[hook];
          const params = [chart, args, descriptor.options];
          if (callback(method, params, plugin) === false && args.cancelable) {
            return false;
          }
        }
        return true;
      }
      invalidate() {
        if (!isNullOrUndef(this._cache)) {
          this._oldCache = this._cache;
          this._cache = void 0;
        }
      }
      _descriptors(chart) {
        if (this._cache) {
          return this._cache;
        }
        const descriptors2 = this._cache = this._createDescriptors(chart);
        this._notifyStateChanges(chart);
        return descriptors2;
      }
      _createDescriptors(chart, all) {
        const config = chart && chart.config;
        const options2 = valueOrDefault(config.options && config.options.plugins, {});
        const plugins2 = allPlugins(config);
        return options2 === false && !all ? [] : createDescriptors(chart, plugins2, options2, all);
      }
      _notifyStateChanges(chart) {
        const previousDescriptors = this._oldCache || [];
        const descriptors2 = this._cache;
        const diff = (a, b) => a.filter((x) => !b.some((y) => x.plugin.id === y.plugin.id));
        this._notify(diff(previousDescriptors, descriptors2), chart, "stop");
        this._notify(diff(descriptors2, previousDescriptors), chart, "start");
      }
    };
    keyCache = new Map();
    keysCached = new Set();
    addIfFound = (set2, obj, key) => {
      const opts = resolveObjectKey(obj, key);
      if (opts !== void 0) {
        set2.add(opts);
      }
    };
    Config = class {
      constructor(config) {
        this._config = initConfig(config);
        this._scopeCache = new Map();
        this._resolverCache = new Map();
      }
      get platform() {
        return this._config.platform;
      }
      get type() {
        return this._config.type;
      }
      set type(type) {
        this._config.type = type;
      }
      get data() {
        return this._config.data;
      }
      set data(data) {
        this._config.data = initData(data);
      }
      get options() {
        return this._config.options;
      }
      set options(options2) {
        this._config.options = options2;
      }
      get plugins() {
        return this._config.plugins;
      }
      update() {
        const config = this._config;
        this.clearCache();
        initOptions(config);
      }
      clearCache() {
        this._scopeCache.clear();
        this._resolverCache.clear();
      }
      datasetScopeKeys(datasetType) {
        return cachedKeys(datasetType, () => [[
          `datasets.${datasetType}`,
          ""
        ]]);
      }
      datasetAnimationScopeKeys(datasetType, transition) {
        return cachedKeys(`${datasetType}.transition.${transition}`, () => [
          [
            `datasets.${datasetType}.transitions.${transition}`,
            `transitions.${transition}`
          ],
          [
            `datasets.${datasetType}`,
            ""
          ]
        ]);
      }
      datasetElementScopeKeys(datasetType, elementType) {
        return cachedKeys(`${datasetType}-${elementType}`, () => [[
          `datasets.${datasetType}.elements.${elementType}`,
          `datasets.${datasetType}`,
          `elements.${elementType}`,
          ""
        ]]);
      }
      pluginScopeKeys(plugin) {
        const id = plugin.id;
        const type = this.type;
        return cachedKeys(`${type}-plugin-${id}`, () => [[
          `plugins.${id}`,
          ...plugin.additionalOptionScopes || []
        ]]);
      }
      _cachedScopes(mainScope, resetCache) {
        const _scopeCache = this._scopeCache;
        let cache = _scopeCache.get(mainScope);
        if (!cache || resetCache) {
          cache = new Map();
          _scopeCache.set(mainScope, cache);
        }
        return cache;
      }
      getOptionScopes(mainScope, keyLists, resetCache) {
        const { options: options2, type } = this;
        const cache = this._cachedScopes(mainScope, resetCache);
        const cached = cache.get(keyLists);
        if (cached) {
          return cached;
        }
        const scopes = new Set();
        keyLists.forEach((keys) => {
          if (mainScope) {
            scopes.add(mainScope);
            keys.forEach((key) => addIfFound(scopes, mainScope, key));
          }
          keys.forEach((key) => addIfFound(scopes, options2, key));
          keys.forEach((key) => addIfFound(scopes, overrides[type] || {}, key));
          keys.forEach((key) => addIfFound(scopes, defaults, key));
          keys.forEach((key) => addIfFound(scopes, descriptors, key));
        });
        const array = Array.from(scopes);
        if (array.length === 0) {
          array.push(Object.create(null));
        }
        if (keysCached.has(keyLists)) {
          cache.set(keyLists, array);
        }
        return array;
      }
      chartOptionScopes() {
        const { options: options2, type } = this;
        return [
          options2,
          overrides[type] || {},
          defaults.datasets[type] || {},
          { type },
          defaults,
          descriptors
        ];
      }
      resolveNamedOptions(scopes, names2, context, prefixes = [""]) {
        const result = { $shared: true };
        const { resolver, subPrefixes } = getResolver(this._resolverCache, scopes, prefixes);
        let options2 = resolver;
        if (needContext(resolver, names2)) {
          result.$shared = false;
          context = isFunction(context) ? context() : context;
          const subResolver = this.createResolver(scopes, context, subPrefixes);
          options2 = _attachContext(resolver, context, subResolver);
        }
        for (const prop of names2) {
          result[prop] = options2[prop];
        }
        return result;
      }
      createResolver(scopes, context, prefixes = [""], descriptorDefaults) {
        const { resolver } = getResolver(this._resolverCache, scopes, prefixes);
        return isObject(context) ? _attachContext(resolver, context, void 0, descriptorDefaults) : resolver;
      }
    };
    hasFunction = (value) => isObject(value) && Object.getOwnPropertyNames(value).reduce((acc, key) => acc || isFunction(value[key]), false);
    version = "3.6.2";
    KNOWN_POSITIONS = ["top", "bottom", "left", "right", "chartArea"];
    instances = {};
    getChart = (key) => {
      const canvas = getCanvas(key);
      return Object.values(instances).filter((c) => c.canvas === canvas).pop();
    };
    Chart$1 = class {
      constructor(item, userConfig) {
        const config = this.config = new Config(userConfig);
        const initialCanvas = getCanvas(item);
        const existingChart = getChart(initialCanvas);
        if (existingChart) {
          throw new Error("Canvas is already in use. Chart with ID '" + existingChart.id + "' must be destroyed before the canvas can be reused.");
        }
        const options2 = config.createResolver(config.chartOptionScopes(), this.getContext());
        this.platform = new (config.platform || _detectPlatform(initialCanvas))();
        this.platform.updateConfig(config);
        const context = this.platform.acquireContext(initialCanvas, options2.aspectRatio);
        const canvas = context && context.canvas;
        const height = canvas && canvas.height;
        const width = canvas && canvas.width;
        this.id = uid();
        this.ctx = context;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this._options = options2;
        this._aspectRatio = this.aspectRatio;
        this._layers = [];
        this._metasets = [];
        this._stacks = void 0;
        this.boxes = [];
        this.currentDevicePixelRatio = void 0;
        this.chartArea = void 0;
        this._active = [];
        this._lastEvent = void 0;
        this._listeners = {};
        this._responsiveListeners = void 0;
        this._sortedMetasets = [];
        this.scales = {};
        this._plugins = new PluginService();
        this.$proxies = {};
        this._hiddenIndices = {};
        this.attached = false;
        this._animationsDisabled = void 0;
        this.$context = void 0;
        this._doResize = debounce((mode) => this.update(mode), options2.resizeDelay || 0);
        this._dataChanges = [];
        instances[this.id] = this;
        if (!context || !canvas) {
          console.error("Failed to create chart: can't acquire context from the given item");
          return;
        }
        animator.listen(this, "complete", onAnimationsComplete);
        animator.listen(this, "progress", onAnimationProgress);
        this._initialize();
        if (this.attached) {
          this.update();
        }
      }
      get aspectRatio() {
        const { options: { aspectRatio, maintainAspectRatio }, width, height, _aspectRatio } = this;
        if (!isNullOrUndef(aspectRatio)) {
          return aspectRatio;
        }
        if (maintainAspectRatio && _aspectRatio) {
          return _aspectRatio;
        }
        return height ? width / height : null;
      }
      get data() {
        return this.config.data;
      }
      set data(data) {
        this.config.data = data;
      }
      get options() {
        return this._options;
      }
      set options(options2) {
        this.config.options = options2;
      }
      _initialize() {
        this.notifyPlugins("beforeInit");
        if (this.options.responsive) {
          this.resize();
        } else {
          retinaScale(this, this.options.devicePixelRatio);
        }
        this.bindEvents();
        this.notifyPlugins("afterInit");
        return this;
      }
      clear() {
        clearCanvas(this.canvas, this.ctx);
        return this;
      }
      stop() {
        animator.stop(this);
        return this;
      }
      resize(width, height) {
        if (!animator.running(this)) {
          this._resize(width, height);
        } else {
          this._resizeBeforeDraw = { width, height };
        }
      }
      _resize(width, height) {
        const options2 = this.options;
        const canvas = this.canvas;
        const aspectRatio = options2.maintainAspectRatio && this.aspectRatio;
        const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
        const newRatio = options2.devicePixelRatio || this.platform.getDevicePixelRatio();
        const mode = this.width ? "resize" : "attach";
        this.width = newSize.width;
        this.height = newSize.height;
        this._aspectRatio = this.aspectRatio;
        if (!retinaScale(this, newRatio, true)) {
          return;
        }
        this.notifyPlugins("resize", { size: newSize });
        callback(options2.onResize, [this, newSize], this);
        if (this.attached) {
          if (this._doResize(mode)) {
            this.render();
          }
        }
      }
      ensureScalesHaveIDs() {
        const options2 = this.options;
        const scalesOptions = options2.scales || {};
        each2(scalesOptions, (axisOptions, axisID) => {
          axisOptions.id = axisID;
        });
      }
      buildOrUpdateScales() {
        const options2 = this.options;
        const scaleOpts = options2.scales;
        const scales2 = this.scales;
        const updated = Object.keys(scales2).reduce((obj, id) => {
          obj[id] = false;
          return obj;
        }, {});
        let items = [];
        if (scaleOpts) {
          items = items.concat(Object.keys(scaleOpts).map((id) => {
            const scaleOptions = scaleOpts[id];
            const axis = determineAxis(id, scaleOptions);
            const isRadial = axis === "r";
            const isHorizontal = axis === "x";
            return {
              options: scaleOptions,
              dposition: isRadial ? "chartArea" : isHorizontal ? "bottom" : "left",
              dtype: isRadial ? "radialLinear" : isHorizontal ? "category" : "linear"
            };
          }));
        }
        each2(items, (item) => {
          const scaleOptions = item.options;
          const id = scaleOptions.id;
          const axis = determineAxis(id, scaleOptions);
          const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
          if (scaleOptions.position === void 0 || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
            scaleOptions.position = item.dposition;
          }
          updated[id] = true;
          let scale = null;
          if (id in scales2 && scales2[id].type === scaleType) {
            scale = scales2[id];
          } else {
            const scaleClass = registry.getScale(scaleType);
            scale = new scaleClass({
              id,
              type: scaleType,
              ctx: this.ctx,
              chart: this
            });
            scales2[scale.id] = scale;
          }
          scale.init(scaleOptions, options2);
        });
        each2(updated, (hasUpdated, id) => {
          if (!hasUpdated) {
            delete scales2[id];
          }
        });
        each2(scales2, (scale) => {
          layouts.configure(this, scale, scale.options);
          layouts.addBox(this, scale);
        });
      }
      _updateMetasets() {
        const metasets = this._metasets;
        const numData = this.data.datasets.length;
        const numMeta = metasets.length;
        metasets.sort((a, b) => a.index - b.index);
        if (numMeta > numData) {
          for (let i = numData; i < numMeta; ++i) {
            this._destroyDatasetMeta(i);
          }
          metasets.splice(numData, numMeta - numData);
        }
        this._sortedMetasets = metasets.slice(0).sort(compare2Level("order", "index"));
      }
      _removeUnreferencedMetasets() {
        const { _metasets: metasets, data: { datasets } } = this;
        if (metasets.length > datasets.length) {
          delete this._stacks;
        }
        metasets.forEach((meta, index) => {
          if (datasets.filter((x) => x === meta._dataset).length === 0) {
            this._destroyDatasetMeta(index);
          }
        });
      }
      buildOrUpdateControllers() {
        const newControllers = [];
        const datasets = this.data.datasets;
        let i, ilen;
        this._removeUnreferencedMetasets();
        for (i = 0, ilen = datasets.length; i < ilen; i++) {
          const dataset = datasets[i];
          let meta = this.getDatasetMeta(i);
          const type = dataset.type || this.config.type;
          if (meta.type && meta.type !== type) {
            this._destroyDatasetMeta(i);
            meta = this.getDatasetMeta(i);
          }
          meta.type = type;
          meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
          meta.order = dataset.order || 0;
          meta.index = i;
          meta.label = "" + dataset.label;
          meta.visible = this.isDatasetVisible(i);
          if (meta.controller) {
            meta.controller.updateIndex(i);
            meta.controller.linkScales();
          } else {
            const ControllerClass = registry.getController(type);
            const { datasetElementType, dataElementType } = defaults.datasets[type];
            Object.assign(ControllerClass.prototype, {
              dataElementType: registry.getElement(dataElementType),
              datasetElementType: datasetElementType && registry.getElement(datasetElementType)
            });
            meta.controller = new ControllerClass(this, i);
            newControllers.push(meta.controller);
          }
        }
        this._updateMetasets();
        return newControllers;
      }
      _resetElements() {
        each2(this.data.datasets, (dataset, datasetIndex) => {
          this.getDatasetMeta(datasetIndex).controller.reset();
        }, this);
      }
      reset() {
        this._resetElements();
        this.notifyPlugins("reset");
      }
      update(mode) {
        const config = this.config;
        config.update();
        const options2 = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
        const animsDisabled = this._animationsDisabled = !options2.animation;
        this._updateScales();
        this._checkEventBindings();
        this._updateHiddenIndices();
        this._plugins.invalidate();
        if (this.notifyPlugins("beforeUpdate", { mode, cancelable: true }) === false) {
          return;
        }
        const newControllers = this.buildOrUpdateControllers();
        this.notifyPlugins("beforeElementsUpdate");
        let minPadding = 0;
        for (let i = 0, ilen = this.data.datasets.length; i < ilen; i++) {
          const { controller } = this.getDatasetMeta(i);
          const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
          controller.buildOrUpdateElements(reset);
          minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
        }
        minPadding = this._minPadding = options2.layout.autoPadding ? minPadding : 0;
        this._updateLayout(minPadding);
        if (!animsDisabled) {
          each2(newControllers, (controller) => {
            controller.reset();
          });
        }
        this._updateDatasets(mode);
        this.notifyPlugins("afterUpdate", { mode });
        this._layers.sort(compare2Level("z", "_idx"));
        if (this._lastEvent) {
          this._eventHandler(this._lastEvent, true);
        }
        this.render();
      }
      _updateScales() {
        each2(this.scales, (scale) => {
          layouts.removeBox(this, scale);
        });
        this.ensureScalesHaveIDs();
        this.buildOrUpdateScales();
      }
      _checkEventBindings() {
        const options2 = this.options;
        const existingEvents = new Set(Object.keys(this._listeners));
        const newEvents = new Set(options2.events);
        if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options2.responsive) {
          this.unbindEvents();
          this.bindEvents();
        }
      }
      _updateHiddenIndices() {
        const { _hiddenIndices } = this;
        const changes = this._getUniformDataChanges() || [];
        for (const { method, start, count } of changes) {
          const move = method === "_removeElements" ? -count : count;
          moveNumericKeys(_hiddenIndices, start, move);
        }
      }
      _getUniformDataChanges() {
        const _dataChanges = this._dataChanges;
        if (!_dataChanges || !_dataChanges.length) {
          return;
        }
        this._dataChanges = [];
        const datasetCount = this.data.datasets.length;
        const makeSet = (idx) => new Set(_dataChanges.filter((c) => c[0] === idx).map((c, i) => i + "," + c.splice(1).join(",")));
        const changeSet = makeSet(0);
        for (let i = 1; i < datasetCount; i++) {
          if (!setsEqual(changeSet, makeSet(i))) {
            return;
          }
        }
        return Array.from(changeSet).map((c) => c.split(",")).map((a) => ({ method: a[1], start: +a[2], count: +a[3] }));
      }
      _updateLayout(minPadding) {
        if (this.notifyPlugins("beforeLayout", { cancelable: true }) === false) {
          return;
        }
        layouts.update(this, this.width, this.height, minPadding);
        const area = this.chartArea;
        const noArea = area.width <= 0 || area.height <= 0;
        this._layers = [];
        each2(this.boxes, (box) => {
          if (noArea && box.position === "chartArea") {
            return;
          }
          if (box.configure) {
            box.configure();
          }
          this._layers.push(...box._layers());
        }, this);
        this._layers.forEach((item, index) => {
          item._idx = index;
        });
        this.notifyPlugins("afterLayout");
      }
      _updateDatasets(mode) {
        if (this.notifyPlugins("beforeDatasetsUpdate", { mode, cancelable: true }) === false) {
          return;
        }
        for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
          this.getDatasetMeta(i).controller.configure();
        }
        for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
          this._updateDataset(i, isFunction(mode) ? mode({ datasetIndex: i }) : mode);
        }
        this.notifyPlugins("afterDatasetsUpdate", { mode });
      }
      _updateDataset(index, mode) {
        const meta = this.getDatasetMeta(index);
        const args = { meta, index, mode, cancelable: true };
        if (this.notifyPlugins("beforeDatasetUpdate", args) === false) {
          return;
        }
        meta.controller._update(mode);
        args.cancelable = false;
        this.notifyPlugins("afterDatasetUpdate", args);
      }
      render() {
        if (this.notifyPlugins("beforeRender", { cancelable: true }) === false) {
          return;
        }
        if (animator.has(this)) {
          if (this.attached && !animator.running(this)) {
            animator.start(this);
          }
        } else {
          this.draw();
          onAnimationsComplete({ chart: this });
        }
      }
      draw() {
        let i;
        if (this._resizeBeforeDraw) {
          const { width, height } = this._resizeBeforeDraw;
          this._resize(width, height);
          this._resizeBeforeDraw = null;
        }
        this.clear();
        if (this.width <= 0 || this.height <= 0) {
          return;
        }
        if (this.notifyPlugins("beforeDraw", { cancelable: true }) === false) {
          return;
        }
        const layers = this._layers;
        for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
          layers[i].draw(this.chartArea);
        }
        this._drawDatasets();
        for (; i < layers.length; ++i) {
          layers[i].draw(this.chartArea);
        }
        this.notifyPlugins("afterDraw");
      }
      _getSortedDatasetMetas(filterVisible) {
        const metasets = this._sortedMetasets;
        const result = [];
        let i, ilen;
        for (i = 0, ilen = metasets.length; i < ilen; ++i) {
          const meta = metasets[i];
          if (!filterVisible || meta.visible) {
            result.push(meta);
          }
        }
        return result;
      }
      getSortedVisibleDatasetMetas() {
        return this._getSortedDatasetMetas(true);
      }
      _drawDatasets() {
        if (this.notifyPlugins("beforeDatasetsDraw", { cancelable: true }) === false) {
          return;
        }
        const metasets = this.getSortedVisibleDatasetMetas();
        for (let i = metasets.length - 1; i >= 0; --i) {
          this._drawDataset(metasets[i]);
        }
        this.notifyPlugins("afterDatasetsDraw");
      }
      _drawDataset(meta) {
        const ctx = this.ctx;
        const clip = meta._clip;
        const useClip = !clip.disabled;
        const area = this.chartArea;
        const args = {
          meta,
          index: meta.index,
          cancelable: true
        };
        if (this.notifyPlugins("beforeDatasetDraw", args) === false) {
          return;
        }
        if (useClip) {
          clipArea(ctx, {
            left: clip.left === false ? 0 : area.left - clip.left,
            right: clip.right === false ? this.width : area.right + clip.right,
            top: clip.top === false ? 0 : area.top - clip.top,
            bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom
          });
        }
        meta.controller.draw();
        if (useClip) {
          unclipArea(ctx);
        }
        args.cancelable = false;
        this.notifyPlugins("afterDatasetDraw", args);
      }
      getElementsAtEventForMode(e, mode, options2, useFinalPosition) {
        const method = Interaction.modes[mode];
        if (typeof method === "function") {
          return method(this, e, options2, useFinalPosition);
        }
        return [];
      }
      getDatasetMeta(datasetIndex) {
        const dataset = this.data.datasets[datasetIndex];
        const metasets = this._metasets;
        let meta = metasets.filter((x) => x && x._dataset === dataset).pop();
        if (!meta) {
          meta = {
            type: null,
            data: [],
            dataset: null,
            controller: null,
            hidden: null,
            xAxisID: null,
            yAxisID: null,
            order: dataset && dataset.order || 0,
            index: datasetIndex,
            _dataset: dataset,
            _parsed: [],
            _sorted: false
          };
          metasets.push(meta);
        }
        return meta;
      }
      getContext() {
        return this.$context || (this.$context = createContext(null, { chart: this, type: "chart" }));
      }
      getVisibleDatasetCount() {
        return this.getSortedVisibleDatasetMetas().length;
      }
      isDatasetVisible(datasetIndex) {
        const dataset = this.data.datasets[datasetIndex];
        if (!dataset) {
          return false;
        }
        const meta = this.getDatasetMeta(datasetIndex);
        return typeof meta.hidden === "boolean" ? !meta.hidden : !dataset.hidden;
      }
      setDatasetVisibility(datasetIndex, visible) {
        const meta = this.getDatasetMeta(datasetIndex);
        meta.hidden = !visible;
      }
      toggleDataVisibility(index) {
        this._hiddenIndices[index] = !this._hiddenIndices[index];
      }
      getDataVisibility(index) {
        return !this._hiddenIndices[index];
      }
      _updateVisibility(datasetIndex, dataIndex, visible) {
        const mode = visible ? "show" : "hide";
        const meta = this.getDatasetMeta(datasetIndex);
        const anims = meta.controller._resolveAnimations(void 0, mode);
        if (defined(dataIndex)) {
          meta.data[dataIndex].hidden = !visible;
          this.update();
        } else {
          this.setDatasetVisibility(datasetIndex, visible);
          anims.update(meta, { visible });
          this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : void 0);
        }
      }
      hide(datasetIndex, dataIndex) {
        this._updateVisibility(datasetIndex, dataIndex, false);
      }
      show(datasetIndex, dataIndex) {
        this._updateVisibility(datasetIndex, dataIndex, true);
      }
      _destroyDatasetMeta(datasetIndex) {
        const meta = this._metasets[datasetIndex];
        if (meta && meta.controller) {
          meta.controller._destroy();
        }
        delete this._metasets[datasetIndex];
      }
      _stop() {
        let i, ilen;
        this.stop();
        animator.remove(this);
        for (i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
          this._destroyDatasetMeta(i);
        }
      }
      destroy() {
        const { canvas, ctx } = this;
        this._stop();
        this.config.clearCache();
        if (canvas) {
          this.unbindEvents();
          clearCanvas(canvas, ctx);
          this.platform.releaseContext(ctx);
          this.canvas = null;
          this.ctx = null;
        }
        this.notifyPlugins("destroy");
        delete instances[this.id];
      }
      toBase64Image(...args) {
        return this.canvas.toDataURL(...args);
      }
      bindEvents() {
        this.bindUserEvents();
        if (this.options.responsive) {
          this.bindResponsiveEvents();
        } else {
          this.attached = true;
        }
      }
      bindUserEvents() {
        const listeners = this._listeners;
        const platform = this.platform;
        const _add = (type, listener2) => {
          platform.addEventListener(this, type, listener2);
          listeners[type] = listener2;
        };
        const listener = (e, x, y) => {
          e.offsetX = x;
          e.offsetY = y;
          this._eventHandler(e);
        };
        each2(this.options.events, (type) => _add(type, listener));
      }
      bindResponsiveEvents() {
        if (!this._responsiveListeners) {
          this._responsiveListeners = {};
        }
        const listeners = this._responsiveListeners;
        const platform = this.platform;
        const _add = (type, listener2) => {
          platform.addEventListener(this, type, listener2);
          listeners[type] = listener2;
        };
        const _remove = (type, listener2) => {
          if (listeners[type]) {
            platform.removeEventListener(this, type, listener2);
            delete listeners[type];
          }
        };
        const listener = (width, height) => {
          if (this.canvas) {
            this.resize(width, height);
          }
        };
        let detached;
        const attached = () => {
          _remove("attach", attached);
          this.attached = true;
          this.resize();
          _add("resize", listener);
          _add("detach", detached);
        };
        detached = () => {
          this.attached = false;
          _remove("resize", listener);
          this._stop();
          this._resize(0, 0);
          _add("attach", attached);
        };
        if (platform.isAttached(this.canvas)) {
          attached();
        } else {
          detached();
        }
      }
      unbindEvents() {
        each2(this._listeners, (listener, type) => {
          this.platform.removeEventListener(this, type, listener);
        });
        this._listeners = {};
        each2(this._responsiveListeners, (listener, type) => {
          this.platform.removeEventListener(this, type, listener);
        });
        this._responsiveListeners = void 0;
      }
      updateHoverStyle(items, mode, enabled) {
        const prefix = enabled ? "set" : "remove";
        let meta, item, i, ilen;
        if (mode === "dataset") {
          meta = this.getDatasetMeta(items[0].datasetIndex);
          meta.controller["_" + prefix + "DatasetHoverStyle"]();
        }
        for (i = 0, ilen = items.length; i < ilen; ++i) {
          item = items[i];
          const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
          if (controller) {
            controller[prefix + "HoverStyle"](item.element, item.datasetIndex, item.index);
          }
        }
      }
      getActiveElements() {
        return this._active || [];
      }
      setActiveElements(activeElements) {
        const lastActive = this._active || [];
        const active = activeElements.map(({ datasetIndex, index }) => {
          const meta = this.getDatasetMeta(datasetIndex);
          if (!meta) {
            throw new Error("No dataset found at index " + datasetIndex);
          }
          return {
            datasetIndex,
            element: meta.data[index],
            index
          };
        });
        const changed = !_elementsEqual(active, lastActive);
        if (changed) {
          this._active = active;
          this._updateHoverStyles(active, lastActive);
        }
      }
      notifyPlugins(hook, args, filter) {
        return this._plugins.notify(this, hook, args, filter);
      }
      _updateHoverStyles(active, lastActive, replay) {
        const hoverOptions = this.options.hover;
        const diff = (a, b) => a.filter((x) => !b.some((y) => x.datasetIndex === y.datasetIndex && x.index === y.index));
        const deactivated = diff(lastActive, active);
        const activated = replay ? active : diff(active, lastActive);
        if (deactivated.length) {
          this.updateHoverStyle(deactivated, hoverOptions.mode, false);
        }
        if (activated.length && hoverOptions.mode) {
          this.updateHoverStyle(activated, hoverOptions.mode, true);
        }
      }
      _eventHandler(e, replay) {
        const args = { event: e, replay, cancelable: true };
        const eventFilter = (plugin) => (plugin.options.events || this.options.events).includes(e.native.type);
        if (this.notifyPlugins("beforeEvent", args, eventFilter) === false) {
          return;
        }
        const changed = this._handleEvent(e, replay);
        args.cancelable = false;
        this.notifyPlugins("afterEvent", args, eventFilter);
        if (changed || args.changed) {
          this.render();
        }
        return this;
      }
      _handleEvent(e, replay) {
        const { _active: lastActive = [], options: options2 } = this;
        const hoverOptions = options2.hover;
        const useFinalPosition = replay;
        let active = [];
        let changed = false;
        let lastEvent = null;
        if (e.type !== "mouseout") {
          active = this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
          lastEvent = e.type === "click" ? this._lastEvent : e;
        }
        this._lastEvent = null;
        if (_isPointInArea(e, this.chartArea, this._minPadding)) {
          callback(options2.onHover, [e, active, this], this);
          if (e.type === "mouseup" || e.type === "click" || e.type === "contextmenu") {
            callback(options2.onClick, [e, active, this], this);
          }
        }
        changed = !_elementsEqual(active, lastActive);
        if (changed || replay) {
          this._active = active;
          this._updateHoverStyles(active, lastActive, replay);
        }
        this._lastEvent = lastEvent;
        return changed;
      }
    };
    invalidatePlugins = () => each2(Chart$1.instances, (chart) => chart._plugins.invalidate());
    enumerable = true;
    Object.defineProperties(Chart$1, {
      defaults: {
        enumerable,
        value: defaults
      },
      instances: {
        enumerable,
        value: instances
      },
      overrides: {
        enumerable,
        value: overrides
      },
      registry: {
        enumerable,
        value: registry
      },
      version: {
        enumerable,
        value: version
      },
      getChart: {
        enumerable,
        value: getChart
      },
      register: {
        enumerable,
        value: (...items) => {
          registry.add(...items);
          invalidatePlugins();
        }
      },
      unregister: {
        enumerable,
        value: (...items) => {
          registry.remove(...items);
          invalidatePlugins();
        }
      }
    });
    ArcElement = class extends Element {
      constructor(cfg) {
        super();
        this.options = void 0;
        this.circumference = void 0;
        this.startAngle = void 0;
        this.endAngle = void 0;
        this.innerRadius = void 0;
        this.outerRadius = void 0;
        this.pixelMargin = 0;
        this.fullCircles = 0;
        if (cfg) {
          Object.assign(this, cfg);
        }
      }
      inRange(chartX, chartY, useFinalPosition) {
        const point = this.getProps(["x", "y"], useFinalPosition);
        const { angle, distance } = getAngleFromPoint(point, { x: chartX, y: chartY });
        const { startAngle, endAngle, innerRadius, outerRadius, circumference } = this.getProps([
          "startAngle",
          "endAngle",
          "innerRadius",
          "outerRadius",
          "circumference"
        ], useFinalPosition);
        const rAdjust = this.options.spacing / 2;
        const _circumference = valueOrDefault(circumference, endAngle - startAngle);
        const betweenAngles = _circumference >= TAU || _angleBetween(angle, startAngle, endAngle);
        const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust);
        return betweenAngles && withinRadius;
      }
      getCenterPoint(useFinalPosition) {
        const { x, y, startAngle, endAngle, innerRadius, outerRadius } = this.getProps([
          "x",
          "y",
          "startAngle",
          "endAngle",
          "innerRadius",
          "outerRadius",
          "circumference"
        ], useFinalPosition);
        const { offset, spacing } = this.options;
        const halfAngle = (startAngle + endAngle) / 2;
        const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
        return {
          x: x + Math.cos(halfAngle) * halfRadius,
          y: y + Math.sin(halfAngle) * halfRadius
        };
      }
      tooltipPosition(useFinalPosition) {
        return this.getCenterPoint(useFinalPosition);
      }
      draw(ctx) {
        const { options: options2, circumference } = this;
        const offset = (options2.offset || 0) / 2;
        const spacing = (options2.spacing || 0) / 2;
        this.pixelMargin = options2.borderAlign === "inner" ? 0.33 : 0;
        this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0;
        if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
          return;
        }
        ctx.save();
        let radiusOffset = 0;
        if (offset) {
          radiusOffset = offset / 2;
          const halfAngle = (this.startAngle + this.endAngle) / 2;
          ctx.translate(Math.cos(halfAngle) * radiusOffset, Math.sin(halfAngle) * radiusOffset);
          if (this.circumference >= PI) {
            radiusOffset = offset;
          }
        }
        ctx.fillStyle = options2.backgroundColor;
        ctx.strokeStyle = options2.borderColor;
        const endAngle = drawArc(ctx, this, radiusOffset, spacing);
        drawBorder(ctx, this, radiusOffset, spacing, endAngle);
        ctx.restore();
      }
    };
    ArcElement.id = "arc";
    ArcElement.defaults = {
      borderAlign: "center",
      borderColor: "#fff",
      borderRadius: 0,
      borderWidth: 2,
      offset: 0,
      spacing: 0,
      angle: void 0
    };
    ArcElement.defaultRoutes = {
      backgroundColor: "backgroundColor"
    };
    usePath2D = typeof Path2D === "function";
    LineElement = class extends Element {
      constructor(cfg) {
        super();
        this.animated = true;
        this.options = void 0;
        this._chart = void 0;
        this._loop = void 0;
        this._fullLoop = void 0;
        this._path = void 0;
        this._points = void 0;
        this._segments = void 0;
        this._decimated = false;
        this._pointsUpdated = false;
        this._datasetIndex = void 0;
        if (cfg) {
          Object.assign(this, cfg);
        }
      }
      updateControlPoints(chartArea, indexAxis) {
        const options2 = this.options;
        if ((options2.tension || options2.cubicInterpolationMode === "monotone") && !options2.stepped && !this._pointsUpdated) {
          const loop = options2.spanGaps ? this._loop : this._fullLoop;
          _updateBezierControlPoints(this._points, options2, chartArea, loop, indexAxis);
          this._pointsUpdated = true;
        }
      }
      set points(points) {
        this._points = points;
        delete this._segments;
        delete this._path;
        this._pointsUpdated = false;
      }
      get points() {
        return this._points;
      }
      get segments() {
        return this._segments || (this._segments = _computeSegments(this, this.options.segment));
      }
      first() {
        const segments = this.segments;
        const points = this.points;
        return segments.length && points[segments[0].start];
      }
      last() {
        const segments = this.segments;
        const points = this.points;
        const count = segments.length;
        return count && points[segments[count - 1].end];
      }
      interpolate(point, property) {
        const options2 = this.options;
        const value = point[property];
        const points = this.points;
        const segments = _boundSegments(this, { property, start: value, end: value });
        if (!segments.length) {
          return;
        }
        const result = [];
        const _interpolate = _getInterpolationMethod(options2);
        let i, ilen;
        for (i = 0, ilen = segments.length; i < ilen; ++i) {
          const { start, end } = segments[i];
          const p1 = points[start];
          const p2 = points[end];
          if (p1 === p2) {
            result.push(p1);
            continue;
          }
          const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
          const interpolated = _interpolate(p1, p2, t, options2.stepped);
          interpolated[property] = point[property];
          result.push(interpolated);
        }
        return result.length === 1 ? result[0] : result;
      }
      pathSegment(ctx, segment, params) {
        const segmentMethod = _getSegmentMethod(this);
        return segmentMethod(ctx, this, segment, params);
      }
      path(ctx, start, count) {
        const segments = this.segments;
        const segmentMethod = _getSegmentMethod(this);
        let loop = this._loop;
        start = start || 0;
        count = count || this.points.length - start;
        for (const segment of segments) {
          loop &= segmentMethod(ctx, this, segment, { start, end: start + count - 1 });
        }
        return !!loop;
      }
      draw(ctx, chartArea, start, count) {
        const options2 = this.options || {};
        const points = this.points || [];
        if (points.length && options2.borderWidth) {
          ctx.save();
          draw(ctx, this, start, count);
          ctx.restore();
        }
        if (this.animated) {
          this._pointsUpdated = false;
          this._path = void 0;
        }
      }
    };
    LineElement.id = "line";
    LineElement.defaults = {
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0,
      borderJoinStyle: "miter",
      borderWidth: 3,
      capBezierPoints: true,
      cubicInterpolationMode: "default",
      fill: false,
      spanGaps: false,
      stepped: false,
      tension: 0
    };
    LineElement.defaultRoutes = {
      backgroundColor: "backgroundColor",
      borderColor: "borderColor"
    };
    LineElement.descriptors = {
      _scriptable: true,
      _indexable: (name) => name !== "borderDash" && name !== "fill"
    };
    PointElement = class extends Element {
      constructor(cfg) {
        super();
        this.options = void 0;
        this.parsed = void 0;
        this.skip = void 0;
        this.stop = void 0;
        if (cfg) {
          Object.assign(this, cfg);
        }
      }
      inRange(mouseX, mouseY, useFinalPosition) {
        const options2 = this.options;
        const { x, y } = this.getProps(["x", "y"], useFinalPosition);
        return Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2) < Math.pow(options2.hitRadius + options2.radius, 2);
      }
      inXRange(mouseX, useFinalPosition) {
        return inRange$1(this, mouseX, "x", useFinalPosition);
      }
      inYRange(mouseY, useFinalPosition) {
        return inRange$1(this, mouseY, "y", useFinalPosition);
      }
      getCenterPoint(useFinalPosition) {
        const { x, y } = this.getProps(["x", "y"], useFinalPosition);
        return { x, y };
      }
      size(options2) {
        options2 = options2 || this.options || {};
        let radius = options2.radius || 0;
        radius = Math.max(radius, radius && options2.hoverRadius || 0);
        const borderWidth = radius && options2.borderWidth || 0;
        return (radius + borderWidth) * 2;
      }
      draw(ctx, area) {
        const options2 = this.options;
        if (this.skip || options2.radius < 0.1 || !_isPointInArea(this, area, this.size(options2) / 2)) {
          return;
        }
        ctx.strokeStyle = options2.borderColor;
        ctx.lineWidth = options2.borderWidth;
        ctx.fillStyle = options2.backgroundColor;
        drawPoint(ctx, options2, this.x, this.y);
      }
      getRange() {
        const options2 = this.options || {};
        return options2.radius + options2.hitRadius;
      }
    };
    PointElement.id = "point";
    PointElement.defaults = {
      borderWidth: 1,
      hitRadius: 1,
      hoverBorderWidth: 1,
      hoverRadius: 4,
      pointStyle: "circle",
      radius: 3,
      rotation: 0
    };
    PointElement.defaultRoutes = {
      backgroundColor: "backgroundColor",
      borderColor: "borderColor"
    };
    BarElement = class extends Element {
      constructor(cfg) {
        super();
        this.options = void 0;
        this.horizontal = void 0;
        this.base = void 0;
        this.width = void 0;
        this.height = void 0;
        this.inflateAmount = void 0;
        if (cfg) {
          Object.assign(this, cfg);
        }
      }
      draw(ctx) {
        const { inflateAmount, options: { borderColor, backgroundColor } } = this;
        const { inner, outer } = boundingRects(this);
        const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;
        ctx.save();
        if (outer.w !== inner.w || outer.h !== inner.h) {
          ctx.beginPath();
          addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
          ctx.clip();
          addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
          ctx.fillStyle = borderColor;
          ctx.fill("evenodd");
        }
        ctx.beginPath();
        addRectPath(ctx, inflateRect(inner, inflateAmount));
        ctx.fillStyle = backgroundColor;
        ctx.fill();
        ctx.restore();
      }
      inRange(mouseX, mouseY, useFinalPosition) {
        return inRange(this, mouseX, mouseY, useFinalPosition);
      }
      inXRange(mouseX, useFinalPosition) {
        return inRange(this, mouseX, null, useFinalPosition);
      }
      inYRange(mouseY, useFinalPosition) {
        return inRange(this, null, mouseY, useFinalPosition);
      }
      getCenterPoint(useFinalPosition) {
        const { x, y, base: base2, horizontal } = this.getProps(["x", "y", "base", "horizontal"], useFinalPosition);
        return {
          x: horizontal ? (x + base2) / 2 : x,
          y: horizontal ? y : (y + base2) / 2
        };
      }
      getRange(axis) {
        return axis === "x" ? this.width / 2 : this.height / 2;
      }
    };
    BarElement.id = "bar";
    BarElement.defaults = {
      borderSkipped: "start",
      borderWidth: 0,
      borderRadius: 0,
      inflateAmount: "auto",
      pointStyle: void 0
    };
    BarElement.defaultRoutes = {
      backgroundColor: "backgroundColor",
      borderColor: "borderColor"
    };
    elements = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      ArcElement,
      LineElement,
      PointElement,
      BarElement
    });
    plugin_decimation = {
      id: "decimation",
      defaults: {
        algorithm: "min-max",
        enabled: false
      },
      beforeElementsUpdate: (chart, args, options2) => {
        if (!options2.enabled) {
          cleanDecimatedData(chart);
          return;
        }
        const availableWidth = chart.width;
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const { _data, indexAxis } = dataset;
          const meta = chart.getDatasetMeta(datasetIndex);
          const data = _data || dataset.data;
          if (resolve([indexAxis, chart.options.indexAxis]) === "y") {
            return;
          }
          if (meta.type !== "line") {
            return;
          }
          const xAxis = chart.scales[meta.xAxisID];
          if (xAxis.type !== "linear" && xAxis.type !== "time") {
            return;
          }
          if (chart.options.parsing) {
            return;
          }
          let { start, count } = getStartAndCountOfVisiblePointsSimplified(meta, data);
          const threshold = options2.threshold || 4 * availableWidth;
          if (count <= threshold) {
            cleanDecimatedDataset(dataset);
            return;
          }
          if (isNullOrUndef(_data)) {
            dataset._data = data;
            delete dataset.data;
            Object.defineProperty(dataset, "data", {
              configurable: true,
              enumerable: true,
              get: function() {
                return this._decimated;
              },
              set: function(d2) {
                this._data = d2;
              }
            });
          }
          let decimated;
          switch (options2.algorithm) {
            case "lttb":
              decimated = lttbDecimation(data, start, count, availableWidth, options2);
              break;
            case "min-max":
              decimated = minMaxDecimation(data, start, count, availableWidth);
              break;
            default:
              throw new Error(`Unsupported decimation algorithm '${options2.algorithm}'`);
          }
          dataset._decimated = decimated;
        });
      },
      destroy(chart) {
        cleanDecimatedData(chart);
      }
    };
    simpleArc = class {
      constructor(opts) {
        this.x = opts.x;
        this.y = opts.y;
        this.radius = opts.radius;
      }
      pathSegment(ctx, bounds, opts) {
        const { x, y, radius } = this;
        bounds = bounds || { start: 0, end: TAU };
        ctx.arc(x, y, radius, bounds.end, bounds.start, true);
        return !opts.bounds;
      }
      interpolate(point) {
        const { x, y, radius } = this;
        const angle = point.angle;
        return {
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          angle
        };
      }
    };
    plugin_filler = {
      id: "filler",
      afterDatasetsUpdate(chart, _args, options2) {
        const count = (chart.data.datasets || []).length;
        const sources = [];
        let meta, i, line, source;
        for (i = 0; i < count; ++i) {
          meta = chart.getDatasetMeta(i);
          line = meta.dataset;
          source = null;
          if (line && line.options && line instanceof LineElement) {
            source = {
              visible: chart.isDatasetVisible(i),
              index: i,
              fill: decodeFill(line, i, count),
              chart,
              axis: meta.controller.options.indexAxis,
              scale: meta.vScale,
              line
            };
          }
          meta.$filler = source;
          sources.push(source);
        }
        for (i = 0; i < count; ++i) {
          source = sources[i];
          if (!source || source.fill === false) {
            continue;
          }
          source.fill = resolveTarget(sources, i, options2.propagate);
        }
      },
      beforeDraw(chart, _args, options2) {
        const draw2 = options2.drawTime === "beforeDraw";
        const metasets = chart.getSortedVisibleDatasetMetas();
        const area = chart.chartArea;
        for (let i = metasets.length - 1; i >= 0; --i) {
          const source = metasets[i].$filler;
          if (!source) {
            continue;
          }
          source.line.updateControlPoints(area, source.axis);
          if (draw2) {
            drawfill(chart.ctx, source, area);
          }
        }
      },
      beforeDatasetsDraw(chart, _args, options2) {
        if (options2.drawTime !== "beforeDatasetsDraw") {
          return;
        }
        const metasets = chart.getSortedVisibleDatasetMetas();
        for (let i = metasets.length - 1; i >= 0; --i) {
          const source = metasets[i].$filler;
          if (source) {
            drawfill(chart.ctx, source, chart.chartArea);
          }
        }
      },
      beforeDatasetDraw(chart, args, options2) {
        const source = args.meta.$filler;
        if (!source || source.fill === false || options2.drawTime !== "beforeDatasetDraw") {
          return;
        }
        drawfill(chart.ctx, source, chart.chartArea);
      },
      defaults: {
        propagate: true,
        drawTime: "beforeDatasetDraw"
      }
    };
    getBoxSize = (labelOpts, fontSize) => {
      let { boxHeight = fontSize, boxWidth = fontSize } = labelOpts;
      if (labelOpts.usePointStyle) {
        boxHeight = Math.min(boxHeight, fontSize);
        boxWidth = Math.min(boxWidth, fontSize);
      }
      return {
        boxWidth,
        boxHeight,
        itemHeight: Math.max(fontSize, boxHeight)
      };
    };
    itemsEqual = (a, b) => a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index;
    Legend = class extends Element {
      constructor(config) {
        super();
        this._added = false;
        this.legendHitBoxes = [];
        this._hoveredItem = null;
        this.doughnutMode = false;
        this.chart = config.chart;
        this.options = config.options;
        this.ctx = config.ctx;
        this.legendItems = void 0;
        this.columnSizes = void 0;
        this.lineWidths = void 0;
        this.maxHeight = void 0;
        this.maxWidth = void 0;
        this.top = void 0;
        this.bottom = void 0;
        this.left = void 0;
        this.right = void 0;
        this.height = void 0;
        this.width = void 0;
        this._margins = void 0;
        this.position = void 0;
        this.weight = void 0;
        this.fullSize = void 0;
      }
      update(maxWidth, maxHeight, margins) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this._margins = margins;
        this.setDimensions();
        this.buildLabels();
        this.fit();
      }
      setDimensions() {
        if (this.isHorizontal()) {
          this.width = this.maxWidth;
          this.left = this._margins.left;
          this.right = this.width;
        } else {
          this.height = this.maxHeight;
          this.top = this._margins.top;
          this.bottom = this.height;
        }
      }
      buildLabels() {
        const labelOpts = this.options.labels || {};
        let legendItems = callback(labelOpts.generateLabels, [this.chart], this) || [];
        if (labelOpts.filter) {
          legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data));
        }
        if (labelOpts.sort) {
          legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, this.chart.data));
        }
        if (this.options.reverse) {
          legendItems.reverse();
        }
        this.legendItems = legendItems;
      }
      fit() {
        const { options: options2, ctx } = this;
        if (!options2.display) {
          this.width = this.height = 0;
          return;
        }
        const labelOpts = options2.labels;
        const labelFont = toFont(labelOpts.font);
        const fontSize = labelFont.size;
        const titleHeight = this._computeTitleHeight();
        const { boxWidth, itemHeight } = getBoxSize(labelOpts, fontSize);
        let width, height;
        ctx.font = labelFont.string;
        if (this.isHorizontal()) {
          width = this.maxWidth;
          height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
        } else {
          height = this.maxHeight;
          width = this._fitCols(titleHeight, fontSize, boxWidth, itemHeight) + 10;
        }
        this.width = Math.min(width, options2.maxWidth || this.maxWidth);
        this.height = Math.min(height, options2.maxHeight || this.maxHeight);
      }
      _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
        const { ctx, maxWidth, options: { labels: { padding } } } = this;
        const hitboxes = this.legendHitBoxes = [];
        const lineWidths = this.lineWidths = [0];
        const lineHeight = itemHeight + padding;
        let totalHeight = titleHeight;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        let row = -1;
        let top = -lineHeight;
        this.legendItems.forEach((legendItem, i) => {
          const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
          if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
            totalHeight += lineHeight;
            lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
            top += lineHeight;
            row++;
          }
          hitboxes[i] = { left: 0, top, row, width: itemWidth, height: itemHeight };
          lineWidths[lineWidths.length - 1] += itemWidth + padding;
        });
        return totalHeight;
      }
      _fitCols(titleHeight, fontSize, boxWidth, itemHeight) {
        const { ctx, maxHeight, options: { labels: { padding } } } = this;
        const hitboxes = this.legendHitBoxes = [];
        const columnSizes = this.columnSizes = [];
        const heightLimit = maxHeight - titleHeight;
        let totalWidth = padding;
        let currentColWidth = 0;
        let currentColHeight = 0;
        let left = 0;
        let col = 0;
        this.legendItems.forEach((legendItem, i) => {
          const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
          if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
            totalWidth += currentColWidth + padding;
            columnSizes.push({ width: currentColWidth, height: currentColHeight });
            left += currentColWidth + padding;
            col++;
            currentColWidth = currentColHeight = 0;
          }
          hitboxes[i] = { left, top: currentColHeight, col, width: itemWidth, height: itemHeight };
          currentColWidth = Math.max(currentColWidth, itemWidth);
          currentColHeight += itemHeight + padding;
        });
        totalWidth += currentColWidth;
        columnSizes.push({ width: currentColWidth, height: currentColHeight });
        return totalWidth;
      }
      adjustHitBoxes() {
        if (!this.options.display) {
          return;
        }
        const titleHeight = this._computeTitleHeight();
        const { legendHitBoxes: hitboxes, options: { align, labels: { padding }, rtl } } = this;
        const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
        if (this.isHorizontal()) {
          let row = 0;
          let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
          for (const hitbox of hitboxes) {
            if (row !== hitbox.row) {
              row = hitbox.row;
              left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
            }
            hitbox.top += this.top + titleHeight + padding;
            hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
            left += hitbox.width + padding;
          }
        } else {
          let col = 0;
          let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
          for (const hitbox of hitboxes) {
            if (hitbox.col !== col) {
              col = hitbox.col;
              top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
            }
            hitbox.top = top;
            hitbox.left += this.left + padding;
            hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
            top += hitbox.height + padding;
          }
        }
      }
      isHorizontal() {
        return this.options.position === "top" || this.options.position === "bottom";
      }
      draw() {
        if (this.options.display) {
          const ctx = this.ctx;
          clipArea(ctx, this);
          this._draw();
          unclipArea(ctx);
        }
      }
      _draw() {
        const { options: opts, columnSizes, lineWidths, ctx } = this;
        const { align, labels: labelOpts } = opts;
        const defaultColor = defaults.color;
        const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
        const labelFont = toFont(labelOpts.font);
        const { color: fontColor, padding } = labelOpts;
        const fontSize = labelFont.size;
        const halfFontSize = fontSize / 2;
        let cursor;
        this.drawTitle();
        ctx.textAlign = rtlHelper.textAlign("left");
        ctx.textBaseline = "middle";
        ctx.lineWidth = 0.5;
        ctx.font = labelFont.string;
        const { boxWidth, boxHeight, itemHeight } = getBoxSize(labelOpts, fontSize);
        const drawLegendBox = function(x, y, legendItem) {
          if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
            return;
          }
          ctx.save();
          const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
          ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
          ctx.lineCap = valueOrDefault(legendItem.lineCap, "butt");
          ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
          ctx.lineJoin = valueOrDefault(legendItem.lineJoin, "miter");
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);
          ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));
          if (labelOpts.usePointStyle) {
            const drawOptions = {
              radius: boxWidth * Math.SQRT2 / 2,
              pointStyle: legendItem.pointStyle,
              rotation: legendItem.rotation,
              borderWidth: lineWidth
            };
            const centerX = rtlHelper.xPlus(x, boxWidth / 2);
            const centerY = y + halfFontSize;
            drawPoint(ctx, drawOptions, centerX, centerY);
          } else {
            const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
            const xBoxLeft = rtlHelper.leftForLtr(x, boxWidth);
            const borderRadius = toTRBLCorners(legendItem.borderRadius);
            ctx.beginPath();
            if (Object.values(borderRadius).some((v) => v !== 0)) {
              addRoundedRectPath(ctx, {
                x: xBoxLeft,
                y: yBoxTop,
                w: boxWidth,
                h: boxHeight,
                radius: borderRadius
              });
            } else {
              ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
            }
            ctx.fill();
            if (lineWidth !== 0) {
              ctx.stroke();
            }
          }
          ctx.restore();
        };
        const fillText = function(x, y, legendItem) {
          renderText(ctx, legendItem.text, x, y + itemHeight / 2, labelFont, {
            strikethrough: legendItem.hidden,
            textAlign: rtlHelper.textAlign(legendItem.textAlign)
          });
        };
        const isHorizontal = this.isHorizontal();
        const titleHeight = this._computeTitleHeight();
        if (isHorizontal) {
          cursor = {
            x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]),
            y: this.top + padding + titleHeight,
            line: 0
          };
        } else {
          cursor = {
            x: this.left + padding,
            y: _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
            line: 0
          };
        }
        overrideTextDirection(this.ctx, opts.textDirection);
        const lineHeight = itemHeight + padding;
        this.legendItems.forEach((legendItem, i) => {
          ctx.strokeStyle = legendItem.fontColor || fontColor;
          ctx.fillStyle = legendItem.fontColor || fontColor;
          const textWidth = ctx.measureText(legendItem.text).width;
          const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
          const width = boxWidth + halfFontSize + textWidth;
          let x = cursor.x;
          let y = cursor.y;
          rtlHelper.setWidth(this.width);
          if (isHorizontal) {
            if (i > 0 && x + width + padding > this.right) {
              y = cursor.y += lineHeight;
              cursor.line++;
              x = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]);
            }
          } else if (i > 0 && y + lineHeight > this.bottom) {
            x = cursor.x = x + columnSizes[cursor.line].width + padding;
            cursor.line++;
            y = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height);
          }
          const realX = rtlHelper.x(x);
          drawLegendBox(realX, y, legendItem);
          x = _textX(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : this.right, opts.rtl);
          fillText(rtlHelper.x(x), y, legendItem);
          if (isHorizontal) {
            cursor.x += width + padding;
          } else {
            cursor.y += lineHeight;
          }
        });
        restoreTextDirection(this.ctx, opts.textDirection);
      }
      drawTitle() {
        const opts = this.options;
        const titleOpts = opts.title;
        const titleFont = toFont(titleOpts.font);
        const titlePadding = toPadding(titleOpts.padding);
        if (!titleOpts.display) {
          return;
        }
        const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
        const ctx = this.ctx;
        const position = titleOpts.position;
        const halfFontSize = titleFont.size / 2;
        const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
        let y;
        let left = this.left;
        let maxWidth = this.width;
        if (this.isHorizontal()) {
          maxWidth = Math.max(...this.lineWidths);
          y = this.top + topPaddingPlusHalfFontSize;
          left = _alignStartEnd(opts.align, left, this.right - maxWidth);
        } else {
          const maxHeight = this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0);
          y = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
        }
        const x = _alignStartEnd(position, left, left + maxWidth);
        ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
        ctx.textBaseline = "middle";
        ctx.strokeStyle = titleOpts.color;
        ctx.fillStyle = titleOpts.color;
        ctx.font = titleFont.string;
        renderText(ctx, titleOpts.text, x, y, titleFont);
      }
      _computeTitleHeight() {
        const titleOpts = this.options.title;
        const titleFont = toFont(titleOpts.font);
        const titlePadding = toPadding(titleOpts.padding);
        return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
      }
      _getLegendItemAt(x, y) {
        let i, hitBox, lh;
        if (_isBetween(x, this.left, this.right) && _isBetween(y, this.top, this.bottom)) {
          lh = this.legendHitBoxes;
          for (i = 0; i < lh.length; ++i) {
            hitBox = lh[i];
            if (_isBetween(x, hitBox.left, hitBox.left + hitBox.width) && _isBetween(y, hitBox.top, hitBox.top + hitBox.height)) {
              return this.legendItems[i];
            }
          }
        }
        return null;
      }
      handleEvent(e) {
        const opts = this.options;
        if (!isListened(e.type, opts)) {
          return;
        }
        const hoveredItem = this._getLegendItemAt(e.x, e.y);
        if (e.type === "mousemove") {
          const previous = this._hoveredItem;
          const sameItem = itemsEqual(previous, hoveredItem);
          if (previous && !sameItem) {
            callback(opts.onLeave, [e, previous, this], this);
          }
          this._hoveredItem = hoveredItem;
          if (hoveredItem && !sameItem) {
            callback(opts.onHover, [e, hoveredItem, this], this);
          }
        } else if (hoveredItem) {
          callback(opts.onClick, [e, hoveredItem, this], this);
        }
      }
    };
    plugin_legend = {
      id: "legend",
      _element: Legend,
      start(chart, _args, options2) {
        const legend = chart.legend = new Legend({ ctx: chart.ctx, options: options2, chart });
        layouts.configure(chart, legend, options2);
        layouts.addBox(chart, legend);
      },
      stop(chart) {
        layouts.removeBox(chart, chart.legend);
        delete chart.legend;
      },
      beforeUpdate(chart, _args, options2) {
        const legend = chart.legend;
        layouts.configure(chart, legend, options2);
        legend.options = options2;
      },
      afterUpdate(chart) {
        const legend = chart.legend;
        legend.buildLabels();
        legend.adjustHitBoxes();
      },
      afterEvent(chart, args) {
        if (!args.replay) {
          chart.legend.handleEvent(args.event);
        }
      },
      defaults: {
        display: true,
        position: "top",
        align: "center",
        fullSize: true,
        reverse: false,
        weight: 1e3,
        onClick(e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          if (ci.isDatasetVisible(index)) {
            ci.hide(index);
            legendItem.hidden = true;
          } else {
            ci.show(index);
            legendItem.hidden = false;
          }
        },
        onHover: null,
        onLeave: null,
        labels: {
          color: (ctx) => ctx.chart.options.color,
          boxWidth: 40,
          padding: 10,
          generateLabels(chart) {
            const datasets = chart.data.datasets;
            const { labels: { usePointStyle, pointStyle, textAlign, color: color2 } } = chart.legend.options;
            return chart._getSortedDatasetMetas().map((meta) => {
              const style = meta.controller.getStyle(usePointStyle ? 0 : void 0);
              const borderWidth = toPadding(style.borderWidth);
              return {
                text: datasets[meta.index].label,
                fillStyle: style.backgroundColor,
                fontColor: color2,
                hidden: !meta.visible,
                lineCap: style.borderCapStyle,
                lineDash: style.borderDash,
                lineDashOffset: style.borderDashOffset,
                lineJoin: style.borderJoinStyle,
                lineWidth: (borderWidth.width + borderWidth.height) / 4,
                strokeStyle: style.borderColor,
                pointStyle: pointStyle || style.pointStyle,
                rotation: style.rotation,
                textAlign: textAlign || style.textAlign,
                borderRadius: 0,
                datasetIndex: meta.index
              };
            }, this);
          }
        },
        title: {
          color: (ctx) => ctx.chart.options.color,
          display: false,
          position: "center",
          text: ""
        }
      },
      descriptors: {
        _scriptable: (name) => !name.startsWith("on"),
        labels: {
          _scriptable: (name) => !["generateLabels", "filter", "sort"].includes(name)
        }
      }
    };
    Title = class extends Element {
      constructor(config) {
        super();
        this.chart = config.chart;
        this.options = config.options;
        this.ctx = config.ctx;
        this._padding = void 0;
        this.top = void 0;
        this.bottom = void 0;
        this.left = void 0;
        this.right = void 0;
        this.width = void 0;
        this.height = void 0;
        this.position = void 0;
        this.weight = void 0;
        this.fullSize = void 0;
      }
      update(maxWidth, maxHeight) {
        const opts = this.options;
        this.left = 0;
        this.top = 0;
        if (!opts.display) {
          this.width = this.height = this.right = this.bottom = 0;
          return;
        }
        this.width = this.right = maxWidth;
        this.height = this.bottom = maxHeight;
        const lineCount = isArray(opts.text) ? opts.text.length : 1;
        this._padding = toPadding(opts.padding);
        const textSize = lineCount * toFont(opts.font).lineHeight + this._padding.height;
        if (this.isHorizontal()) {
          this.height = textSize;
        } else {
          this.width = textSize;
        }
      }
      isHorizontal() {
        const pos = this.options.position;
        return pos === "top" || pos === "bottom";
      }
      _drawArgs(offset) {
        const { top, left, bottom, right, options: options2 } = this;
        const align = options2.align;
        let rotation = 0;
        let maxWidth, titleX, titleY;
        if (this.isHorizontal()) {
          titleX = _alignStartEnd(align, left, right);
          titleY = top + offset;
          maxWidth = right - left;
        } else {
          if (options2.position === "left") {
            titleX = left + offset;
            titleY = _alignStartEnd(align, bottom, top);
            rotation = PI * -0.5;
          } else {
            titleX = right - offset;
            titleY = _alignStartEnd(align, top, bottom);
            rotation = PI * 0.5;
          }
          maxWidth = bottom - top;
        }
        return { titleX, titleY, maxWidth, rotation };
      }
      draw() {
        const ctx = this.ctx;
        const opts = this.options;
        if (!opts.display) {
          return;
        }
        const fontOpts = toFont(opts.font);
        const lineHeight = fontOpts.lineHeight;
        const offset = lineHeight / 2 + this._padding.top;
        const { titleX, titleY, maxWidth, rotation } = this._drawArgs(offset);
        renderText(ctx, opts.text, 0, 0, fontOpts, {
          color: opts.color,
          maxWidth,
          rotation,
          textAlign: _toLeftRightCenter(opts.align),
          textBaseline: "middle",
          translation: [titleX, titleY]
        });
      }
    };
    plugin_title = {
      id: "title",
      _element: Title,
      start(chart, _args, options2) {
        createTitle(chart, options2);
      },
      stop(chart) {
        const titleBlock = chart.titleBlock;
        layouts.removeBox(chart, titleBlock);
        delete chart.titleBlock;
      },
      beforeUpdate(chart, _args, options2) {
        const title = chart.titleBlock;
        layouts.configure(chart, title, options2);
        title.options = options2;
      },
      defaults: {
        align: "center",
        display: false,
        font: {
          weight: "bold"
        },
        fullSize: true,
        padding: 10,
        position: "top",
        text: "",
        weight: 2e3
      },
      defaultRoutes: {
        color: "color"
      },
      descriptors: {
        _scriptable: true,
        _indexable: false
      }
    };
    map = new WeakMap();
    plugin_subtitle = {
      id: "subtitle",
      start(chart, _args, options2) {
        const title = new Title({
          ctx: chart.ctx,
          options: options2,
          chart
        });
        layouts.configure(chart, title, options2);
        layouts.addBox(chart, title);
        map.set(chart, title);
      },
      stop(chart) {
        layouts.removeBox(chart, map.get(chart));
        map.delete(chart);
      },
      beforeUpdate(chart, _args, options2) {
        const title = map.get(chart);
        layouts.configure(chart, title, options2);
        title.options = options2;
      },
      defaults: {
        align: "center",
        display: false,
        font: {
          weight: "normal"
        },
        fullSize: true,
        padding: 0,
        position: "top",
        text: "",
        weight: 1500
      },
      defaultRoutes: {
        color: "color"
      },
      descriptors: {
        _scriptable: true,
        _indexable: false
      }
    };
    positioners = {
      average(items) {
        if (!items.length) {
          return false;
        }
        let i, len;
        let x = 0;
        let y = 0;
        let count = 0;
        for (i = 0, len = items.length; i < len; ++i) {
          const el = items[i].element;
          if (el && el.hasValue()) {
            const pos = el.tooltipPosition();
            x += pos.x;
            y += pos.y;
            ++count;
          }
        }
        return {
          x: x / count,
          y: y / count
        };
      },
      nearest(items, eventPosition) {
        if (!items.length) {
          return false;
        }
        let x = eventPosition.x;
        let y = eventPosition.y;
        let minDistance = Number.POSITIVE_INFINITY;
        let i, len, nearestElement;
        for (i = 0, len = items.length; i < len; ++i) {
          const el = items[i].element;
          if (el && el.hasValue()) {
            const center = el.getCenterPoint();
            const d2 = distanceBetweenPoints(eventPosition, center);
            if (d2 < minDistance) {
              minDistance = d2;
              nearestElement = el;
            }
          }
        }
        if (nearestElement) {
          const tp = nearestElement.tooltipPosition();
          x = tp.x;
          y = tp.y;
        }
        return {
          x,
          y
        };
      }
    };
    Tooltip = class extends Element {
      constructor(config) {
        super();
        this.opacity = 0;
        this._active = [];
        this._chart = config._chart;
        this._eventPosition = void 0;
        this._size = void 0;
        this._cachedAnimations = void 0;
        this._tooltipItems = [];
        this.$animations = void 0;
        this.$context = void 0;
        this.options = config.options;
        this.dataPoints = void 0;
        this.title = void 0;
        this.beforeBody = void 0;
        this.body = void 0;
        this.afterBody = void 0;
        this.footer = void 0;
        this.xAlign = void 0;
        this.yAlign = void 0;
        this.x = void 0;
        this.y = void 0;
        this.height = void 0;
        this.width = void 0;
        this.caretX = void 0;
        this.caretY = void 0;
        this.labelColors = void 0;
        this.labelPointStyles = void 0;
        this.labelTextColors = void 0;
      }
      initialize(options2) {
        this.options = options2;
        this._cachedAnimations = void 0;
        this.$context = void 0;
      }
      _resolveAnimations() {
        const cached = this._cachedAnimations;
        if (cached) {
          return cached;
        }
        const chart = this._chart;
        const options2 = this.options.setContext(this.getContext());
        const opts = options2.enabled && chart.options.animation && options2.animations;
        const animations = new Animations(this._chart, opts);
        if (opts._cacheable) {
          this._cachedAnimations = Object.freeze(animations);
        }
        return animations;
      }
      getContext() {
        return this.$context || (this.$context = createTooltipContext(this._chart.getContext(), this, this._tooltipItems));
      }
      getTitle(context, options2) {
        const { callbacks } = options2;
        const beforeTitle = callbacks.beforeTitle.apply(this, [context]);
        const title = callbacks.title.apply(this, [context]);
        const afterTitle = callbacks.afterTitle.apply(this, [context]);
        let lines = [];
        lines = pushOrConcat(lines, splitNewlines(beforeTitle));
        lines = pushOrConcat(lines, splitNewlines(title));
        lines = pushOrConcat(lines, splitNewlines(afterTitle));
        return lines;
      }
      getBeforeBody(tooltipItems, options2) {
        return getBeforeAfterBodyLines(options2.callbacks.beforeBody.apply(this, [tooltipItems]));
      }
      getBody(tooltipItems, options2) {
        const { callbacks } = options2;
        const bodyItems = [];
        each2(tooltipItems, (context) => {
          const bodyItem = {
            before: [],
            lines: [],
            after: []
          };
          const scoped = overrideCallbacks(callbacks, context);
          pushOrConcat(bodyItem.before, splitNewlines(scoped.beforeLabel.call(this, context)));
          pushOrConcat(bodyItem.lines, scoped.label.call(this, context));
          pushOrConcat(bodyItem.after, splitNewlines(scoped.afterLabel.call(this, context)));
          bodyItems.push(bodyItem);
        });
        return bodyItems;
      }
      getAfterBody(tooltipItems, options2) {
        return getBeforeAfterBodyLines(options2.callbacks.afterBody.apply(this, [tooltipItems]));
      }
      getFooter(tooltipItems, options2) {
        const { callbacks } = options2;
        const beforeFooter = callbacks.beforeFooter.apply(this, [tooltipItems]);
        const footer = callbacks.footer.apply(this, [tooltipItems]);
        const afterFooter = callbacks.afterFooter.apply(this, [tooltipItems]);
        let lines = [];
        lines = pushOrConcat(lines, splitNewlines(beforeFooter));
        lines = pushOrConcat(lines, splitNewlines(footer));
        lines = pushOrConcat(lines, splitNewlines(afterFooter));
        return lines;
      }
      _createItems(options2) {
        const active = this._active;
        const data = this._chart.data;
        const labelColors = [];
        const labelPointStyles = [];
        const labelTextColors = [];
        let tooltipItems = [];
        let i, len;
        for (i = 0, len = active.length; i < len; ++i) {
          tooltipItems.push(createTooltipItem(this._chart, active[i]));
        }
        if (options2.filter) {
          tooltipItems = tooltipItems.filter((element, index, array) => options2.filter(element, index, array, data));
        }
        if (options2.itemSort) {
          tooltipItems = tooltipItems.sort((a, b) => options2.itemSort(a, b, data));
        }
        each2(tooltipItems, (context) => {
          const scoped = overrideCallbacks(options2.callbacks, context);
          labelColors.push(scoped.labelColor.call(this, context));
          labelPointStyles.push(scoped.labelPointStyle.call(this, context));
          labelTextColors.push(scoped.labelTextColor.call(this, context));
        });
        this.labelColors = labelColors;
        this.labelPointStyles = labelPointStyles;
        this.labelTextColors = labelTextColors;
        this.dataPoints = tooltipItems;
        return tooltipItems;
      }
      update(changed, replay) {
        const options2 = this.options.setContext(this.getContext());
        const active = this._active;
        let properties;
        let tooltipItems = [];
        if (!active.length) {
          if (this.opacity !== 0) {
            properties = {
              opacity: 0
            };
          }
        } else {
          const position = positioners[options2.position].call(this, active, this._eventPosition);
          tooltipItems = this._createItems(options2);
          this.title = this.getTitle(tooltipItems, options2);
          this.beforeBody = this.getBeforeBody(tooltipItems, options2);
          this.body = this.getBody(tooltipItems, options2);
          this.afterBody = this.getAfterBody(tooltipItems, options2);
          this.footer = this.getFooter(tooltipItems, options2);
          const size = this._size = getTooltipSize(this, options2);
          const positionAndSize = Object.assign({}, position, size);
          const alignment = determineAlignment(this._chart, options2, positionAndSize);
          const backgroundPoint = getBackgroundPoint(options2, positionAndSize, alignment, this._chart);
          this.xAlign = alignment.xAlign;
          this.yAlign = alignment.yAlign;
          properties = {
            opacity: 1,
            x: backgroundPoint.x,
            y: backgroundPoint.y,
            width: size.width,
            height: size.height,
            caretX: position.x,
            caretY: position.y
          };
        }
        this._tooltipItems = tooltipItems;
        this.$context = void 0;
        if (properties) {
          this._resolveAnimations().update(this, properties);
        }
        if (changed && options2.external) {
          options2.external.call(this, { chart: this._chart, tooltip: this, replay });
        }
      }
      drawCaret(tooltipPoint, ctx, size, options2) {
        const caretPosition = this.getCaretPosition(tooltipPoint, size, options2);
        ctx.lineTo(caretPosition.x1, caretPosition.y1);
        ctx.lineTo(caretPosition.x2, caretPosition.y2);
        ctx.lineTo(caretPosition.x3, caretPosition.y3);
      }
      getCaretPosition(tooltipPoint, size, options2) {
        const { xAlign, yAlign } = this;
        const { caretSize, cornerRadius } = options2;
        const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
        const { x: ptX, y: ptY } = tooltipPoint;
        const { width, height } = size;
        let x1, x2, x3, y1, y2, y3;
        if (yAlign === "center") {
          y2 = ptY + height / 2;
          if (xAlign === "left") {
            x1 = ptX;
            x2 = x1 - caretSize;
            y1 = y2 + caretSize;
            y3 = y2 - caretSize;
          } else {
            x1 = ptX + width;
            x2 = x1 + caretSize;
            y1 = y2 - caretSize;
            y3 = y2 + caretSize;
          }
          x3 = x1;
        } else {
          if (xAlign === "left") {
            x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
          } else if (xAlign === "right") {
            x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
          } else {
            x2 = this.caretX;
          }
          if (yAlign === "top") {
            y1 = ptY;
            y2 = y1 - caretSize;
            x1 = x2 - caretSize;
            x3 = x2 + caretSize;
          } else {
            y1 = ptY + height;
            y2 = y1 + caretSize;
            x1 = x2 + caretSize;
            x3 = x2 - caretSize;
          }
          y3 = y1;
        }
        return { x1, x2, x3, y1, y2, y3 };
      }
      drawTitle(pt, ctx, options2) {
        const title = this.title;
        const length = title.length;
        let titleFont, titleSpacing, i;
        if (length) {
          const rtlHelper = getRtlAdapter(options2.rtl, this.x, this.width);
          pt.x = getAlignedX(this, options2.titleAlign, options2);
          ctx.textAlign = rtlHelper.textAlign(options2.titleAlign);
          ctx.textBaseline = "middle";
          titleFont = toFont(options2.titleFont);
          titleSpacing = options2.titleSpacing;
          ctx.fillStyle = options2.titleColor;
          ctx.font = titleFont.string;
          for (i = 0; i < length; ++i) {
            ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
            pt.y += titleFont.lineHeight + titleSpacing;
            if (i + 1 === length) {
              pt.y += options2.titleMarginBottom - titleSpacing;
            }
          }
        }
      }
      _drawColorBox(ctx, pt, i, rtlHelper, options2) {
        const labelColors = this.labelColors[i];
        const labelPointStyle = this.labelPointStyles[i];
        const { boxHeight, boxWidth, boxPadding } = options2;
        const bodyFont = toFont(options2.bodyFont);
        const colorX = getAlignedX(this, "left", options2);
        const rtlColorX = rtlHelper.x(colorX);
        const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
        const colorY = pt.y + yOffSet;
        if (options2.usePointStyle) {
          const drawOptions = {
            radius: Math.min(boxWidth, boxHeight) / 2,
            pointStyle: labelPointStyle.pointStyle,
            rotation: labelPointStyle.rotation,
            borderWidth: 1
          };
          const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
          const centerY = colorY + boxHeight / 2;
          ctx.strokeStyle = options2.multiKeyBackground;
          ctx.fillStyle = options2.multiKeyBackground;
          drawPoint(ctx, drawOptions, centerX, centerY);
          ctx.strokeStyle = labelColors.borderColor;
          ctx.fillStyle = labelColors.backgroundColor;
          drawPoint(ctx, drawOptions, centerX, centerY);
        } else {
          ctx.lineWidth = labelColors.borderWidth || 1;
          ctx.strokeStyle = labelColors.borderColor;
          ctx.setLineDash(labelColors.borderDash || []);
          ctx.lineDashOffset = labelColors.borderDashOffset || 0;
          const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth - boxPadding);
          const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - boxPadding - 2);
          const borderRadius = toTRBLCorners(labelColors.borderRadius);
          if (Object.values(borderRadius).some((v) => v !== 0)) {
            ctx.beginPath();
            ctx.fillStyle = options2.multiKeyBackground;
            addRoundedRectPath(ctx, {
              x: outerX,
              y: colorY,
              w: boxWidth,
              h: boxHeight,
              radius: borderRadius
            });
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = labelColors.backgroundColor;
            ctx.beginPath();
            addRoundedRectPath(ctx, {
              x: innerX,
              y: colorY + 1,
              w: boxWidth - 2,
              h: boxHeight - 2,
              radius: borderRadius
            });
            ctx.fill();
          } else {
            ctx.fillStyle = options2.multiKeyBackground;
            ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
            ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
            ctx.fillStyle = labelColors.backgroundColor;
            ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
          }
        }
        ctx.fillStyle = this.labelTextColors[i];
      }
      drawBody(pt, ctx, options2) {
        const { body: body4 } = this;
        const { bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth, boxPadding } = options2;
        const bodyFont = toFont(options2.bodyFont);
        let bodyLineHeight = bodyFont.lineHeight;
        let xLinePadding = 0;
        const rtlHelper = getRtlAdapter(options2.rtl, this.x, this.width);
        const fillLineOfText = function(line) {
          ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
          pt.y += bodyLineHeight + bodySpacing;
        };
        const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
        let bodyItem, textColor, lines, i, j, ilen, jlen;
        ctx.textAlign = bodyAlign;
        ctx.textBaseline = "middle";
        ctx.font = bodyFont.string;
        pt.x = getAlignedX(this, bodyAlignForCalculation, options2);
        ctx.fillStyle = options2.bodyColor;
        each2(this.beforeBody, fillLineOfText);
        xLinePadding = displayColors && bodyAlignForCalculation !== "right" ? bodyAlign === "center" ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
        for (i = 0, ilen = body4.length; i < ilen; ++i) {
          bodyItem = body4[i];
          textColor = this.labelTextColors[i];
          ctx.fillStyle = textColor;
          each2(bodyItem.before, fillLineOfText);
          lines = bodyItem.lines;
          if (displayColors && lines.length) {
            this._drawColorBox(ctx, pt, i, rtlHelper, options2);
            bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
          }
          for (j = 0, jlen = lines.length; j < jlen; ++j) {
            fillLineOfText(lines[j]);
            bodyLineHeight = bodyFont.lineHeight;
          }
          each2(bodyItem.after, fillLineOfText);
        }
        xLinePadding = 0;
        bodyLineHeight = bodyFont.lineHeight;
        each2(this.afterBody, fillLineOfText);
        pt.y -= bodySpacing;
      }
      drawFooter(pt, ctx, options2) {
        const footer = this.footer;
        const length = footer.length;
        let footerFont, i;
        if (length) {
          const rtlHelper = getRtlAdapter(options2.rtl, this.x, this.width);
          pt.x = getAlignedX(this, options2.footerAlign, options2);
          pt.y += options2.footerMarginTop;
          ctx.textAlign = rtlHelper.textAlign(options2.footerAlign);
          ctx.textBaseline = "middle";
          footerFont = toFont(options2.footerFont);
          ctx.fillStyle = options2.footerColor;
          ctx.font = footerFont.string;
          for (i = 0; i < length; ++i) {
            ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
            pt.y += footerFont.lineHeight + options2.footerSpacing;
          }
        }
      }
      drawBackground(pt, ctx, tooltipSize, options2) {
        const { xAlign, yAlign } = this;
        const { x, y } = pt;
        const { width, height } = tooltipSize;
        const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(options2.cornerRadius);
        ctx.fillStyle = options2.backgroundColor;
        ctx.strokeStyle = options2.borderColor;
        ctx.lineWidth = options2.borderWidth;
        ctx.beginPath();
        ctx.moveTo(x + topLeft, y);
        if (yAlign === "top") {
          this.drawCaret(pt, ctx, tooltipSize, options2);
        }
        ctx.lineTo(x + width - topRight, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
        if (yAlign === "center" && xAlign === "right") {
          this.drawCaret(pt, ctx, tooltipSize, options2);
        }
        ctx.lineTo(x + width, y + height - bottomRight);
        ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
        if (yAlign === "bottom") {
          this.drawCaret(pt, ctx, tooltipSize, options2);
        }
        ctx.lineTo(x + bottomLeft, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
        if (yAlign === "center" && xAlign === "left") {
          this.drawCaret(pt, ctx, tooltipSize, options2);
        }
        ctx.lineTo(x, y + topLeft);
        ctx.quadraticCurveTo(x, y, x + topLeft, y);
        ctx.closePath();
        ctx.fill();
        if (options2.borderWidth > 0) {
          ctx.stroke();
        }
      }
      _updateAnimationTarget(options2) {
        const chart = this._chart;
        const anims = this.$animations;
        const animX = anims && anims.x;
        const animY = anims && anims.y;
        if (animX || animY) {
          const position = positioners[options2.position].call(this, this._active, this._eventPosition);
          if (!position) {
            return;
          }
          const size = this._size = getTooltipSize(this, options2);
          const positionAndSize = Object.assign({}, position, this._size);
          const alignment = determineAlignment(chart, options2, positionAndSize);
          const point = getBackgroundPoint(options2, positionAndSize, alignment, chart);
          if (animX._to !== point.x || animY._to !== point.y) {
            this.xAlign = alignment.xAlign;
            this.yAlign = alignment.yAlign;
            this.width = size.width;
            this.height = size.height;
            this.caretX = position.x;
            this.caretY = position.y;
            this._resolveAnimations().update(this, point);
          }
        }
      }
      draw(ctx) {
        const options2 = this.options.setContext(this.getContext());
        let opacity = this.opacity;
        if (!opacity) {
          return;
        }
        this._updateAnimationTarget(options2);
        const tooltipSize = {
          width: this.width,
          height: this.height
        };
        const pt = {
          x: this.x,
          y: this.y
        };
        opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
        const padding = toPadding(options2.padding);
        const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
        if (options2.enabled && hasTooltipContent) {
          ctx.save();
          ctx.globalAlpha = opacity;
          this.drawBackground(pt, ctx, tooltipSize, options2);
          overrideTextDirection(ctx, options2.textDirection);
          pt.y += padding.top;
          this.drawTitle(pt, ctx, options2);
          this.drawBody(pt, ctx, options2);
          this.drawFooter(pt, ctx, options2);
          restoreTextDirection(ctx, options2.textDirection);
          ctx.restore();
        }
      }
      getActiveElements() {
        return this._active || [];
      }
      setActiveElements(activeElements, eventPosition) {
        const lastActive = this._active;
        const active = activeElements.map(({ datasetIndex, index }) => {
          const meta = this._chart.getDatasetMeta(datasetIndex);
          if (!meta) {
            throw new Error("Cannot find a dataset at index " + datasetIndex);
          }
          return {
            datasetIndex,
            element: meta.data[index],
            index
          };
        });
        const changed = !_elementsEqual(lastActive, active);
        const positionChanged = this._positionChanged(active, eventPosition);
        if (changed || positionChanged) {
          this._active = active;
          this._eventPosition = eventPosition;
          this.update(true);
        }
      }
      handleEvent(e, replay) {
        const options2 = this.options;
        const lastActive = this._active || [];
        let changed = false;
        let active = [];
        if (e.type !== "mouseout") {
          active = this._chart.getElementsAtEventForMode(e, options2.mode, options2, replay);
          if (options2.reverse) {
            active.reverse();
          }
        }
        const positionChanged = this._positionChanged(active, e);
        changed = replay || !_elementsEqual(active, lastActive) || positionChanged;
        if (changed) {
          this._active = active;
          if (options2.enabled || options2.external) {
            this._eventPosition = {
              x: e.x,
              y: e.y
            };
            this.update(true, replay);
          }
        }
        return changed;
      }
      _positionChanged(active, e) {
        const { caretX, caretY, options: options2 } = this;
        const position = positioners[options2.position].call(this, active, e);
        return position !== false && (caretX !== position.x || caretY !== position.y);
      }
    };
    Tooltip.positioners = positioners;
    plugin_tooltip = {
      id: "tooltip",
      _element: Tooltip,
      positioners,
      afterInit(chart, _args, options2) {
        if (options2) {
          chart.tooltip = new Tooltip({ _chart: chart, options: options2 });
        }
      },
      beforeUpdate(chart, _args, options2) {
        if (chart.tooltip) {
          chart.tooltip.initialize(options2);
        }
      },
      reset(chart, _args, options2) {
        if (chart.tooltip) {
          chart.tooltip.initialize(options2);
        }
      },
      afterDraw(chart) {
        const tooltip = chart.tooltip;
        const args = {
          tooltip
        };
        if (chart.notifyPlugins("beforeTooltipDraw", args) === false) {
          return;
        }
        if (tooltip) {
          tooltip.draw(chart.ctx);
        }
        chart.notifyPlugins("afterTooltipDraw", args);
      },
      afterEvent(chart, args) {
        if (chart.tooltip) {
          const useFinalPosition = args.replay;
          if (chart.tooltip.handleEvent(args.event, useFinalPosition)) {
            args.changed = true;
          }
        }
      },
      defaults: {
        enabled: true,
        external: null,
        position: "average",
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        titleFont: {
          weight: "bold"
        },
        titleSpacing: 2,
        titleMarginBottom: 6,
        titleAlign: "left",
        bodyColor: "#fff",
        bodySpacing: 2,
        bodyFont: {},
        bodyAlign: "left",
        footerColor: "#fff",
        footerSpacing: 2,
        footerMarginTop: 6,
        footerFont: {
          weight: "bold"
        },
        footerAlign: "left",
        padding: 6,
        caretPadding: 2,
        caretSize: 5,
        cornerRadius: 6,
        boxHeight: (ctx, opts) => opts.bodyFont.size,
        boxWidth: (ctx, opts) => opts.bodyFont.size,
        multiKeyBackground: "#fff",
        displayColors: true,
        boxPadding: 0,
        borderColor: "rgba(0,0,0,0)",
        borderWidth: 0,
        animation: {
          duration: 400,
          easing: "easeOutQuart"
        },
        animations: {
          numbers: {
            type: "number",
            properties: ["x", "y", "width", "height", "caretX", "caretY"]
          },
          opacity: {
            easing: "linear",
            duration: 200
          }
        },
        callbacks: {
          beforeTitle: noop,
          title(tooltipItems) {
            if (tooltipItems.length > 0) {
              const item = tooltipItems[0];
              const labels = item.chart.data.labels;
              const labelCount = labels ? labels.length : 0;
              if (this && this.options && this.options.mode === "dataset") {
                return item.dataset.label || "";
              } else if (item.label) {
                return item.label;
              } else if (labelCount > 0 && item.dataIndex < labelCount) {
                return labels[item.dataIndex];
              }
            }
            return "";
          },
          afterTitle: noop,
          beforeBody: noop,
          beforeLabel: noop,
          label(tooltipItem) {
            if (this && this.options && this.options.mode === "dataset") {
              return tooltipItem.label + ": " + tooltipItem.formattedValue || tooltipItem.formattedValue;
            }
            let label = tooltipItem.dataset.label || "";
            if (label) {
              label += ": ";
            }
            const value = tooltipItem.formattedValue;
            if (!isNullOrUndef(value)) {
              label += value;
            }
            return label;
          },
          labelColor(tooltipItem) {
            const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
            const options2 = meta.controller.getStyle(tooltipItem.dataIndex);
            return {
              borderColor: options2.borderColor,
              backgroundColor: options2.backgroundColor,
              borderWidth: options2.borderWidth,
              borderDash: options2.borderDash,
              borderDashOffset: options2.borderDashOffset,
              borderRadius: 0
            };
          },
          labelTextColor() {
            return this.options.bodyColor;
          },
          labelPointStyle(tooltipItem) {
            const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
            const options2 = meta.controller.getStyle(tooltipItem.dataIndex);
            return {
              pointStyle: options2.pointStyle,
              rotation: options2.rotation
            };
          },
          afterLabel: noop,
          afterBody: noop,
          beforeFooter: noop,
          footer: noop,
          afterFooter: noop
        }
      },
      defaultRoutes: {
        bodyFont: "font",
        footerFont: "font",
        titleFont: "font"
      },
      descriptors: {
        _scriptable: (name) => name !== "filter" && name !== "itemSort" && name !== "external",
        _indexable: false,
        callbacks: {
          _scriptable: false,
          _indexable: false
        },
        animation: {
          _fallback: false
        },
        animations: {
          _fallback: "animation"
        }
      },
      additionalOptionScopes: ["interaction"]
    };
    plugins = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      Decimation: plugin_decimation,
      Filler: plugin_filler,
      Legend: plugin_legend,
      SubTitle: plugin_subtitle,
      Title: plugin_title,
      Tooltip: plugin_tooltip
    });
    addIfString = (labels, raw, index, addedLabels) => {
      if (typeof raw === "string") {
        index = labels.push(raw) - 1;
        addedLabels.unshift({ index, label: raw });
      } else if (isNaN(raw)) {
        index = null;
      }
      return index;
    };
    validIndex = (index, max) => index === null ? null : _limitValue(Math.round(index), 0, max);
    CategoryScale = class extends Scale {
      constructor(cfg) {
        super(cfg);
        this._startValue = void 0;
        this._valueRange = 0;
        this._addedLabels = [];
      }
      init(scaleOptions) {
        const added = this._addedLabels;
        if (added.length) {
          const labels = this.getLabels();
          for (const { index, label } of added) {
            if (labels[index] === label) {
              labels.splice(index, 1);
            }
          }
          this._addedLabels = [];
        }
        super.init(scaleOptions);
      }
      parse(raw, index) {
        if (isNullOrUndef(raw)) {
          return null;
        }
        const labels = this.getLabels();
        index = isFinite(index) && labels[index] === raw ? index : findOrAddLabel(labels, raw, valueOrDefault(index, raw), this._addedLabels);
        return validIndex(index, labels.length - 1);
      }
      determineDataLimits() {
        const { minDefined, maxDefined } = this.getUserBounds();
        let { min, max } = this.getMinMax(true);
        if (this.options.bounds === "ticks") {
          if (!minDefined) {
            min = 0;
          }
          if (!maxDefined) {
            max = this.getLabels().length - 1;
          }
        }
        this.min = min;
        this.max = max;
      }
      buildTicks() {
        const min = this.min;
        const max = this.max;
        const offset = this.options.offset;
        const ticks = [];
        let labels = this.getLabels();
        labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
        this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
        this._startValue = this.min - (offset ? 0.5 : 0);
        for (let value = min; value <= max; value++) {
          ticks.push({ value });
        }
        return ticks;
      }
      getLabelForValue(value) {
        const labels = this.getLabels();
        if (value >= 0 && value < labels.length) {
          return labels[value];
        }
        return value;
      }
      configure() {
        super.configure();
        if (!this.isHorizontal()) {
          this._reversePixels = !this._reversePixels;
        }
      }
      getPixelForValue(value) {
        if (typeof value !== "number") {
          value = this.parse(value);
        }
        return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
      }
      getPixelForTick(index) {
        const ticks = this.ticks;
        if (index < 0 || index > ticks.length - 1) {
          return null;
        }
        return this.getPixelForValue(ticks[index].value);
      }
      getValueForPixel(pixel) {
        return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
      }
      getBasePixel() {
        return this.bottom;
      }
    };
    CategoryScale.id = "category";
    CategoryScale.defaults = {
      ticks: {
        callback: CategoryScale.prototype.getLabelForValue
      }
    };
    LinearScaleBase = class extends Scale {
      constructor(cfg) {
        super(cfg);
        this.start = void 0;
        this.end = void 0;
        this._startValue = void 0;
        this._endValue = void 0;
        this._valueRange = 0;
      }
      parse(raw, index) {
        if (isNullOrUndef(raw)) {
          return null;
        }
        if ((typeof raw === "number" || raw instanceof Number) && !isFinite(+raw)) {
          return null;
        }
        return +raw;
      }
      handleTickRangeOptions() {
        const { beginAtZero } = this.options;
        const { minDefined, maxDefined } = this.getUserBounds();
        let { min, max } = this;
        const setMin = (v) => min = minDefined ? min : v;
        const setMax = (v) => max = maxDefined ? max : v;
        if (beginAtZero) {
          const minSign = sign(min);
          const maxSign = sign(max);
          if (minSign < 0 && maxSign < 0) {
            setMax(0);
          } else if (minSign > 0 && maxSign > 0) {
            setMin(0);
          }
        }
        if (min === max) {
          let offset = 1;
          if (max >= Number.MAX_SAFE_INTEGER || min <= Number.MIN_SAFE_INTEGER) {
            offset = Math.abs(max * 0.05);
          }
          setMax(max + offset);
          if (!beginAtZero) {
            setMin(min - offset);
          }
        }
        this.min = min;
        this.max = max;
      }
      getTickLimit() {
        const tickOpts = this.options.ticks;
        let { maxTicksLimit, stepSize } = tickOpts;
        let maxTicks;
        if (stepSize) {
          maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
          if (maxTicks > 1e3) {
            console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
            maxTicks = 1e3;
          }
        } else {
          maxTicks = this.computeTickLimit();
          maxTicksLimit = maxTicksLimit || 11;
        }
        if (maxTicksLimit) {
          maxTicks = Math.min(maxTicksLimit, maxTicks);
        }
        return maxTicks;
      }
      computeTickLimit() {
        return Number.POSITIVE_INFINITY;
      }
      buildTicks() {
        const opts = this.options;
        const tickOpts = opts.ticks;
        let maxTicks = this.getTickLimit();
        maxTicks = Math.max(2, maxTicks);
        const numericGeneratorOptions = {
          maxTicks,
          bounds: opts.bounds,
          min: opts.min,
          max: opts.max,
          precision: tickOpts.precision,
          step: tickOpts.stepSize,
          count: tickOpts.count,
          maxDigits: this._maxDigits(),
          horizontal: this.isHorizontal(),
          minRotation: tickOpts.minRotation || 0,
          includeBounds: tickOpts.includeBounds !== false
        };
        const dataRange = this._range || this;
        const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
        if (opts.bounds === "ticks") {
          _setMinAndMaxByKey(ticks, this, "value");
        }
        if (opts.reverse) {
          ticks.reverse();
          this.start = this.max;
          this.end = this.min;
        } else {
          this.start = this.min;
          this.end = this.max;
        }
        return ticks;
      }
      configure() {
        const ticks = this.ticks;
        let start = this.min;
        let end = this.max;
        super.configure();
        if (this.options.offset && ticks.length) {
          const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
          start -= offset;
          end += offset;
        }
        this._startValue = start;
        this._endValue = end;
        this._valueRange = end - start;
      }
      getLabelForValue(value) {
        return formatNumber(value, this.chart.options.locale, this.options.ticks.format);
      }
    };
    LinearScale = class extends LinearScaleBase {
      determineDataLimits() {
        const { min, max } = this.getMinMax(true);
        this.min = isNumberFinite(min) ? min : 0;
        this.max = isNumberFinite(max) ? max : 1;
        this.handleTickRangeOptions();
      }
      computeTickLimit() {
        const horizontal = this.isHorizontal();
        const length = horizontal ? this.width : this.height;
        const minRotation = toRadians(this.options.ticks.minRotation);
        const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 1e-3;
        const tickFont = this._resolveTickFontOptions(0);
        return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
      }
      getPixelForValue(value) {
        return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
      }
      getValueForPixel(pixel) {
        return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
      }
    };
    LinearScale.id = "linear";
    LinearScale.defaults = {
      ticks: {
        callback: Ticks.formatters.numeric
      }
    };
    LogarithmicScale = class extends Scale {
      constructor(cfg) {
        super(cfg);
        this.start = void 0;
        this.end = void 0;
        this._startValue = void 0;
        this._valueRange = 0;
      }
      parse(raw, index) {
        const value = LinearScaleBase.prototype.parse.apply(this, [raw, index]);
        if (value === 0) {
          this._zero = true;
          return void 0;
        }
        return isNumberFinite(value) && value > 0 ? value : null;
      }
      determineDataLimits() {
        const { min, max } = this.getMinMax(true);
        this.min = isNumberFinite(min) ? Math.max(0, min) : null;
        this.max = isNumberFinite(max) ? Math.max(0, max) : null;
        if (this.options.beginAtZero) {
          this._zero = true;
        }
        this.handleTickRangeOptions();
      }
      handleTickRangeOptions() {
        const { minDefined, maxDefined } = this.getUserBounds();
        let min = this.min;
        let max = this.max;
        const setMin = (v) => min = minDefined ? min : v;
        const setMax = (v) => max = maxDefined ? max : v;
        const exp = (v, m) => Math.pow(10, Math.floor(log10(v)) + m);
        if (min === max) {
          if (min <= 0) {
            setMin(1);
            setMax(10);
          } else {
            setMin(exp(min, -1));
            setMax(exp(max, 1));
          }
        }
        if (min <= 0) {
          setMin(exp(max, -1));
        }
        if (max <= 0) {
          setMax(exp(min, 1));
        }
        if (this._zero && this.min !== this._suggestedMin && min === exp(this.min, 0)) {
          setMin(exp(min, -1));
        }
        this.min = min;
        this.max = max;
      }
      buildTicks() {
        const opts = this.options;
        const generationOptions = {
          min: this._userMin,
          max: this._userMax
        };
        const ticks = generateTicks(generationOptions, this);
        if (opts.bounds === "ticks") {
          _setMinAndMaxByKey(ticks, this, "value");
        }
        if (opts.reverse) {
          ticks.reverse();
          this.start = this.max;
          this.end = this.min;
        } else {
          this.start = this.min;
          this.end = this.max;
        }
        return ticks;
      }
      getLabelForValue(value) {
        return value === void 0 ? "0" : formatNumber(value, this.chart.options.locale, this.options.ticks.format);
      }
      configure() {
        const start = this.min;
        super.configure();
        this._startValue = log10(start);
        this._valueRange = log10(this.max) - log10(start);
      }
      getPixelForValue(value) {
        if (value === void 0 || value === 0) {
          value = this.min;
        }
        if (value === null || isNaN(value)) {
          return NaN;
        }
        return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
      }
      getValueForPixel(pixel) {
        const decimal = this.getDecimalForPixel(pixel);
        return Math.pow(10, this._startValue + decimal * this._valueRange);
      }
    };
    LogarithmicScale.id = "logarithmic";
    LogarithmicScale.defaults = {
      ticks: {
        callback: Ticks.formatters.logarithmic,
        major: {
          enabled: true
        }
      }
    };
    RadialLinearScale = class extends LinearScaleBase {
      constructor(cfg) {
        super(cfg);
        this.xCenter = void 0;
        this.yCenter = void 0;
        this.drawingArea = void 0;
        this._pointLabels = [];
        this._pointLabelItems = [];
      }
      setDimensions() {
        this.width = this.maxWidth;
        this.height = this.maxHeight;
        this.paddingTop = getTickBackdropHeight(this.options) / 2;
        this.xCenter = Math.floor(this.width / 2);
        this.yCenter = Math.floor((this.height - this.paddingTop) / 2);
        this.drawingArea = Math.min(this.height - this.paddingTop, this.width) / 2;
      }
      determineDataLimits() {
        const { min, max } = this.getMinMax(false);
        this.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
        this.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
        this.handleTickRangeOptions();
      }
      computeTickLimit() {
        return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
      }
      generateTickLabels(ticks) {
        LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
        this._pointLabels = this.getLabels().map((value, index) => {
          const label = callback(this.options.pointLabels.callback, [value, index], this);
          return label || label === 0 ? label : "";
        });
      }
      fit() {
        const opts = this.options;
        if (opts.display && opts.pointLabels.display) {
          fitWithPointLabels(this);
        } else {
          this.setCenterPoint(0, 0, 0, 0);
        }
      }
      _setReductions(largestPossibleRadius, furthestLimits, furthestAngles) {
        let radiusReductionLeft = furthestLimits.l / Math.sin(furthestAngles.l);
        let radiusReductionRight = Math.max(furthestLimits.r - this.width, 0) / Math.sin(furthestAngles.r);
        let radiusReductionTop = -furthestLimits.t / Math.cos(furthestAngles.t);
        let radiusReductionBottom = -Math.max(furthestLimits.b - (this.height - this.paddingTop), 0) / Math.cos(furthestAngles.b);
        radiusReductionLeft = numberOrZero(radiusReductionLeft);
        radiusReductionRight = numberOrZero(radiusReductionRight);
        radiusReductionTop = numberOrZero(radiusReductionTop);
        radiusReductionBottom = numberOrZero(radiusReductionBottom);
        this.drawingArea = Math.max(largestPossibleRadius / 2, Math.min(Math.floor(largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2), Math.floor(largestPossibleRadius - (radiusReductionTop + radiusReductionBottom) / 2)));
        this.setCenterPoint(radiusReductionLeft, radiusReductionRight, radiusReductionTop, radiusReductionBottom);
      }
      setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
        const maxRight = this.width - rightMovement - this.drawingArea;
        const maxLeft = leftMovement + this.drawingArea;
        const maxTop = topMovement + this.drawingArea;
        const maxBottom = this.height - this.paddingTop - bottomMovement - this.drawingArea;
        this.xCenter = Math.floor((maxLeft + maxRight) / 2 + this.left);
        this.yCenter = Math.floor((maxTop + maxBottom) / 2 + this.top + this.paddingTop);
      }
      getIndexAngle(index) {
        const angleMultiplier = TAU / this.getLabels().length;
        const startAngle = this.options.startAngle || 0;
        return _normalizeAngle(index * angleMultiplier + toRadians(startAngle));
      }
      getDistanceFromCenterForValue(value) {
        if (isNullOrUndef(value)) {
          return NaN;
        }
        const scalingFactor = this.drawingArea / (this.max - this.min);
        if (this.options.reverse) {
          return (this.max - value) * scalingFactor;
        }
        return (value - this.min) * scalingFactor;
      }
      getValueForDistanceFromCenter(distance) {
        if (isNullOrUndef(distance)) {
          return NaN;
        }
        const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
        return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
      }
      getPointLabelContext(index) {
        const pointLabels = this._pointLabels || [];
        if (index >= 0 && index < pointLabels.length) {
          const pointLabel = pointLabels[index];
          return createPointLabelContext(this.getContext(), index, pointLabel);
        }
      }
      getPointPosition(index, distanceFromCenter) {
        const angle = this.getIndexAngle(index) - HALF_PI;
        return {
          x: Math.cos(angle) * distanceFromCenter + this.xCenter,
          y: Math.sin(angle) * distanceFromCenter + this.yCenter,
          angle
        };
      }
      getPointPositionForValue(index, value) {
        return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
      }
      getBasePosition(index) {
        return this.getPointPositionForValue(index || 0, this.getBaseValue());
      }
      getPointLabelPosition(index) {
        const { left, top, right, bottom } = this._pointLabelItems[index];
        return {
          left,
          top,
          right,
          bottom
        };
      }
      drawBackground() {
        const { backgroundColor, grid: { circular } } = this.options;
        if (backgroundColor) {
          const ctx = this.ctx;
          ctx.save();
          ctx.beginPath();
          pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this.getLabels().length);
          ctx.closePath();
          ctx.fillStyle = backgroundColor;
          ctx.fill();
          ctx.restore();
        }
      }
      drawGrid() {
        const ctx = this.ctx;
        const opts = this.options;
        const { angleLines, grid } = opts;
        const labelCount = this.getLabels().length;
        let i, offset, position;
        if (opts.pointLabels.display) {
          drawPointLabels(this, labelCount);
        }
        if (grid.display) {
          this.ticks.forEach((tick, index) => {
            if (index !== 0) {
              offset = this.getDistanceFromCenterForValue(tick.value);
              const optsAtIndex = grid.setContext(this.getContext(index - 1));
              drawRadiusLine(this, optsAtIndex, offset, labelCount);
            }
          });
        }
        if (angleLines.display) {
          ctx.save();
          for (i = this.getLabels().length - 1; i >= 0; i--) {
            const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
            const { color: color2, lineWidth } = optsAtIndex;
            if (!lineWidth || !color2) {
              continue;
            }
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color2;
            ctx.setLineDash(optsAtIndex.borderDash);
            ctx.lineDashOffset = optsAtIndex.borderDashOffset;
            offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max);
            position = this.getPointPosition(i, offset);
            ctx.beginPath();
            ctx.moveTo(this.xCenter, this.yCenter);
            ctx.lineTo(position.x, position.y);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      drawBorder() {
      }
      drawLabels() {
        const ctx = this.ctx;
        const opts = this.options;
        const tickOpts = opts.ticks;
        if (!tickOpts.display) {
          return;
        }
        const startAngle = this.getIndexAngle(0);
        let offset, width;
        ctx.save();
        ctx.translate(this.xCenter, this.yCenter);
        ctx.rotate(startAngle);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        this.ticks.forEach((tick, index) => {
          if (index === 0 && !opts.reverse) {
            return;
          }
          const optsAtIndex = tickOpts.setContext(this.getContext(index));
          const tickFont = toFont(optsAtIndex.font);
          offset = this.getDistanceFromCenterForValue(this.ticks[index].value);
          if (optsAtIndex.showLabelBackdrop) {
            ctx.font = tickFont.string;
            width = ctx.measureText(tick.label).width;
            ctx.fillStyle = optsAtIndex.backdropColor;
            const padding = toPadding(optsAtIndex.backdropPadding);
            ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
          }
          renderText(ctx, tick.label, 0, -offset, tickFont, {
            color: optsAtIndex.color
          });
        });
        ctx.restore();
      }
      drawTitle() {
      }
    };
    RadialLinearScale.id = "radialLinear";
    RadialLinearScale.defaults = {
      display: true,
      animate: true,
      position: "chartArea",
      angleLines: {
        display: true,
        lineWidth: 1,
        borderDash: [],
        borderDashOffset: 0
      },
      grid: {
        circular: false
      },
      startAngle: 0,
      ticks: {
        showLabelBackdrop: true,
        callback: Ticks.formatters.numeric
      },
      pointLabels: {
        backdropColor: void 0,
        backdropPadding: 2,
        display: true,
        font: {
          size: 10
        },
        callback(label) {
          return label;
        },
        padding: 5
      }
    };
    RadialLinearScale.defaultRoutes = {
      "angleLines.color": "borderColor",
      "pointLabels.color": "color",
      "ticks.color": "color"
    };
    RadialLinearScale.descriptors = {
      angleLines: {
        _fallback: "grid"
      }
    };
    INTERVALS = {
      millisecond: { common: true, size: 1, steps: 1e3 },
      second: { common: true, size: 1e3, steps: 60 },
      minute: { common: true, size: 6e4, steps: 60 },
      hour: { common: true, size: 36e5, steps: 24 },
      day: { common: true, size: 864e5, steps: 30 },
      week: { common: false, size: 6048e5, steps: 4 },
      month: { common: true, size: 2628e6, steps: 12 },
      quarter: { common: false, size: 7884e6, steps: 4 },
      year: { common: true, size: 3154e7 }
    };
    UNITS = Object.keys(INTERVALS);
    TimeScale = class extends Scale {
      constructor(props) {
        super(props);
        this._cache = {
          data: [],
          labels: [],
          all: []
        };
        this._unit = "day";
        this._majorUnit = void 0;
        this._offsets = {};
        this._normalized = false;
        this._parseOpts = void 0;
      }
      init(scaleOpts, opts) {
        const time = scaleOpts.time || (scaleOpts.time = {});
        const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
        mergeIf(time.displayFormats, adapter.formats());
        this._parseOpts = {
          parser: time.parser,
          round: time.round,
          isoWeekday: time.isoWeekday
        };
        super.init(scaleOpts);
        this._normalized = opts.normalized;
      }
      parse(raw, index) {
        if (raw === void 0) {
          return null;
        }
        return parse(this, raw);
      }
      beforeLayout() {
        super.beforeLayout();
        this._cache = {
          data: [],
          labels: [],
          all: []
        };
      }
      determineDataLimits() {
        const options2 = this.options;
        const adapter = this._adapter;
        const unit = options2.time.unit || "day";
        let { min, max, minDefined, maxDefined } = this.getUserBounds();
        function _applyBounds(bounds) {
          if (!minDefined && !isNaN(bounds.min)) {
            min = Math.min(min, bounds.min);
          }
          if (!maxDefined && !isNaN(bounds.max)) {
            max = Math.max(max, bounds.max);
          }
        }
        if (!minDefined || !maxDefined) {
          _applyBounds(this._getLabelBounds());
          if (options2.bounds !== "ticks" || options2.ticks.source !== "labels") {
            _applyBounds(this.getMinMax(false));
          }
        }
        min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
        max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
        this.min = Math.min(min, max - 1);
        this.max = Math.max(min + 1, max);
      }
      _getLabelBounds() {
        const arr = this.getLabelTimestamps();
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        if (arr.length) {
          min = arr[0];
          max = arr[arr.length - 1];
        }
        return { min, max };
      }
      buildTicks() {
        const options2 = this.options;
        const timeOpts = options2.time;
        const tickOpts = options2.ticks;
        const timestamps = tickOpts.source === "labels" ? this.getLabelTimestamps() : this._generate();
        if (options2.bounds === "ticks" && timestamps.length) {
          this.min = this._userMin || timestamps[0];
          this.max = this._userMax || timestamps[timestamps.length - 1];
        }
        const min = this.min;
        const max = this.max;
        const ticks = _filterBetween(timestamps, min, max);
        this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
        this._majorUnit = !tickOpts.major.enabled || this._unit === "year" ? void 0 : determineMajorUnit(this._unit);
        this.initOffsets(timestamps);
        if (options2.reverse) {
          ticks.reverse();
        }
        return ticksFromTimestamps(this, ticks, this._majorUnit);
      }
      initOffsets(timestamps) {
        let start = 0;
        let end = 0;
        let first, last;
        if (this.options.offset && timestamps.length) {
          first = this.getDecimalForValue(timestamps[0]);
          if (timestamps.length === 1) {
            start = 1 - first;
          } else {
            start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
          }
          last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
          if (timestamps.length === 1) {
            end = last;
          } else {
            end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
          }
        }
        const limit = timestamps.length < 3 ? 0.5 : 0.25;
        start = _limitValue(start, 0, limit);
        end = _limitValue(end, 0, limit);
        this._offsets = { start, end, factor: 1 / (start + 1 + end) };
      }
      _generate() {
        const adapter = this._adapter;
        const min = this.min;
        const max = this.max;
        const options2 = this.options;
        const timeOpts = options2.time;
        const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
        const stepSize = valueOrDefault(timeOpts.stepSize, 1);
        const weekday = minor === "week" ? timeOpts.isoWeekday : false;
        const hasWeekday = isNumber(weekday) || weekday === true;
        const ticks = {};
        let first = min;
        let time, count;
        if (hasWeekday) {
          first = +adapter.startOf(first, "isoWeek", weekday);
        }
        first = +adapter.startOf(first, hasWeekday ? "day" : minor);
        if (adapter.diff(max, min, minor) > 1e5 * stepSize) {
          throw new Error(min + " and " + max + " are too far apart with stepSize of " + stepSize + " " + minor);
        }
        const timestamps = options2.ticks.source === "data" && this.getDataTimestamps();
        for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
          addTick(ticks, time, timestamps);
        }
        if (time === max || options2.bounds === "ticks" || count === 1) {
          addTick(ticks, time, timestamps);
        }
        return Object.keys(ticks).sort((a, b) => a - b).map((x) => +x);
      }
      getLabelForValue(value) {
        const adapter = this._adapter;
        const timeOpts = this.options.time;
        if (timeOpts.tooltipFormat) {
          return adapter.format(value, timeOpts.tooltipFormat);
        }
        return adapter.format(value, timeOpts.displayFormats.datetime);
      }
      _tickFormatFunction(time, index, ticks, format2) {
        const options2 = this.options;
        const formats = options2.time.displayFormats;
        const unit = this._unit;
        const majorUnit = this._majorUnit;
        const minorFormat = unit && formats[unit];
        const majorFormat = majorUnit && formats[majorUnit];
        const tick = ticks[index];
        const major = majorUnit && majorFormat && tick && tick.major;
        const label = this._adapter.format(time, format2 || (major ? majorFormat : minorFormat));
        const formatter = options2.ticks.callback;
        return formatter ? callback(formatter, [label, index, ticks], this) : label;
      }
      generateTickLabels(ticks) {
        let i, ilen, tick;
        for (i = 0, ilen = ticks.length; i < ilen; ++i) {
          tick = ticks[i];
          tick.label = this._tickFormatFunction(tick.value, i, ticks);
        }
      }
      getDecimalForValue(value) {
        return value === null ? NaN : (value - this.min) / (this.max - this.min);
      }
      getPixelForValue(value) {
        const offsets = this._offsets;
        const pos = this.getDecimalForValue(value);
        return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
      }
      getValueForPixel(pixel) {
        const offsets = this._offsets;
        const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
        return this.min + pos * (this.max - this.min);
      }
      _getLabelSize(label) {
        const ticksOpts = this.options.ticks;
        const tickLabelWidth = this.ctx.measureText(label).width;
        const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
        const cosRotation = Math.cos(angle);
        const sinRotation = Math.sin(angle);
        const tickFontSize = this._resolveTickFontOptions(0).size;
        return {
          w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
          h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
        };
      }
      _getLabelCapacity(exampleTime) {
        const timeOpts = this.options.time;
        const displayFormats = timeOpts.displayFormats;
        const format2 = displayFormats[timeOpts.unit] || displayFormats.millisecond;
        const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [exampleTime], this._majorUnit), format2);
        const size = this._getLabelSize(exampleLabel);
        const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
        return capacity > 0 ? capacity : 1;
      }
      getDataTimestamps() {
        let timestamps = this._cache.data || [];
        let i, ilen;
        if (timestamps.length) {
          return timestamps;
        }
        const metas = this.getMatchingVisibleMetas();
        if (this._normalized && metas.length) {
          return this._cache.data = metas[0].controller.getAllParsedValues(this);
        }
        for (i = 0, ilen = metas.length; i < ilen; ++i) {
          timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this));
        }
        return this._cache.data = this.normalize(timestamps);
      }
      getLabelTimestamps() {
        const timestamps = this._cache.labels || [];
        let i, ilen;
        if (timestamps.length) {
          return timestamps;
        }
        const labels = this.getLabels();
        for (i = 0, ilen = labels.length; i < ilen; ++i) {
          timestamps.push(parse(this, labels[i]));
        }
        return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
      }
      normalize(values) {
        return _arrayUnique(values.sort(sorter));
      }
    };
    TimeScale.id = "time";
    TimeScale.defaults = {
      bounds: "data",
      adapters: {},
      time: {
        parser: false,
        unit: false,
        round: false,
        isoWeekday: false,
        minUnit: "millisecond",
        displayFormats: {}
      },
      ticks: {
        source: "auto",
        major: {
          enabled: false
        }
      }
    };
    TimeSeriesScale = class extends TimeScale {
      constructor(props) {
        super(props);
        this._table = [];
        this._minPos = void 0;
        this._tableRange = void 0;
      }
      initOffsets() {
        const timestamps = this._getTimestampsForTable();
        const table = this._table = this.buildLookupTable(timestamps);
        this._minPos = interpolate(table, this.min);
        this._tableRange = interpolate(table, this.max) - this._minPos;
        super.initOffsets(timestamps);
      }
      buildLookupTable(timestamps) {
        const { min, max } = this;
        const items = [];
        const table = [];
        let i, ilen, prev, curr, next;
        for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
          curr = timestamps[i];
          if (curr >= min && curr <= max) {
            items.push(curr);
          }
        }
        if (items.length < 2) {
          return [
            { time: min, pos: 0 },
            { time: max, pos: 1 }
          ];
        }
        for (i = 0, ilen = items.length; i < ilen; ++i) {
          next = items[i + 1];
          prev = items[i - 1];
          curr = items[i];
          if (Math.round((next + prev) / 2) !== curr) {
            table.push({ time: curr, pos: i / (ilen - 1) });
          }
        }
        return table;
      }
      _getTimestampsForTable() {
        let timestamps = this._cache.all || [];
        if (timestamps.length) {
          return timestamps;
        }
        const data = this.getDataTimestamps();
        const label = this.getLabelTimestamps();
        if (data.length && label.length) {
          timestamps = this.normalize(data.concat(label));
        } else {
          timestamps = data.length ? data : label;
        }
        timestamps = this._cache.all = timestamps;
        return timestamps;
      }
      getDecimalForValue(value) {
        return (interpolate(this._table, value) - this._minPos) / this._tableRange;
      }
      getValueForPixel(pixel) {
        const offsets = this._offsets;
        const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
        return interpolate(this._table, decimal * this._tableRange + this._minPos, true);
      }
    };
    TimeSeriesScale.id = "timeseries";
    TimeSeriesScale.defaults = TimeScale.defaults;
    scales = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      CategoryScale,
      LinearScale,
      LogarithmicScale,
      RadialLinearScale,
      TimeScale,
      TimeSeriesScale
    });
    registerables = [
      controllers,
      elements,
      plugins,
      scales
    ];
    Base = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      Chart$1.register(...registerables);
      let { data = {
        labels: [],
        datasets: [{ data: [] }],
        yMarkers: {},
        yRegions: []
      } } = $$props;
      let { type = "line" } = $$props;
      let { options: options2 = {} } = $$props;
      let { plugins: plugins2 = [] } = $$props;
      let chartRef;
      let props = clean($$props, ["data", "type", "options", "plugins"]);
      onDestroy(() => {
      });
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      if ($$props.type === void 0 && $$bindings.type && type !== void 0)
        $$bindings.type(type);
      if ($$props.options === void 0 && $$bindings.options && options2 !== void 0)
        $$bindings.options(options2);
      if ($$props.plugins === void 0 && $$bindings.plugins && plugins2 !== void 0)
        $$bindings.plugins(plugins2);
      return `<canvas${spread([escape_object(props)])}${add_attribute("this", chartRef, 0)}></canvas>`;
    });
    Line = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(Base, "Base").$$render($$result, Object.assign($$props, { type: "line" }), {}, {})}`;
    });
    css7 = {
      code: "div.svelte-4xvu84{margin:auto;width:50%;height:auto}",
      map: null
    };
    Chart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      var years = [1500, 1600, 1700, 1750, 1800, 1850, 1900, 1950, 1999, 2050];
      var africa = [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478];
      var asia = [282, 350, 411, 502, 635, 809, 947, 1402, 3700, 5267];
      var europe = [168, 170, 178, 190, 203, 276, 408, 547, 675, 734];
      var latinAmerica = [40, 20, 10, 16, 24, 38, 74, 167, 508, 784];
      var northAmerica = [6, 3, 2, 2, 7, 26, 82, 172, 312, 433];
      let data = {
        labels: years,
        datasets: [
          {
            data: africa,
            label: "Africa",
            fill: false,
            borderColor: "blue"
          },
          {
            data: asia,
            label: "Asia",
            fill: false,
            borderColor: "green"
          },
          {
            data: europe,
            label: "Europe",
            fill: false,
            borderColor: "green"
          },
          {
            data: latinAmerica,
            label: "Latin America",
            fill: false,
            borderColor: "red"
          },
          {
            data: northAmerica,
            label: "North America",
            fill: false,
            borderColor: "purple"
          }
        ]
      };
      $$result.css.add(css7);
      return `<div class="${"svelte-4xvu84"}">${validate_component(Line, "Line").$$render($$result, { data }, {}, {})}
</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/blog-6f88b8a1.js
var blog_6f88b8a1_exports = {};
__export(blog_6f88b8a1_exports, {
  default: () => Blog2,
  load: () => load2
});
var css$12, Posts, css8, allPosts2, body2, load2, pageTitle5, metaDescription5, Blog2;
var init_blog_6f88b8a1 = __esm({
  ".svelte-kit/output/server/chunks/blog-6f88b8a1.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_Seo_726ce9e2();
    init_Date_ebd36ae7();
    css$12 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-wfln64.svelte-wfln64,.svelte-wfln64.svelte-wfln64::before,.svelte-wfln64.svelte-wfln64::after{box-sizing:border-box}.svelte-wfln64.svelte-wfln64{margin:0}p.svelte-wfln64.svelte-wfln64,h3.svelte-wfln64.svelte-wfln64{overflow-wrap:break-word}.blog-parent.svelte-wfln64.svelte-wfln64{display:grid;grid-auto-flow:dense;grid-gap:var(--spacing-unit);justify-content:stretch;align-content:stretch;grid-template-columns:1fr;margin-bottom:calc(var(--spacing-unit) * 2)}@media screen and (min-width: 900px){.blog-parent.svelte-wfln64.svelte-wfln64{grid-template-columns:1fr 1fr;grid-gap:calc(var(--spacing-unit) * 1.5)}}.divlink.svelte-wfln64.svelte-wfln64{height:100%;text-decoration:none;color:inherit}.divlink.svelte-wfln64:hover:hover h3.svelte-wfln64{color:var(--primary-300)}.divlink.svelte-wfln64:hover:hover .blogPost.svelte-wfln64{transform:translate(-0.05rem, -0.05rem);transition:var(--transition-time) ease;box-shadow:var(--shadow-elevation-mediumhigh)}.blogPost.svelte-wfln64.svelte-wfln64{overflow:hidden;background:rgba(255, 255, 255, 0.5);border-radius:var(--corner-unit);position:relative;box-shadow:var(--shadow-elevation-medium);padding:var(--spacing-unit)}.blogPost.svelte-wfln64 p.svelte-wfln64{padding:0;margin:0 0 var(--spacing-unit)}.blogPost.svelte-wfln64 h3.svelte-wfln64{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}.blogPost.svelte-wfln64 .date.svelte-wfln64{opacity:0.5;font-size:0.9em}",
      map: null
    };
    Posts = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { dateSortedPosts } = $$props;
      if ($$props.dateSortedPosts === void 0 && $$bindings.dateSortedPosts && dateSortedPosts !== void 0)
        $$bindings.dateSortedPosts(dateSortedPosts);
      $$result.css.add(css$12);
      return `<div class="${"blog-parent svelte-wfln64"}">${each(dateSortedPosts, ({ path, metadata: { title, snippet, date } }) => `<a class="${"divlink svelte-wfln64"}"${add_attribute("href", `${path.replace(".md", "")}`, 0)}><div class="${"blogPost svelte-wfln64"}"><h3 class="${"svelte-wfln64"}">${escape(title)}</h3>
            <p class="${"svelte-wfln64"}">${escape(snippet)}</p>
            <span class="${"date svelte-wfln64"}">${validate_component(Date_1, "Date").$$render($$result, { date }, {}, {})}</span></div>
        </a>`)}
</div>`;
    });
    css8 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-1n9vwii.svelte-1n9vwii,.svelte-1n9vwii.svelte-1n9vwii::before,.svelte-1n9vwii.svelte-1n9vwii::after{box-sizing:border-box}.svelte-1n9vwii.svelte-1n9vwii{margin:0}h1.svelte-1n9vwii.svelte-1n9vwii{overflow-wrap:break-word}.container.svelte-1n9vwii.svelte-1n9vwii{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-1n9vwii.svelte-1n9vwii{max-width:1300px;margin:auto;position:relative;padding:0 var(--spacing-unit) 0}.container.svelte-1n9vwii div.svelte-1n9vwii{display:grid;align-items:center}.container.svelte-1n9vwii div h1.svelte-1n9vwii{text-align:center}.wrapper.svelte-1n9vwii.svelte-1n9vwii{margin-top:calc(var(--spacing-unit) * 3)}.background.svelte-1n9vwii.svelte-1n9vwii{width:100vw;height:calc(100% + 25rem);top:-15rem;z-index:-1;position:fixed;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;background:var(--primary-500);background-size:cover;background-position:center}",
      map: null
    };
    allPosts2 = { "./blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_ffb20f6d(), globalstyles_ffb20f6d_exports)), "./blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_889d29fe(), code_highlighting_889d29fe_exports)) };
    body2 = [];
    for (let path in allPosts2) {
      body2.push(allPosts2[path]().then(({ metadata: metadata3 }) => {
        return { path, metadata: metadata3 };
      }));
    }
    load2 = async ({ page }) => {
      const posts = await Promise.all(body2);
      const tag = page.params.tag;
      return { props: { posts, tag } };
    };
    pageTitle5 = "blog";
    metaDescription5 = "Collection of all blog posts on the website.";
    Blog2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { posts } = $$props;
      const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
      });
      if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0)
        $$bindings.posts(posts);
      if ($$props.dateSortedPosts === void 0 && $$bindings.dateSortedPosts && dateSortedPosts !== void 0)
        $$bindings.dateSortedPosts(dateSortedPosts);
      $$result.css.add(css8);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle5, metaDescription: metaDescription5 }, {}, {})}

    <main class="${"container svelte-1n9vwii"}"><div class="${"svelte-1n9vwii"}"><h1 class="${"svelte-1n9vwii"}">All posts</h1></div>
        <div class="${"wrapper svelte-1n9vwii"}">${validate_component(Posts, "Posts").$$render($$result, { dateSortedPosts }, {}, {})} 
            <div class="${"background svelte-1n9vwii"}"></div></div>
    </main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/_tag_-f50ef16f.js
var tag_f50ef16f_exports = {};
__export(tag_f50ef16f_exports, {
  default: () => U5Btagu5D,
  load: () => load3
});
var css9, allPosts3, body3, load3, metaDescription6, U5Btagu5D;
var init_tag_f50ef16f = __esm({
  ".svelte-kit/output/server/chunks/_tag_-f50ef16f.js"() {
    init_shims();
    init_app_2fdd64e5();
    init_Seo_726ce9e2();
    css9 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-340:hsl(176, 50%, 65%);--primary-350:#00ffee;--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-325:hsl(19, 70%, 55%);--secondary-350:hsl(19, 100%, 65%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px;--transition-time:0.15s}.svelte-1lvqsu.svelte-1lvqsu,.svelte-1lvqsu.svelte-1lvqsu::before,.svelte-1lvqsu.svelte-1lvqsu::after{box-sizing:border-box}.svelte-1lvqsu.svelte-1lvqsu{margin:0}p.svelte-1lvqsu.svelte-1lvqsu,h1.svelte-1lvqsu.svelte-1lvqsu,h3.svelte-1lvqsu.svelte-1lvqsu{overflow-wrap:break-word}.container.svelte-1lvqsu.svelte-1lvqsu{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.blog-parent.svelte-1lvqsu.svelte-1lvqsu{display:grid;grid-auto-flow:dense;grid-gap:1.5rem;justify-content:stretch;align-content:stretch;grid-template-columns:1fr;margin-bottom:calc(var(--spacing-unit) * 2)}@media screen and (min-width: 900px){.blog-parent.svelte-1lvqsu.svelte-1lvqsu{grid-template-columns:1fr 1fr}}.divlink.svelte-1lvqsu.svelte-1lvqsu{height:100%;text-decoration:none;color:inherit}.divlink.svelte-1lvqsu .date.svelte-1lvqsu{opacity:0.5;font-size:1rem}.divlink.svelte-1lvqsu:hover:hover h3.svelte-1lvqsu{color:var(--primary-300)}.divlink.svelte-1lvqsu:hover:hover .blogPost.svelte-1lvqsu{transform:translate(-0.05rem, -0.05rem);transition:0.1s ease;box-shadow:var(--shadow-elevation-mediumhigh)}.blogPost.svelte-1lvqsu.svelte-1lvqsu{overflow:hidden;background:rgba(255, 255, 255, 0.5);border-radius:var(--corner-unit);position:relative;box-shadow:var(--shadow-elevation-medium);padding:var(--spacing-unit)}.blogPost.svelte-1lvqsu p.svelte-1lvqsu{padding:0;margin:0}.blogPost.svelte-1lvqsu h3.svelte-1lvqsu{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}.container.svelte-1lvqsu.svelte-1lvqsu{max-width:1300px;margin:auto;position:relative;padding:0 var(--spacing-unit) 0}.container.svelte-1lvqsu .title.svelte-1lvqsu{display:grid;align-items:center}.container.svelte-1lvqsu .title h1.svelte-1lvqsu{text-align:center}.wrapper.svelte-1lvqsu.svelte-1lvqsu{margin-top:calc(var(--spacing-unit) * 3)}.background.svelte-1lvqsu.svelte-1lvqsu{width:100vw;height:calc(100% + 25rem);top:-15rem;z-index:-1;position:fixed;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;background:var(--primary-500);background-size:cover;background-position:center}",
      map: null
    };
    allPosts3 = { "../blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_ffb20f6d(), globalstyles_ffb20f6d_exports)), "../blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_889d29fe(), code_highlighting_889d29fe_exports)) };
    body3 = [];
    for (let path in allPosts3) {
      body3.push(allPosts3[path]().then(({ metadata: metadata3 }) => {
        return { path, metadata: metadata3 };
      }));
    }
    load3 = async ({ page }) => {
      const posts = await Promise.all(body3);
      const tag = page.params.tag;
      const filteredPosts = posts.filter((post) => {
        return post.metadata.tags.includes(tag);
      });
      return { props: { filteredPosts, tag } };
    };
    metaDescription6 = "All blog posts about {tag}";
    U5Btagu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { filteredPosts } = $$props;
      let { tag } = $$props;
      let pageTitle6 = tag;
      if ($$props.filteredPosts === void 0 && $$bindings.filteredPosts && filteredPosts !== void 0)
        $$bindings.filteredPosts(filteredPosts);
      if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
        $$bindings.tag(tag);
      $$result.css.add(css9);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle6, metaDescription: metaDescription6 }, {}, {})}

<main class="${"container svelte-1lvqsu"}"><div class="${"title svelte-1lvqsu"}"><h1 class="${"svelte-1lvqsu"}">${escape(tag.replace(/^\w/, (c) => c.toUpperCase()))}</h1></div>
    <div class="${"wrapper svelte-1lvqsu"}"><div class="${"blog-parent svelte-1lvqsu"}">${each(filteredPosts, ({ path, metadata: { title, date, snippet } }) => `<a class="${"divlink svelte-1lvqsu"}"${add_attribute("href", `/blog/${path.replace(".md", "")}`, 0)}><div class="${"blogPost svelte-1lvqsu"}"><h3 class="${"svelte-1lvqsu"}">${escape(title)}</h3>
                        <span class="${"date svelte-1lvqsu"}">${escape(new Date(date).toLocaleDateString("en-us", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }))}</span>
                        <p class="${"svelte-1lvqsu"}">${escape(snippet)}</p></div>
                </a>`)}</div>
        <div class="${"background svelte-1lvqsu"}"></div></div>
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/app-2fdd64e5.js
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function resolve2(base2, path) {
  if (scheme.test(path))
    return path;
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function is_root_relative(path) {
  return path[0] === "/" && path[1] !== "/";
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone3 = {};
  for (const key in obj) {
    clone3[key.toLowerCase()] = obj[key];
  }
  return clone3;
}
function error(body4) {
  return {
    status: 500,
    body: body4,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body: body4, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body4 instanceof Uint8Array || is_string(body4))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body4 === "object" || typeof body4 === "undefined") && !(body4 instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body4 === "undefined" ? {} : body4);
  } else {
    normalized_body = body4;
  }
  return { status, body: normalized_body, headers };
}
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names2 = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names2.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names2.has(thing)) {
      return names2.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names2.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names2.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop2() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function writable(value, start = noop2) {
  let stop;
  const subscribers = new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set2(fn(value));
  }
  function subscribe(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2) || noop2;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css22 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css22.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css22).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
    init2 += options2.service_worker ? '<script async custom-element="amp-install-serviceworker" src="https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js"><\/script>' : "";
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${page && page.path ? try_serialize(page.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page && page.query ? s$1(page.query.toString()) : ""}),
						params: ${page && page.params ? try_serialize(page.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += options2.amp ? `<amp-install-serviceworker src="${options2.service_worker}" layout="nodisplay"></amp-install-serviceworker>` : `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body4 = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body22, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body22)
      attributes += ` data-body="${hash(body22)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body: body4 })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve2(request.path, url.split("?")[0]);
        let response;
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (is_root_relative(resolved)) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body4 = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body4)}"}`
                  });
                }
                return body4;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {}
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map2 = new Map();
  return {
    append(key, value) {
      if (map2.has(key)) {
        (map2.get(key) || []).push(value);
      } else {
        map2.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map2)
  };
}
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body4 = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body4);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                let if_none_match_value = request2.headers["if-none-match"];
                if (if_none_match_value?.startsWith('W/"')) {
                  if_none_match_value = if_none_match_value.substring(2);
                }
                const etag = `"${hash(response.body || "")}"`;
                if (if_none_match_value === etag) {
                  return {
                    status: 304,
                    headers: {}
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function spread(args, classes_to_add) {
  const attributes = Object.assign({}, ...args);
  if (classes_to_add) {
    if (attributes.class == null) {
      attributes.class = classes_to_add;
    } else {
      attributes.class += " " + classes_to_add;
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name) => {
    if (invalid_attribute_name_character.test(name))
      return;
    const value = attributes[name];
    if (value === true)
      str += " " + name;
    else if (boolean_attributes.has(name.toLowerCase())) {
      if (value)
        str += " " + name;
    } else if (value != null) {
      str += ` ${name}="${value}"`;
    }
  });
  return str;
}
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function escape_attribute_value(value) {
  return typeof value === "string" ? escape(value) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css22) => css22.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-a7d26391.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-a7d26391.js", assets + "/_app/chunks/vendor-c1784ec1.js", assets + "/_app/chunks/preload-helper-ec9aa979.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
async function load_component(file) {
  const { entry, css: css22, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css22.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var __accessCheck, __privateGet, __privateAdd, __privateSet, _map, absolute, scheme, chars, unsafeChars, reserved, escaped$1, objectProtoOwnPropertyNames, subscriber_queue, escape_json_string_in_html_dict, escape_html_attr_dict, s$1, s, ReadOnlyFormData, current_component, boolean_attributes, invalid_attribute_name_character, escaped, missing_component, on_destroy, css10, Root, base, assets, user_hooks, template, options, default_settings, d, empty, manifest, get_hooks, module_lookup, metadata_lookup;
var init_app_2fdd64e5 = __esm({
  ".svelte-kit/output/server/chunks/app-2fdd64e5.js"() {
    init_shims();
    __accessCheck = (obj, member, msg) => {
      if (!member.has(obj))
        throw TypeError("Cannot " + msg);
    };
    __privateGet = (obj, member, getter) => {
      __accessCheck(obj, member, "read from private field");
      return getter ? getter.call(obj) : member.get(obj);
    };
    __privateAdd = (obj, member, value) => {
      if (member.has(obj))
        throw TypeError("Cannot add the same private member more than once");
      member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
    };
    __privateSet = (obj, member, value, setter) => {
      __accessCheck(obj, member, "write to private field");
      setter ? setter.call(obj, value) : member.set(obj, value);
      return value;
    };
    absolute = /^([a-z]+:)?\/?\//;
    scheme = /^[a-z]+:/;
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
    unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
    reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
    escaped$1 = {
      "<": "\\u003C",
      ">": "\\u003E",
      "/": "\\u002F",
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\0": "\\0",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
    Promise.resolve();
    subscriber_queue = [];
    escape_json_string_in_html_dict = {
      '"': '\\"',
      "<": "\\u003C",
      ">": "\\u003E",
      "/": "\\u002F",
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\0": "\\0",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    escape_html_attr_dict = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    };
    s$1 = JSON.stringify;
    s = JSON.stringify;
    ReadOnlyFormData = class {
      constructor(map2) {
        __privateAdd(this, _map, void 0);
        __privateSet(this, _map, map2);
      }
      get(key) {
        const value = __privateGet(this, _map).get(key);
        return value && value[0];
      }
      getAll(key) {
        return __privateGet(this, _map).get(key);
      }
      has(key) {
        return __privateGet(this, _map).has(key);
      }
      *[Symbol.iterator]() {
        for (const [key, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *entries() {
        for (const [key, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *keys() {
        for (const [key] of __privateGet(this, _map))
          yield key;
      }
      *values() {
        for (const [, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield value[i];
          }
        }
      }
    };
    _map = new WeakMap();
    Promise.resolve();
    boolean_attributes = new Set([
      "allowfullscreen",
      "allowpaymentrequest",
      "async",
      "autofocus",
      "autoplay",
      "checked",
      "controls",
      "default",
      "defer",
      "disabled",
      "formnovalidate",
      "hidden",
      "ismap",
      "loop",
      "multiple",
      "muted",
      "nomodule",
      "novalidate",
      "open",
      "playsinline",
      "readonly",
      "required",
      "reversed",
      "selected"
    ]);
    invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
    escaped = {
      '"': "&quot;",
      "'": "&#39;",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;"
    };
    missing_component = {
      $$render: () => ""
    };
    css10 = {
      code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
      map: null
    };
    Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { stores } = $$props;
      let { page } = $$props;
      let { components } = $$props;
      let { props_0 = null } = $$props;
      let { props_1 = null } = $$props;
      let { props_2 = null } = $$props;
      setContext("__svelte__", stores);
      afterUpdate(stores.page.notify);
      if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
        $$bindings.stores(stores);
      if ($$props.page === void 0 && $$bindings.page && page !== void 0)
        $$bindings.page(page);
      if ($$props.components === void 0 && $$bindings.components && components !== void 0)
        $$bindings.components(components);
      if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
        $$bindings.props_0(props_0);
      if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
        $$bindings.props_1(props_1);
      if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
        $$bindings.props_2(props_2);
      $$result.css.add(css10);
      {
        stores.page.set(page);
      }
      return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
        default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
          default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
        })}` : ``}`
      })}

${``}`;
    });
    base = "";
    assets = "";
    user_hooks = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      [Symbol.toStringTag]: "Module"
    });
    template = ({ head, body: body4 }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png">\n		<link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">\n		<link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">\n		<link rel="preconnect" href="https://fonts.googleapis.com"> \n		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> \n		<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet">\n		<link rel="manifest" href="favicon/site.webmanifest">\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body4 + "</div>\n	</body>\n</html>\n";
    options = null;
    default_settings = { paths: { "base": "", "assets": "" } };
    d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
    empty = () => ({});
    manifest = {
      assets: [{ "file": ".DS_Store", "size": 6148, "type": null }, { "file": "Basic.svg", "size": 21723, "type": "image/svg+xml" }, { "file": "Basicvignet.svg", "size": 26873, "type": "image/svg+xml" }, { "file": "artComputerman.svg", "size": 35544, "type": "image/svg+xml" }, { "file": "artError-2.svg", "size": 18616, "type": "image/svg+xml" }, { "file": "artError-3.svg", "size": 18615, "type": "image/svg+xml" }, { "file": "artError-3.vectornator/Artboard0.json", "size": 213929, "type": "application/json" }, { "file": "artError-3.vectornator/Document.json", "size": 829, "type": "application/json" }, { "file": "artError-3.vectornator/Manifest.json", "size": 148, "type": "application/json" }, { "file": "artError-3.vectornator/Thumbnail.png", "size": 94361, "type": "image/png" }, { "file": "artError-3.vectornator/UndoHistory.json", "size": 22977, "type": "application/json" }, { "file": "artError.svg", "size": 67186, "type": "image/svg+xml" }, { "file": "artMountain.svg", "size": 30329, "type": "image/svg+xml" }, { "file": "background-stackedwaves.svg", "size": 4914, "type": "image/svg+xml" }, { "file": "blob-scene.svg", "size": 4970, "type": "image/svg+xml" }, { "file": "buttonsvg.svg", "size": 2049, "type": "image/svg+xml" }, { "file": "favicon/android-chrome-192x192.png", "size": 23388, "type": "image/png" }, { "file": "favicon/android-chrome-512x512.png", "size": 83768, "type": "image/png" }, { "file": "favicon/apple-touch-icon.png", "size": 24659, "type": "image/png" }, { "file": "favicon/favicon-16x16.png", "size": 898, "type": "image/png" }, { "file": "favicon/favicon-32x32.png", "size": 2104, "type": "image/png" }, { "file": "favicon/favicon.ico", "size": 15406, "type": "image/vnd.microsoft.icon" }, { "file": "favicon/site.webmanifest", "size": 263, "type": "application/manifest+json" }, { "file": "finishedlogo.svg", "size": 8429, "type": "image/svg+xml" }, { "file": "footer-waveline.svg", "size": 579, "type": "image/svg+xml" }, { "file": "footer-waveline2.svg", "size": 584, "type": "image/svg+xml" }, { "file": "illustration-0arrow.svg", "size": 2484, "type": "image/svg+xml" }, { "file": "illustration-3scribbles.svg", "size": 11862, "type": "image/svg+xml" }, { "file": "illustration-crosses.svg", "size": 16139, "type": "image/svg+xml" }, { "file": "illustration-shapes.svg", "size": 13936, "type": "image/svg+xml" }, { "file": "layered-waves.svg", "size": 4056, "type": "image/svg+xml" }, { "file": "link.svg", "size": 1165, "type": "image/svg+xml" }, { "file": "man.svg", "size": 18398, "type": "image/svg+xml" }, { "file": "postBackground-1.svg", "size": 687, "type": "image/svg+xml" }, { "file": "postBackground-2.svg", "size": 678, "type": "image/svg+xml" }, { "file": "postBackground-3.svg", "size": 689, "type": "image/svg+xml" }, { "file": "postBackground-4.svg", "size": 570, "type": "image/svg+xml" }],
      layout: "src/routes/__layout.svelte",
      error: "src/routes/__error.svelte",
      routes: [
        {
          type: "page",
          pattern: /^\/$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/calculator\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/calculator.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/projects\/schildklier\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/projects/schildklier.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/projects\/chart\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/projects/chart.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/blog\/211211-code-highlighting\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/blog/211211-code-highlighting.md"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/blog\/211209-globalstyles\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/blog/211209-globalstyles.md"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/blog\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/blog.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/tags\/([^/]+?)\/?$/,
          params: (m) => ({ tag: d(m[1]) }),
          a: ["src/routes/__layout.svelte", "src/routes/tags/[tag].svelte"],
          b: ["src/routes/__error.svelte"]
        }
      ]
    };
    get_hooks = (hooks) => ({
      getSession: hooks.getSession || (() => ({})),
      handle: hooks.handle || (({ request, resolve: resolve22 }) => resolve22(request)),
      handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
      externalFetch: hooks.externalFetch || fetch
    });
    module_lookup = {
      "src/routes/__layout.svelte": () => Promise.resolve().then(() => (init_layout_ac9b8360(), layout_ac9b8360_exports)),
      "src/routes/__error.svelte": () => Promise.resolve().then(() => (init_error_656dbd13(), error_656dbd13_exports)),
      "src/routes/index.svelte": () => Promise.resolve().then(() => (init_index_7278b074(), index_7278b074_exports)),
      "src/routes/calculator.svelte": () => Promise.resolve().then(() => (init_calculator_99cce316(), calculator_99cce316_exports)),
      "src/routes/projects/schildklier.svelte": () => Promise.resolve().then(() => (init_schildklier_dd117784(), schildklier_dd117784_exports)),
      "src/routes/projects/chart.svelte": () => Promise.resolve().then(() => (init_chart_4d567f48(), chart_4d567f48_exports)),
      "src/routes/blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_889d29fe(), code_highlighting_889d29fe_exports)),
      "src/routes/blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_ffb20f6d(), globalstyles_ffb20f6d_exports)),
      "src/routes/blog.svelte": () => Promise.resolve().then(() => (init_blog_6f88b8a1(), blog_6f88b8a1_exports)),
      "src/routes/tags/[tag].svelte": () => Promise.resolve().then(() => (init_tag_f50ef16f(), tag_f50ef16f_exports))
    };
    metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-70575c89.js", "css": ["assets/pages/__layout.svelte-519b622e.css"], "js": ["pages/__layout.svelte-70575c89.js", "chunks/vendor-c1784ec1.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-3fce1227.js", "css": ["assets/pages/__error.svelte-3729c9f9.css"], "js": ["pages/__error.svelte-3fce1227.js", "chunks/vendor-c1784ec1.js", "chunks/Seo-f41bcbc0.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-29774dd0.js", "css": ["assets/pages/index.svelte-6bdb156e.css"], "js": ["pages/index.svelte-29774dd0.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-c1784ec1.js", "chunks/Seo-f41bcbc0.js"], "styles": [] }, "src/routes/calculator.svelte": { "entry": "pages/calculator.svelte-2dd8b91c.js", "css": ["assets/pages/calculator.svelte-e06d65af.css"], "js": ["pages/calculator.svelte-2dd8b91c.js", "chunks/vendor-c1784ec1.js", "chunks/Seo-f41bcbc0.js"], "styles": [] }, "src/routes/projects/schildklier.svelte": { "entry": "pages/projects/schildklier.svelte-c3a7f0e0.js", "css": ["assets/pages/projects/schildklier.svelte-95dcc9b8.css"], "js": ["pages/projects/schildklier.svelte-c3a7f0e0.js", "chunks/vendor-c1784ec1.js", "chunks/Seo-f41bcbc0.js"], "styles": [] }, "src/routes/projects/chart.svelte": { "entry": "pages/projects/chart.svelte-aa87a5d7.js", "css": ["assets/pages/projects/chart.svelte-a26020a5.css"], "js": ["pages/projects/chart.svelte-aa87a5d7.js", "chunks/vendor-c1784ec1.js"], "styles": [] }, "src/routes/blog/211211-code-highlighting.md": { "entry": "pages/blog/211211-code-highlighting.md-a2d3c6f7.js", "css": ["assets/blog-792eab7b.css"], "js": ["pages/blog/211211-code-highlighting.md-a2d3c6f7.js", "chunks/vendor-c1784ec1.js", "chunks/blog-823881b2.js", "chunks/Seo-f41bcbc0.js", "chunks/Date-dc6ffdb3.js"], "styles": [] }, "src/routes/blog/211209-globalstyles.md": { "entry": "pages/blog/211209-globalstyles.md-e5507cfd.js", "css": ["assets/blog-792eab7b.css"], "js": ["pages/blog/211209-globalstyles.md-e5507cfd.js", "chunks/vendor-c1784ec1.js", "chunks/blog-823881b2.js", "chunks/Seo-f41bcbc0.js", "chunks/Date-dc6ffdb3.js"], "styles": [] }, "src/routes/blog.svelte": { "entry": "pages/blog.svelte-3892ce28.js", "css": ["assets/pages/blog.svelte-f982d65f.css"], "js": ["pages/blog.svelte-3892ce28.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-c1784ec1.js", "chunks/Seo-f41bcbc0.js", "chunks/Date-dc6ffdb3.js"], "styles": [] }, "src/routes/tags/[tag].svelte": { "entry": "pages/tags/_tag_.svelte-4c7920e5.js", "css": ["assets/pages/tags/_tag_.svelte-9a856841.css"], "js": ["pages/tags/_tag_.svelte-4c7920e5.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-c1784ec1.js", "chunks/Seo-f41bcbc0.js"], "styles": [] } };
  }
});

// .svelte-kit/vercel/entry.js
__export(exports, {
  default: () => entry_default
});
init_shims();

// node_modules/@sveltejs/kit/dist/node.js
init_shims();
function getRawBody(req) {
  return new Promise((fulfil, reject) => {
    const h = req.headers;
    if (!h["content-type"]) {
      return fulfil(null);
    }
    req.on("error", reject);
    const length = Number(h["content-length"]);
    if (isNaN(length) && h["transfer-encoding"] == null) {
      return fulfil(null);
    }
    let data = new Uint8Array(length || 0);
    if (length > 0) {
      let offset = 0;
      req.on("data", (chunk) => {
        const new_len = offset + Buffer.byteLength(chunk);
        if (new_len > length) {
          return reject({
            status: 413,
            reason: 'Exceeded "Content-Length" limit'
          });
        }
        data.set(chunk, offset);
        offset = new_len;
      });
    } else {
      req.on("data", (chunk) => {
        const new_data = new Uint8Array(data.length + chunk.length);
        new_data.set(data, 0);
        new_data.set(chunk, data.length);
        data = new_data;
      });
    }
    req.on("end", () => {
      fulfil(data);
    });
  });
}

// .svelte-kit/output/server/app.js
init_shims();
init_app_2fdd64e5();

// .svelte-kit/vercel/entry.js
init();
var entry_default = async (req, res) => {
  const { pathname, searchParams } = new URL(req.url || "", "http://localhost");
  let body4;
  try {
    body4 = await getRawBody(req);
  } catch (err) {
    res.statusCode = err.status || 400;
    return res.end(err.reason || "Invalid request body");
  }
  const rendered = await render({
    method: req.method,
    headers: req.headers,
    path: pathname,
    query: searchParams,
    rawBody: body4
  });
  if (rendered) {
    const { status, headers, body: body5 } = rendered;
    return res.writeHead(status, headers).end(body5);
  }
  return res.writeHead(404).end();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*!
 * @kurkle/color v0.1.9
 * https://github.com/kurkle/color#readme
 * (c) 2020 Jukka Kurkela
 * Released under the MIT License
 */
/*!
 * Chart.js v3.6.2
 * https://www.chartjs.org
 * (c) 2021 Chart.js Contributors
 * Released under the MIT License
 */
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
