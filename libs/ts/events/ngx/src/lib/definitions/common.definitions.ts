import { LayerSource } from '@tamu-gisc/common/types';

import esri = __esri;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

export const commonSymbols = {
  GREEN_ARROW: {
    type: 'simple-line',
    color: 'rgb(56, 168, 0)',
    width: 2,
    marker: {
      style: 'arrow',
      color: 'rgb(56, 168, 0)',
      placement: 'end'
    }
  },
  RED_ARROW: {
    type: 'simple-line',
    color: 'rgb(230, 0, 0)',
    width: 2,
    marker: {
      style: 'arrow',
      color: 'rgb(230, 0, 0)',
      placement: 'end'
    }
  }
};

/**
 * Street and lot closures are meant to read as a hatched-off area, not a filled block. Several
 * services publish their closure category as a plain solid red fill (`esriSFSSolid`) instead, so the
 * closure swallows everything it covers and looks like any other solid parking category.
 *
 * This is the hatch the Move-In service publishes for its No Roadside Parking closures
 * (`esriSFSDiagonalCross`, red over a solid red outline). Maps whose services publish a solid
 * closure override the published symbol with this one so every map's closures read the same.
 */
export const closureHatchSymbol = {
  type: 'simple-fill',
  style: 'diagonal-cross',
  color: [230, 0, 0, 255],
  outline: {
    type: 'simple-line',
    style: 'solid',
    color: [230, 0, 0, 255],
    width: 1
  }
} as unknown as esri.SimpleFillSymbolProperties & { type: 'simple-fill' };

/**
 * Closure hatch for a layer whose every feature is a closure. Layers that mix closures with other
 * categories have to reproduce their published unique-value renderer and swap in
 * {@link closureHatchSymbol} for the closure class instead.
 */
export const closureHatchRenderer = (label = 'Road Closed') =>
  ({
    type: 'simple',
    label,
    symbol: closureHatchSymbol
  } as unknown as FeatureRenderer);
