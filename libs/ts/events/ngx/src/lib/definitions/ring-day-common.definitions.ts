import { LayerSource } from '@tamu-gisc/common/types';

import { closureHatchSymbol } from './common.definitions';

import esri = __esri;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

const solidFill = (color: number[], outlineColor: number[], outlineWidth: number): esri.SimpleFillSymbolProperties =>
  ({
    type: 'simple-fill',
    style: 'solid',
    color,
    outline: {
      type: 'simple-line',
      style: outlineWidth === 0 ? 'none' : 'solid',
      color: outlineColor,
      width: outlineWidth
    }
  } as unknown as esri.SimpleFillSymbolProperties);

/**
 * Ring Day Areas renderer, shared by the April, October, and November maps — all three read the same
 * `Ring Day Areas` layer off the same service, so they share its symbology too.
 *
 * The published renderer draws `Closure` as a solid red fill, which reads as a filled block rather
 * than a closed-off area (Houston St on Ring Day, Day 2 is the clearest example). Every category is
 * reproduced here as published so the legend is unchanged, except `Closure`, which picks up the
 * shared closure hatch.
 */
export const ringDayAreasRenderer = {
  type: 'unique-value',
  field: 'type',
  uniqueValueInfos: [
    {
      value: 'Accessible',
      label: 'Accessible Path',
      symbol: solidFill([0, 112, 255, 255], [110, 110, 110, 255], 0.7)
    },
    {
      value: 'Event Parking',
      label: 'Event Parking',
      symbol: solidFill([0, 197, 255, 255], [0, 112, 255, 255], 2)
    },
    {
      value: 'Sales',
      label: 'Aggie Ring Day Marketplace',
      symbol: solidFill([56, 168, 0, 255], [110, 110, 110, 255], 0)
    },
    {
      value: 'Ticketed Area',
      label: 'Ticketed Area',
      symbol: {
        type: 'simple-fill',
        style: 'backward-diagonal',
        color: [233, 196, 106, 255],
        outline: {
          type: 'simple-line',
          style: 'solid',
          color: [233, 196, 106, 255],
          width: 1
        }
      }
    },
    {
      value: 'Gathering Area',
      label: 'Gathering Area',
      symbol: solidFill([115, 0, 0, 255], [110, 110, 110, 255], 0)
    },
    {
      value: 'Closure',
      label: 'Lot or Street Closure',
      symbol: closureHatchSymbol
    },
    {
      value: 'The Williams Alumni Center',
      label: 'The Williams Alumni Center',
      symbol: {
        type: 'simple-fill',
        style: 'diagonal-cross',
        color: [137, 68, 68, 255],
        outline: {
          type: 'simple-line',
          style: 'solid',
          color: [115, 0, 0, 255],
          width: 1
        }
      }
    },
    {
      value: '$5 Event Parking',
      label: '$10 Event Parking',
      symbol: solidFill([233, 196, 106, 255], [110, 110, 110, 255], 0.7)
    },
    {
      value: 'Lot Specific Permit Required',
      label: 'Lot Specific Permit Required',
      symbol: solidFill([244, 162, 97, 255], [110, 110, 110, 255], 0.7)
    }
  ]
} as unknown as FeatureRenderer;
