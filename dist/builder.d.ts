import type {
  AddonInterface,
  CatalogHandlerArgs,
  DefaultConfig,
  HandlerArgs,
  Manifest,
  ManifestSchema,
  MetaDetail,
  MetaHandlerArgs,
  MetaPreview,
  ShortManifestResource,
  Stream,
  StreamHandlerArgs,
  Subtitle,
  SubtitlesHandlerArgs,
  WithCache,
} from "./types.js";
type Handler = (args: HandlerArgs) => Promise<unknown>;
export declare class AddonBuilder {
  protected readonly handlers: Map<ShortManifestResource, Handler>;
  protected readonly manifest: Manifest;
  constructor(data: Manifest, schema?: ManifestSchema);
  defineResourceHandler(
    resource: ShortManifestResource,
    handler: Handler,
  ): this;
  defineStreamHandler<Config = DefaultConfig>(
    handler: (args: StreamHandlerArgs<Config>) => Promise<
      WithCache<{
        streams: Stream[];
      }>
    >,
  ): this;
  defineMetaHandler<Config = DefaultConfig>(
    handler: (args: MetaHandlerArgs<Config>) => Promise<
      WithCache<{
        meta: MetaDetail;
      }>
    >,
  ): this;
  defineCatalogHandler<Config = DefaultConfig>(
    handler: (args: CatalogHandlerArgs<Config>) => Promise<
      WithCache<{
        metas: MetaPreview[];
      }>
    >,
  ): this;
  defineSubtitlesHandler<Config = DefaultConfig>(
    handler: (args: SubtitlesHandlerArgs<Config>) => Promise<
      WithCache<{
        subtitles: Subtitle[];
      }>
    >,
  ): this;
  getInterface(): AddonInterface;
}
export {};
//# sourceMappingURL=builder.d.ts.map
