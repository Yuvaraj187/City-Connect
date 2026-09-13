// types.ts - RECTIFIED

// ... other types are unchanged ...

export interface Ticket {
  id: string;
  route_id: string;
  route_name: string;
  from_stop: string; // <- NEWLY ADDED
  to_stop: string;   // <- NEWLY ADDED
  passenger_count: number;
  total_fare: number;
  purchase_date: string;
  valid_until: string;
  is_synced: boolean;
  transaction_id: string;
  signature: string;
  status: 'active' | 'validated';
  validated_at?: string;
  validated_on_bus?: string;
  user_id?: string;
}

// ... other types are unchanged ...
import * as React from 'react';
export enum UserRole { Passenger, Authority }
export type PassengerViewType = 'finder' | 'tracker' | 'ticketing' | 'reports' | 'ai' | 'settings';
export type AuthorityViewType = 'analytics' | 'vehicles' | 'live-tracking' | 'tickets' | 'reports' | 'chat' | 'settings';
export interface AuthorityNavItem { id: AuthorityViewType; icon: React.ReactElement; label: string; }
export interface UserProfile { name: string; email: string; phone?: string; homeAddress?: string; workAddress?: string; notifications?: { serviceAlerts: boolean; proximityAlerts: boolean; promotions: boolean; } }
export interface Route { id: string; name: string; from: string; to: string; fare: number; average_eta_minutes: number; stops: string[]; stopsCoords: { lat: number; lng: number }[]; }
export interface Vehicle { id: string; stickerCode?: string; type: string; status: 'On road' | 'Failure' | 'Pause'; location: string; lat: number; lng: number; driver: { name: string; phone: string; }; routeId: string; }
export interface LiveVehicle extends Vehicle { routeDetails: { destination: string; nextStop: string; time: string; distance: string; }; timeline: { time: string; location: string; event: string; details?: string; }[]; }
export type UserReputation = 'Newbie' | 'Regular' | 'Trusted';
export interface User { id: string; name: string; reputation: UserReputation; warnings?: number; isBlocked?: boolean; }
export interface Report {
  id: string;
  type: 'Traffic' | 'Breakdown' | 'Overcrowded' | 'Other';
  location: string;
  description: string;
  upvotes: number;
  downvotes: number;
  verified: boolean;
  reporterId: string;
  reporterName?: string;
  reporterReputation?: UserReputation;
  time: string;
  vehicle_id?: string;
  created_at?: string;
  isSynced: boolean;
  status?: 'active' | 'flagged_false';
  userVote?: 'up' | 'down' | null;
}

export interface UserWarningProfile {
  userId: string;
  userName: string;
  reputation: UserReputation;
  warnings: number;
  isBlocked: boolean;
  totalSubmitted: number;
  totalFlaggedFalse: number;
}