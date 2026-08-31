import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { closureHatchSymbol } from './common.definitions';

export enum MS150_LAYERS {
  AVP_PARKING = 'ms150-avp-parking',
  PARKING_LOTS = 'ms150-parking-lots',
  ROUTE = 'ms150-route'
}

const eventUrl = Connections.ms150Url;

export const MS150Definitions = {
  AVP_PARKING: {
    id: MS150_LAYERS.AVP_PARKING,
    layerId: MS150_LAYERS.AVP_PARKING,
    name: 'Parking for any valid Texas A&M permit',
    url: `${eventUrl}/0`
  },
  PARKING: {
    id: MS150_LAYERS.PARKING_LOTS,
    layerId: MS150_LAYERS.PARKING_LOTS,
    name: 'MS150 Parking',
    url: `${eventUrl}/1`
  },
  ROUTE: {
    id: MS150_LAYERS.ROUTE,
    layerId: MS150_LAYERS.ROUTE,
    name: 'MS150 Route',
    url: `${eventUrl}/2`
  }
};

const ms150EventParkingSymbol = {
  type: 'simple-fill',
  style: 'solid',
  color: [81, 179, 54, 255],
  outline: {
    type: 'simple-line',
    style: 'solid',
    color: [68, 137, 112, 255],
    width: 1
  }
};

const ms150ReservedParkingSymbol = {
  type: 'simple-fill',
  style: 'solid',
  color: [242, 160, 97, 255],
  outline: {
    type: 'simple-line',
    style: 'solid',
    color: [110, 110, 110, 255],
    width: 0.7
  }
};

export const MS150ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MS150Definitions.AVP_PARKING.id,
    title: MS150Definitions.AVP_PARKING.name,
    url: MS150Definitions.AVP_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MS150Definitions.PARKING.id,
    title: MS150Definitions.PARKING.name,
    url: MS150Definitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      // The service publishes `Closure` as a solid red fill. Every published class is reproduced
      // here so the legend is unchanged, except the closure, which picks up the shared hatch.
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [
          {
            value: '$10 Event Parking/ParkMobile',
            label: 'Event Parking',
            symbol: ms150EventParkingSymbol
          },
          {
            value: 'Paid Hourly Parking',
            label: 'Event Parking',
            symbol: ms150EventParkingSymbol
          },
          {
            value: '$10 Event Parking/Any Valid Texas A&M Permit',
            label: 'Event Parking',
            symbol: ms150EventParkingSymbol
          },
          {
            value: 'Reserved Parking',
            label: 'Reserved Parking',
            symbol: ms150ReservedParkingSymbol
          },
          {
            value: 'Closure',
            label: 'Closure',
            symbol: closureHatchSymbol
          }
        ]
      }
    }
  },

  {
    type: 'feature',
    id: MS150Definitions.ROUTE.id,
    title: MS150Definitions.ROUTE.name,
    url: MS150Definitions.ROUTE.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: 'rgb(56, 168, 0)',
          width: 2.5,
          style: 'solid',
          marker: {
            style: 'arrow',
            color: 'rgb(56, 168, 0)',
            placement: 'end'
          }
        }
      }
    }
  }
];

export const MS150Configuration: EventConfiguration = {
  id: 'ms150',
  name: 'Bike MS 150',
  applicationName: 'Bike MS 150 Parking Map',
  shortApplicationName: 'Bike MS 150 Map',
  eventDates: ['2026-04-26'],
  zoom: 16,
  mapCenter: [-96.3434, 30.61017]
};

export const MS150Options: SpecialEventOptions = [];

export const MS150Ts: AggiemapCustomMapConfiguration = {
  configuration: MS150Configuration,
  options: MS150Options,
  sources: MS150ColdLayerSources,
  references: MS150_LAYERS,
  type: 'special-event',
  discover: {
    id: MS150Configuration.id,
    name: MS150Configuration.name,
    description: 'Transportation and parking information for Bike MS 150.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    keywords: ['bike', 'ms150', 'cycling', 'parking', 'transportation']
  }
};
