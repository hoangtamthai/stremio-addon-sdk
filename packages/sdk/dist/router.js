import { match } from "path-to-regexp";
export function createRouter({ get, manifest }) {
  return async function router(request) {
    const { pathname } = getUrl(request);
    const routePrefix = getRoutePrefix(manifest);
    const resourceHandlers = getResourceHandlers(manifest);
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    };
    // Match manifest route.
    const [manifestMatches, manifestMatch] = matchRoute(
      `${routePrefix}/manifest.json`,
      pathname,
    );
    if (manifestMatches) {
      const sanitizedManifest = sanitizeManifest(
        manifest,
        manifestMatch.params.config,
      );
      return new Response(sanitizedManifest, {
        headers,
      });
    }
    // Match resource route.
    const [resourceMatches, resourceMatch] = matchRoute(
      `${routePrefix}/:resource/:type/:id{/:extra}.json`,
      pathname,
    );
    if (resourceMatches) {
      const {
        resource,
        type,
        id,
        extra: rawExtra,
        config: rawConfig,
      } = resourceMatch.params;
      if (!resourceHandlers.has(resource)) {
        return new Response(JSON.stringify({ err: "resource not found" }), {
          status: 404,
          headers,
        });
      }
      const config = parseConfig(rawConfig);
      const extra = parseExtra(rawExtra);
      try {
        const result = await get(resource, type, id, extra, config);
        if (result.redirect) {
          return new Response(null, {
            status: 307,
            headers: { Location: result.redirect },
          });
        }
        const res = new Response(JSON.stringify(result), { headers });
        const cacheControlHeader = getCacheControlHeader(result);
        if (cacheControlHeader) {
          res.headers.set("Cache-Control", cacheControlHeader);
        }
        return res;
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ err: "handler error" }), {
          status: 500,
          headers,
        });
      }
    }
    // No match; the caller should handle this case.
    return null;
  };
}
function getUrl(req) {
  if (req.url.includes("://")) {
    return new URL(req.url);
  }
  const host = req.headers.get("host");
  return new URL(`http://${host || "localhost"}${req.url}`);
}
function getRoutePrefix(manifest) {
  const hasConfig =
    (manifest.config ?? []).length ||
    manifest.behaviorHints?.configurationRequired;
  return hasConfig ? "{/:config}" : "";
}
function getResourceHandlers(manifest) {
  const handlers = new Set();
  if (manifest.catalogs.length > 0) {
    handlers.add("catalog");
  }
  manifest.resources.forEach((r) =>
    handlers.add(typeof r === "string" ? r : r.name),
  );
  return handlers;
}
function getCacheControlHeader(result) {
  const cacheHeaders = {
    cacheMaxAge: "max-age",
    staleRevalidate: "stale-while-revalidate",
    staleError: "stale-if-error",
  };
  const cacheControl = Object.keys(cacheHeaders)
    .map((prop) => {
      const cacheKey = cacheHeaders[prop];
      const cacheValue = result[prop];
      if (!Number.isInteger(cacheValue)) return false;
      return cacheKey + "=" + cacheValue;
    })
    .filter((val) => !!val)
    .join(", ");
  return cacheControl ? `${cacheControl}, public` : null;
}
function sanitizeManifest(manifest, config) {
  const manifestBuf = JSON.stringify(manifest);
  let sanitizedManifest = manifestBuf;
  if (
    config &&
    manifest.behaviorHints &&
    (manifest.behaviorHints.configurationRequired ||
      manifest.behaviorHints.configurable)
  ) {
    const manifestClone = JSON.parse(manifestBuf);
    // we remove configurationRequired so the addon is installable after configuration
    delete manifestClone.behaviorHints.configurationRequired;
    // we remove configuration page for installed addon too (could be added later to the router)
    delete manifestClone.behaviorHints.configurable;
    sanitizedManifest = JSON.stringify(manifestClone);
  }
  return sanitizedManifest;
}
function matchRoute(path, pathname) {
  const matcher = match(path);
  const matches = matcher(pathname);
  // Explicitly return the results like this for better type narrowing.
  if (matches) {
    return [true, matches];
  }
  return [false, null];
}
function parseConfig(value) {
  let config = {};
  if (value && value.length > 0) {
    try {
      config = JSON.parse(value);
    } catch (_) {
      // ignore
    }
  }
  return config;
}
function parseExtra(value) {
  return value ? Object.fromEntries(new URLSearchParams(value)) : {};
}
//# sourceMappingURL=router.js.map
