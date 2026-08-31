import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { closureHatchSymbol } from './common.definitions';

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];

export enum MOVE_OUT_LAYERS {
  NO_PARKING = 'No Parking Areas',
  STREET_PARKING = 'Move-Out Allowed Street Parking',
  MOVE_OUT_LOTS = 'Move-Out Lots'
}

const eventUrl = Connections.moveOutParkingUrl;

export const MoveOutDefinitions = {
  NO_PARKING: {
    id: MOVE_OUT_LAYERS.NO_PARKING,
    layerId: MOVE_OUT_LAYERS.NO_PARKING,
    name: 'No Parking Areas',
    url: `${eventUrl}/0`
  },
  STREET_PARKING: {
    id: MOVE_OUT_LAYERS.STREET_PARKING,
    layerId: MOVE_OUT_LAYERS.STREET_PARKING,
    name: 'Move-Out Allowed Street Parking',
    url: `${eventUrl}/1`
  },
  MOVE_OUT_LOTS: {
    id: MOVE_OUT_LAYERS.MOVE_OUT_LOTS,
    layerId: MOVE_OUT_LAYERS.MOVE_OUT_LOTS,
    name: 'Move-Out Lots',
    url: `${eventUrl}/2`
  }
};

export const MoveOutColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveOutDefinitions.NO_PARKING.id,
    title: MoveOutDefinitions.NO_PARKING.name,
    url: MoveOutDefinitions.NO_PARKING.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'Type',
        collapsed: true
      },
      description: {
        field: 'Note',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveOutDefinitions.STREET_PARKING.id,
    title: MoveOutDefinitions.STREET_PARKING.name,
    url: MoveOutDefinitions.STREET_PARKING.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'A_Name',
        collapsed: true
      },
      description: {
        field: 'SP_SH_Notes',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      // `NoParking` is the street closure, and the service publishes it as a solid red fill. The
      // other two published classes are reproduced as-is so only the closure changes.
      renderer: {
        type: 'unique-value',
        field: 'Type',
        uniqueValueInfos: [
          {
            value: 'Disabled',
            label: 'Accessible ONLY',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [0, 92, 230, 255]
            }
          },
          {
            value: 'LZAllWeek',
            label: '1 HR Loading Only',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [56, 168, 0, 255]
            }
          },
          {
            value: 'NoParking',
            label: 'NoParking',
            symbol: closureHatchSymbol
          }
        ]
      }
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: MoveOutDefinitions.MOVE_OUT_LOTS.id,
    title: MoveOutDefinitions.MOVE_OUT_LOTS.name,
    url: MoveOutDefinitions.MOVE_OUT_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.MoveOutN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const MoveOutConfiguration: EventConfiguration = {
  id: 'move-out',
  name: 'Move Out',
  applicationName: 'Move Out Transportation Map',
  shortApplicationName: 'Move Out Map',
  mapCenter: [-96.34046, 30.60798],
  eventDates: [],
  zoom: 16
};

export const MoveOutOptions: SpecialEventOptions = [];

export const MoveOut: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: MoveOutConfiguration,
  options: MoveOutOptions,
  sources: MoveOutColdLayerSources,
  references: MOVE_OUT_LAYERS,
  discover: {
    id: MoveOutConfiguration.id,
    name: MoveOutConfiguration.name,
    description: 'Transportation and parking information for Move Out.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    keywords: ['move out', 'parking', 'transportation']
  }
};
