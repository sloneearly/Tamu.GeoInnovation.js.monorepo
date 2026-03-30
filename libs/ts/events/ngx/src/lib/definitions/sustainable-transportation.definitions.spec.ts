import { LayerSource } from '@tamu-gisc/common/types';

class MockMarkdownPopupComponent {}

jest.mock('../modules/popups/markdown-popup/markdown-popup.component', () => ({
  MarkdownPopupComponent: MockMarkdownPopupComponent
}));

import {
  SUSTAINABLE_TRANSPORTATION_LAYERS,
  SustainableTransportationColdLayerSources
} from './sustainable-transportation.definitions';

type FeatureLayerSource = Extract<LayerSource, { type: 'feature' }>;

describe('SustainableTransportationColdLayerSources', () => {
  const getSource = (id: SUSTAINABLE_TRANSPORTATION_LAYERS) => {
    return SustainableTransportationColdLayerSources.find((source) => source.id === id) as FeatureLayerSource;
  };

  it('includes the expected sustainable transportation layers on the map', () => {
    expect(SustainableTransportationColdLayerSources.map((source) => source.id)).toEqual([
      SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_MAIN,
      SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_RELLIS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.HUB_CORRALS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.SHARED_MOBILITY_RACKS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_LANES,
      SUSTAINABLE_TRANSPORTATION_LAYERS.CITY_BIKE_LANES_ROUTES,
      SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_DISMOUNT_ZONES
    ]);
  });

  it('wires point-layer popups for the remaining interactive transportation features', () => {
    const pointLayerIds = [
      SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_MAIN,
      SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_RELLIS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.HUB_CORRALS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.SHARED_MOBILITY_RACKS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
      SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS
    ];

    pointLayerIds.forEach((id) => {
      const source = getSource(id);

      expect(source.popupComponent).toBe(MockMarkdownPopupComponent);
      expect(source.native?.outFields).toEqual(['*']);
    });
  });

  it('uses hosted-view field names that expose EV, bike rack, and bike fix station details in popups', () => {
    const evSource = getSource(SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_MAIN);
    const bikeRackSource = getSource(SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS);
    const bikeFixSource = getSource(SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS);

    expect(evSource.popupData).toEqual(
      expect.objectContaining({
        name: '{attributes.ev_id}',
        description: expect.stringContaining('{attributes.ch_level}')
      })
    );

    expect(bikeRackSource.popupData).toEqual(
      expect.objectContaining({
        name: '{attributes.type}',
        description: expect.stringContaining('{attributes.typequantity}')
      })
    );

    expect(bikeFixSource.popupData).toEqual(
      expect.objectContaining({
        name: '{attributes.bike_sta_name}',
        description: expect.stringContaining('{attributes.bike_amenities}')
      })
    );
  });

  it('lets the live service renderer draw EV chargers', () => {
    const evSources = [
      getSource(SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_MAIN),
      getSource(SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_RELLIS)
    ];

    evSources.forEach((source) => {
      expect(source.native?.renderer).toBeUndefined();
    });
  });
});
