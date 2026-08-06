import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  EventSeason,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum RING_DAY_LAYERS {
  RD_POIS = 'ring-day-pois',
  RD_ROUTES = 'ring-day-routes',
  RD_AREAS = 'ring-day-areas'
}

const eventUrl = Connections.ringDayUrl;

const RingDayEventDefinitions = {
  RD_AREAS: {
    id: RING_DAY_LAYERS.RD_AREAS,
    layerId: RING_DAY_LAYERS.RD_AREAS,
    name: 'Ring Day Areas',
    url: `${eventUrl}/1`
  },
  RD_ROUTES: {
    id: RING_DAY_LAYERS.RD_ROUTES,
    layerId: RING_DAY_LAYERS.RD_ROUTES,
    name: 'Ring Day Routes',
    url: `${eventUrl}/2`
  },
  RD_POIS: {
    id: RING_DAY_LAYERS.RD_POIS,
    layerId: RING_DAY_LAYERS.RD_POIS,
    name: 'Ring Day Points of Interest',
    url: `${eventUrl}/0`
  }
};

export const RingDayColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: RingDayEventDefinitions.RD_AREAS.id,
    title: RingDayEventDefinitions.RD_AREAS.name,
    url: RingDayEventDefinitions.RD_AREAS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.Notes'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: RingDayEventDefinitions.RD_ROUTES.id,
    title: RingDayEventDefinitions.RD_ROUTES.name,
    url: RingDayEventDefinitions.RD_ROUTES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: RingDayEventDefinitions.RD_POIS.id,
    title: RingDayEventDefinitions.RD_POIS.name,
    url: RingDayEventDefinitions.RD_POIS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

enum RingDayOptions {
  EVENT_DAY = 'event-day'
}

enum EventDay {
  PICKUP = 'day1',
  RING_DAY = 'day2'
}

/**
 * The dates that distinguish one Ring Day occurrence from another. Every occurrence draws from the
 * same Ring Day feature services; the date window is what filters those services down to the
 * features for that occurrence.
 *
 * - `pickup` is the Aggie Ring pickup day that precedes the ceremony.
 * - `start`/`end` bracket the Aggie Ring Day ceremony itself, which may run over multiple days.
 */
interface RingDayOccurrenceDates {
  pickup: string;
  start: string;
  end: string;
}

interface RingDayOccurrence {
  /**
   * Route id and storage key. Also the discover id.
   */
  id: string;

  /**
   * Display name, e.g. "Ring Day (Fall)".
   */
  name: string;

  season: EventSeason;

  dates: RingDayOccurrenceDates;

  /**
   * Human-readable labels for the two builder choices. These spell out the dates, so they are
   * supplied per occurrence rather than generated.
   */
  choiceLabels: {
    pickup: string;
    ringDay: string;
  };

  /**
   * Only one occurrence should register the site-wide toast, otherwise three notifications compete
   * for the user's attention.
   */
  toast?: boolean;
}

/**
 * The three Aggie Ring Day occurrences held each academic year.
 *
 * Fall dates are confirmed against the Association of Former Students' published schedule. The
 * spring and summer dates are placeholders carried at the same weekday/format so the maps are
 * wired up and routable — replace them (and the matching `choiceLabels`) once Transportation
 * Services confirms each occurrence.
 */
const RING_DAY_OCCURRENCES: RingDayOccurrence[] = [
  {
    id: 'ring-day-fall',
    name: 'Ring Day (Fall)',
    season: 'fall',
    dates: { pickup: '2026-10-08', start: '2026-10-09', end: '2026-10-10' },
    choiceLabels: {
      pickup: 'Aggie Ring Pickup (October 8, 2026)',
      ringDay: 'Aggie Ring Day (October 9-10, 2026)'
    },
    toast: true
  },
  {
    // TODO: confirm spring Ring Day dates with Transportation Services / The Association.
    id: 'ring-day-spring',
    name: 'Ring Day (Spring)',
    season: 'spring',
    dates: { pickup: '2027-04-15', start: '2027-04-16', end: '2027-04-17' },
    choiceLabels: {
      pickup: 'Aggie Ring Pickup (April 15, 2027)',
      ringDay: 'Aggie Ring Day (April 16-17, 2027)'
    }
  },
  {
    // TODO: confirm summer Ring Day dates with Transportation Services / The Association.
    id: 'ring-day-summer',
    name: 'Ring Day (Summer)',
    season: 'summer',
    dates: { pickup: '2027-06-24', start: '2027-06-25', end: '2027-06-26' },
    choiceLabels: {
      pickup: 'Aggie Ring Pickup (June 24, 2027)',
      ringDay: 'Aggie Ring Day (June 25-26, 2027)'
    }
  }
];

function buildRingDayConfiguration(occurrence: RingDayOccurrence): EventConfiguration {
  return {
    id: occurrence.id,
    name: occurrence.name,
    applicationName: 'Ring Day Transportation Map',
    shortApplicationName: 'Ring Day Map',
    introductionText: 'Get the best transportation and logistics information for Ring Day.',
    eventDates: [occurrence.dates.pickup, occurrence.dates.start, occurrence.dates.end],
    scheduleUrl: 'https://www.aggienetwork.com/ring/ringday/',
    mapCenter: [-96.33616, 30.60958],
    zoom: 16,
    defaultLayerOverrides: {
      'construction_zone-layer': {
        visible: false
      }
    },
    ...(occurrence.toast
      ? {
          toast: {
            id: `${occurrence.id}-notification`,
            title: 'Ring Day Transportation Map Available',
            message:
              'Attending Ring Day? Click me to open the Ring Day Transportation Map to get the best logistics and transportation information!',
            imgUrl: './assets/images/icons/aggie/Ring Day-Negative.png',
            imgAltText: 'Ring Day Icon',
            acknowledge: true,
            action: {
              type: 'internal' as const,
              value: `/events/${occurrence.id}`
            }
          }
        }
      : {})
  };
}

/**
 * The Event Day step filters each layer to the pickup day or the ceremony window. The layers use
 * different date field names, hence the per-layer field pairs.
 */
function buildRingDayOptions(occurrence: RingDayOccurrence): SpecialEventOptions {
  const { pickup, start, end } = occurrence.dates;

  const dateFilter = (startField: string, endField: string) => [
    {
      input: EventDay.PICKUP,
      expression: `${startField} <= date'${pickup}' AND ${endField} >= date'${pickup}'`
    },
    {
      input: EventDay.RING_DAY,
      expression: `${startField} <= date'${end}' AND ${endField} >= date'${start}'`
    }
  ];

  return [
    {
      value: RingDayOptions.EVENT_DAY,
      label: 'Event Day',
      description:
        'Select which Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
      shortDescription: 'Event Day',
      choices: [
        {
          value: EventDay.PICKUP,
          label: occurrence.choiceLabels.pickup
        },
        {
          value: EventDay.RING_DAY,
          label: occurrence.choiceLabels.ringDay
        }
      ],
      effects: {
        layers: [
          {
            layerId: RING_DAY_LAYERS.RD_AREAS,
            conversions: dateFilter('StartDate', 'EndDate')
          },
          {
            layerId: RING_DAY_LAYERS.RD_ROUTES,
            conversions: dateFilter('Start_Date', 'End_Date')
          },
          {
            layerId: RING_DAY_LAYERS.RD_POIS,
            conversions: dateFilter('Start_Date', 'End_Date')
          }
        ]
      }
    }
  ];
}

function buildRingDayEvent(occurrence: RingDayOccurrence): AggiemapCustomMapConfiguration {
  const configuration = buildRingDayConfiguration(occurrence);

  return {
    type: 'special-event',
    configuration,
    options: buildRingDayOptions(occurrence),
    sources: RingDayColdLayerSources,
    references: RING_DAY_LAYERS,
    discover: {
      id: configuration.id,
      name: configuration.name,
      description: 'Transportation and logistics information for Ring Day celebrations.',
      source: 'internal',
      type: 'event',
      season: occurrence.season,
      keywords: ['ring', 'day', 'aggie', 'ring day', 'transportation', 'parking', 'celebration']
    }
  };
}

export const RingDayEvents: AggiemapCustomMapConfiguration[] = RING_DAY_OCCURRENCES.map(buildRingDayEvent);
