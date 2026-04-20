import { validate } from "./validator.js";
export class AddonBuilder {
  handlers = new Map();
  manifest;
  constructor(data, schema) {
    this.manifest = schema ? validate(schema, data) : data;
    Object.freeze(this.manifest);
  }
  defineResourceHandler(resource, handler) {
    if (this.handlers.has(resource)) {
      throw new Error(`Handler for resource "${resource}" is already defined`);
    }
    this.handlers.set(resource, handler);
    return this;
  }
  defineStreamHandler(handler) {
    return this.defineResourceHandler("stream", handler);
  }
  defineMetaHandler(handler) {
    return this.defineResourceHandler("meta", handler);
  }
  defineCatalogHandler(handler) {
    return this.defineResourceHandler("catalog", handler);
  }
  defineSubtitlesHandler(handler) {
    return this.defineResourceHandler("subtitles", handler);
  }
  getInterface() {
    return {
      manifest: this.manifest,
      get: (resource, type, id, extra = {}, config = {}) => {
        const handler = this.handlers.get(resource);
        if (!handler) {
          return Promise.reject(`No handler for ${resource}`);
        }
        return handler({ type, id, extra, config });
      },
    };
  }
}
//# sourceMappingURL=builder.js.map
