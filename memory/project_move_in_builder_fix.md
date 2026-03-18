---
name: Move-In Builder Bug Fix (March 2026)
description: Context for bugs fixed in the new Move-In builder map — residence hall not highlighted and map not zooming to selected hall
type: project
---

# Move-In Builder Bug Fix

**Why:** Two bugs in the new Move-In builder (feat commit `f29e1217`):
1. The map shows the entire campus instead of zooming to the selected residence hall
2. In the legend, "Residence Hall" appears as a cyan entry but the building is never highlighted on the map

**How to apply:** If further work is needed on the `EventService`, `move-in.definitions.ts`, or related event infrastructure, this context explains the architecture and the bugs that were fixed.

---

## Background: Two Move-In Builder Systems

The repo has **two** move-in builder systems:

### Old System (still in place, separate app)
- App: `apps/ts-move-in-out-angular/`
- Library: `libs/ts/movein/ngx/`
- Service: `libs/ts/movein/ngx/src/lib/modules/map/services/move-in-out/move-in-out.service.ts`
- This system uses `MoveinOutService.drawResidence()` which explicitly zooms to the selected hall after loading layers.

### New System (the one with bugs)
- Library: `libs/ts/events/ngx/`
- Configuration: `libs/ts/events/ngx/src/lib/definitions/move-in.definitions.ts`
- Service: `libs/ts/events/ngx/src/lib/services/event/event.service.ts`
- Settings service: `libs/ts/events/ngx/src/lib/services/settings/event-settings.service.ts`
- Interface: `libs/ts/events/ngx/src/lib/interfaces/special-event.interface.ts`
- This is a **generalized event builder** framework. Events are configured as `AggiemapCustomMapConfiguration` objects.

---

## Architecture of the New Event System

### `AggiemapCustomMapConfiguration`
Each event is defined as an object containing:
- `configuration: EventConfiguration` — metadata (id, name, zoom, mapCenter, focusLayerId, etc.)
- `options: SpecialEventOptions` — the builder questions
- `sources: LayerSource[]` — the cold (lazy-loaded) layer sources
- `references: Record<string, string>` — enum-like layer ID references

### How Effects Work
Each `SpecialEventOption` has `effects.layers` with `conversions` (`{ input, expression, deconflictingStrategy }`). When the user selects value X, the matching conversion's `expression` is applied as a `definitionExpression` on that layer.

### `EventService.drawEvent()`
Called on map init. It:
1. Deep-copies each source via `getLayerSourceCopy()`
2. For each source, applies conversion expressions to `source.native.definitionExpression`
3. Calls `await mapService.loadLayers(sources)` with all modified sources
4. After a 200ms timeout, finds the focus layer and zooms to it

### `mapService.generateLayer()` — The Critical Detail
```typescript
props = { ...source, ...source.native }
```
**`source.native` spreads OVER root-level properties.** Any property in `native` always wins. This means `definitionExpression` must be set on `source.native`, NOT at the root level of the source.

---

## Bug 1: Residence Hall Not Highlighted

### Root Cause
`RESIDENCE_HALL` layer source has `native.definitionExpression: '1=0'` as a placeholder. The previous code wrote the building expression to the **root level** of `source`, but since `generateLayer` spreads `native` last, `native.definitionExpression: '1=0'` always overrode it. The building was never shown.

### Fix (in `event.service.ts`)
Changed expression reads/writes to target `source.native.definitionExpression`:
```typescript
const featureSource = source as FeatureLayerSourceProperties;
const nativeExpr = featureSource.native?.definitionExpression;
// Treat '1=0' as empty — it's a placeholder, not a real filter to preserve
const existingExpression = nativeExpr && nativeExpr !== '1=0' ? nativeExpr : undefined;

const setExpression = (expr: string) => {
  if (featureSource.native) {
    featureSource.native.definitionExpression = expr;
  } else {
    (source as esri.FeatureLayer).definitionExpression = expr;
  }
};
```

After the conversion loop, `layer.definitionExpression = focusExpr` is also set explicitly on the loaded ESRI layer in the zoom setTimeout (see Bug 2 fix), which ensures the hall is visually highlighted even if `generateLayer` doesn't propagate the expression correctly.

---

## Bug 2: Map Not Zooming to Selected Hall

### Root Cause
The new `EventService` had no zoom logic. `loadLayers` loaded the layers but the view stayed at the initial campus zoom.

### Fix — Three-part change

**1. Added `focusLayerId?: string` to `EventConfiguration` interface**
(`libs/ts/events/ngx/src/lib/interfaces/special-event.interface.ts`)

**2. Set `focusLayerId` in `MoveInConfiguration`**
(`libs/ts/events/ngx/src/lib/definitions/move-in.definitions.ts`)
```typescript
focusLayerId: MOVE_IN_LAYERS.RESIDENCE_HALL
```

**3. Added zoom logic in `EventService.drawEvent()` after `await loadLayers`**
```typescript
const focusLayerId = this.eventSettingsService.eventConfiguration()?.configuration?.focusLayerId;
if (focusLayerId) {
  const focusSource = sources.find((s) => s.id === focusLayerId) as FeatureLayerSourceProperties;
  const focusExpr = focusSource?.native?.definitionExpression;
  if (focusExpr && focusExpr !== '1=0') {
    setTimeout(() => {
      const layer = this.mapService.findLayerById(focusLayerId) as esri.FeatureLayer;
      if (layer) {
        // Must set definitionExpression explicitly — generateLayer may not propagate it reliably
        layer.definitionExpression = focusExpr;
        // Must pass focusExpr as the where clause — FeatureLayer caches all features in snapshot
        // mode, so queryFeatures({ where: '1=1' }) returns ALL buildings regardless of
        // definitionExpression. Using focusExpr as the where clause filters the local cache.
        layer.queryFeatures({ where: focusExpr, returnGeometry: true, outFields: ['OBJECTID'] }).then((result) => {
          if (result && result.features.length > 0) {
            this.mapService.zoomTo({ graphics: result.features, zoom: 18 });
          }
        }).catch((err) => console.error('EventService: Failed to zoom to focus layer', err));
      }
    }, 200);
  }
}
```

### Critical ESRI Behavior Discovered (important for future work)
**FeatureLayer snapshot mode caches ALL features.** `layer.queryFeatures({ where: '1=1' })` queries the local cache and returns all features regardless of `layer.definitionExpression`. Setting `definitionExpression` after layer creation only affects rendering, NOT `queryFeatures` results. To filter a `queryFeatures` call, you must pass the expression as the **`where`** parameter. This is why every attempt using `where: '1=1'` zoomed to the centroid of all campus buildings (the "cross-country course" area at ~30.614, -96.372).

---

## Files Changed

| File | Change |
|------|--------|
| `libs/ts/events/ngx/src/lib/interfaces/special-event.interface.ts` | Added `focusLayerId?: string` to `EventConfiguration` |
| `libs/ts/events/ngx/src/lib/definitions/move-in.definitions.ts` | Added `focusLayerId: MOVE_IN_LAYERS.RESIDENCE_HALL` to `MoveInConfiguration` |
| `libs/ts/events/ngx/src/lib/services/event/event.service.ts` | Fixed expression write to `native`, added zoom-to logic with `focusExpr` as `where` clause, added `await` to `loadLayers` |

---

## Key Concepts for Future Work

- **`native` always wins in `generateLayer`**: Always set `definitionExpression` on `source.native` (not root level) when working with event layer sources.
- **`'1=0'` is a placeholder**: Treat it as empty and replace it — never AND it with the real expression.
- **`focusLayerId` is generic**: Any future event that needs zoom-to-layer can set `focusLayerId` in its `EventConfiguration`.
- **ESRI snapshot cache gotcha**: For FeatureLayers in snapshot mode, `queryFeatures({ where: '1=1' })` always returns all cached features. Always pass the actual filter expression as the `where` parameter, not `'1=1'`.
- **`deconflictingStrategy` controls multi-option layers**: `MOVE_IN_LOTS` is affected by both date and accessible parking options. Accessible uses `APPEND_OR`; default is `APPEND_AND`.
- **200ms setTimeout is necessary**: `loadLayers` resolves when the layer is added to the collection, not when ESRI has fully initialized it. The delay gives the layer time to be queryable.
