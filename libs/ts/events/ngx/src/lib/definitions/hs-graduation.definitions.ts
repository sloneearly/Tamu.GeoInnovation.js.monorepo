import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum HS_GRADUATION_LAYERS {
  ACCESSIBLE_BUS_PARKING = 'hs-graduation-accessible-bus-parking',
  ARRIVAL_ROUTES = 'hs-graduation-arrival-routes',
  ARRIVAL_PARKING = 'hs-graduation-arrival-parking',
  DEPARTURE_ROUTES = 'hs-graduation-departure-routes',
  TRAFFIC_ADVISORIES = 'hs-graduation-traffic-advisories',
  DEPARTURE_PARKING = 'hs-graduation-departure-parking'
}

const eventUrl = Connections.hsGraduationUrl;

const HsGraduationEventDefinitions = {
  ACCESSIBLE_BUS_PARKING: {
    id: HS_GRADUATION_LAYERS.ACCESSIBLE_BUS_PARKING,
    name: 'Accessible/Bus Parking',
    url: `${eventUrl}/1`
  },
  ARRIVAL_ROUTES: {
    id: HS_GRADUATION_LAYERS.ARRIVAL_ROUTES,
    name: 'Arrival Recommended Routes',
    url: `${eventUrl}/2`
  },
  ARRIVAL_PARKING: {
    id: HS_GRADUATION_LAYERS.ARRIVAL_PARKING,
    name: 'High School Graduation Parking',
    url: `${eventUrl}/3`
  },
  DEPARTURE_ROUTES: {
    id: HS_GRADUATION_LAYERS.DEPARTURE_ROUTES,
    name: 'Departure Recommended Routes',
    url: `${eventUrl}/5`
  },
  TRAFFIC_ADVISORIES: {
    id: HS_GRADUATION_LAYERS.TRAFFIC_ADVISORIES,
    name: 'Departure Traffic Advisories',
    url: `${eventUrl}/6`
  },
  DEPARTURE_PARKING: {
    id: HS_GRADUATION_LAYERS.DEPARTURE_PARKING,
    name: 'Parking/Closures',
    url: `${eventUrl}/7`
  }
};

const HsGraduationLayerReferences: Record<string, string> = {
  ARRIVAL_PARKING: HS_GRADUATION_LAYERS.ARRIVAL_PARKING,
  DEPARTURE_PARKING: HS_GRADUATION_LAYERS.DEPARTURE_PARKING,
  ACCESSIBLE_BUS_PARKING: HS_GRADUATION_LAYERS.ACCESSIBLE_BUS_PARKING,
  ARRIVAL_ROUTES: HS_GRADUATION_LAYERS.ARRIVAL_ROUTES,
  DEPARTURE_ROUTES: HS_GRADUATION_LAYERS.DEPARTURE_ROUTES,
  TRAFFIC_ADVISORIES: HS_GRADUATION_LAYERS.TRAFFIC_ADVISORIES
};

export const HsGraduationColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.ARRIVAL_PARKING.id,
    title: HsGraduationEventDefinitions.ARRIVAL_PARKING.name,
    url: HsGraduationEventDefinitions.ARRIVAL_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: { field: 'Type' },
      description: { field: 'description' }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 60,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.DEPARTURE_PARKING.id,
    title: HsGraduationEventDefinitions.DEPARTURE_PARKING.name,
    url: HsGraduationEventDefinitions.DEPARTURE_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: { field: 'Type' },
      description: { field: 'description' }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.ACCESSIBLE_BUS_PARKING.id,
    title: HsGraduationEventDefinitions.ACCESSIBLE_BUS_PARKING.name,
    url: HsGraduationEventDefinitions.ACCESSIBLE_BUS_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: { field: 'name' },
      description: { field: 'description' }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 62,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.ARRIVAL_ROUTES.id,
    title: HsGraduationEventDefinitions.ARRIVAL_ROUTES.name,
    url: HsGraduationEventDefinitions.ARRIVAL_ROUTES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: { field: 'name' },
      description: { field: 'description' }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 63,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.DEPARTURE_ROUTES.id,
    title: HsGraduationEventDefinitions.DEPARTURE_ROUTES.name,
    url: HsGraduationEventDefinitions.DEPARTURE_ROUTES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: { field: 'Notes' },
      description: { field: 'description' }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 64,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.TRAFFIC_ADVISORIES.id,
    title: HsGraduationEventDefinitions.TRAFFIC_ADVISORIES.name,
    url: HsGraduationEventDefinitions.TRAFFIC_ADVISORIES.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: { field: 'name' },
      description: { field: 'description' }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 65,
    native: {
      outFields: ['*']
    }
  }
];

export const HsGraduationConfiguration: EventConfiguration = {
  id: 'hs-graduation-2026',
  name: 'High School Graduation',
  applicationName: 'High School Graduation Transportation Map',
  shortApplicationName: 'High School Graduation Map',
  introductionText: 'Get the best transportation and parking information for the high school graduation ceremonies.',
  eventDates: ['2026-05-22', '2026-05-23'],
  mapCenter: [-96.34458, 30.60629],
  zoom: 16,
  legendAllowVisibilityToggle: true
};

export const HsGraduationOptions: SpecialEventOptions = [];

export const HsGraduationTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: HsGraduationConfiguration,
  sources: HsGraduationColdLayerSources,
  options: HsGraduationOptions,
  references: HsGraduationLayerReferences,
  discover: {
    id: HsGraduationConfiguration.id,
    name: HsGraduationConfiguration.name,
    description: 'Transportation and parking information for high school graduation ceremonies.',
    source: 'internal',
    type: 'event',
    keywords: ['high school', 'graduation', 'parking', 'transportation']
  }
};
