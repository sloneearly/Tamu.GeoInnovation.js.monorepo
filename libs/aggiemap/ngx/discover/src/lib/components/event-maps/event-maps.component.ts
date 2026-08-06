import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DiscoverMapType } from '@tamu-gisc/ts/events/ngx';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { DiscoveryService, EVENT_SEASONS, SeasonGroupKey } from '../../services/discovery/discovery.service';
import { getApplicationRoute, sortApplicationsByName } from '../discover.utils';

interface EventMapsRouteData {
  mapType: Extract<DiscoverMapType, 'campus' | 'athletics' | 'operations'>;
  title: string;
  intro?: string;

  /**
   * Lays the maps out in Fall / Spring / Summer columns instead of a single flowed list.
   */
  groupBySeason?: boolean;
}

interface SeasonColumn {
  id: SeasonGroupKey;
  heading: string;
  applications: InternalDiscoverApplication[];
}

const SEASON_HEADINGS: Record<SeasonGroupKey, string> = {
  fall: 'Fall',
  spring: 'Spring',
  summer: 'Summer',
  unscheduled: 'Year-Round'
};

/**
 * Shared page for the map categories that list individual maps (Campus Events, Athletics Events,
 * Operations). The category is supplied via the route `data` so a single component serves every
 * route.
 */
@Component({
  selector: 'tamu-gisc-aggiemap-event-maps',
  templateUrl: './event-maps.component.html',
  styleUrls: ['./event-maps.component.scss']
})
export class EventMapsComponent implements OnInit {
  public title: string;
  public intro?: string;

  /**
   * Backs the flowed (ungrouped) listing.
   */
  public applications: InternalDiscoverApplication[] = [];

  /**
   * Backs the seasonal listing. Empty when the route does not group by season.
   */
  public seasonColumns: SeasonColumn[] = [];

  public groupBySeason = false;

  public readonly getApplicationRoute = getApplicationRoute;

  constructor(private readonly route: ActivatedRoute, private readonly discoveryService: DiscoveryService) {}

  public ngOnInit(): void {
    const data = this.route.snapshot.data as EventMapsRouteData;
    this.title = data.title;
    this.intro = data.intro;
    this.groupBySeason = data.groupBySeason === true;

    if (this.groupBySeason) {
      const grouped = this.discoveryService.getEventApplicationsBySeason(data.mapType);

      // The "Year-Round" column only materializes when a map could not be placed in a season, so
      // the page normally renders the three seasonal columns from the comp.
      const seasons: SeasonGroupKey[] = [...EVENT_SEASONS, 'unscheduled'];

      this.seasonColumns = seasons
        .filter((season) => season !== 'unscheduled' || grouped.unscheduled.length > 0)
        .map((season) => ({
          id: season,
          heading: SEASON_HEADINGS[season],
          applications: grouped[season]
        }));
    } else {
      // Category pages are a navigation directory of every map of this type, not an upcoming-only list.
      this.applications = sortApplicationsByName(
        this.discoveryService.getInternalDiscoverApplications().filter((app) => app.mapType === data.mapType)
      );
    }
  }

  public get hasApplications(): boolean {
    return this.groupBySeason
      ? this.seasonColumns.some((column) => column.applications.length > 0)
      : this.applications.length > 0;
  }
}
