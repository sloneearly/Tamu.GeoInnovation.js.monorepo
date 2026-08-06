import { Component } from '@angular/core';

import { FEATURED_PARKING_ID } from '../../services/discovery/discovery.service';

interface QuickLink {
  label: string;
  route: string[];
}

/**
 * "General Parking" quick links box shared by the All Maps landing page and the event category
 * pages. Surfaces the handful of parking maps people most often need alongside an event map,
 * without making them detour through the Parking Maps page.
 */
@Component({
  selector: 'tamu-gisc-maps-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.scss']
})
export class QuickLinksComponent {
  public readonly links: QuickLink[] = [
    { label: 'Campus Main Parking', route: ['/parking', FEATURED_PARKING_ID] },
    { label: 'Visitor Parking', route: ['/parking', 'visitor-parking'] },
    { label: 'Accessible Parking', route: ['/parking', 'accessible-parking'] },
    { label: 'Timed Parking', route: ['/parking', 'timed-parking'] },
    { label: 'Night & Weekend Parking', route: ['/parking', 'night-weekend'] },
    { label: 'Break Parking', route: ['/parking', 'break-summer'] }
  ];
}
