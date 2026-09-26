export interface DashboardStats {
  activeTournaments: number;
  totalTeams: number;
  liveMatches: number;
  completedMatches: number;
}

export const dashboardStats: DashboardStats = {
  activeTournaments: 6,
  totalTeams: 84,
  liveMatches: 3,
  completedMatches: 128,
};

export interface LiveMatch {
  id: string;
  tournament: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  time: string;
}

export const liveMatches: LiveMatch[] = [
  {
    id: "m1",
    tournament: "Summer Invitational",
    teamA: "Ember Wolves",
    teamB: "Iron Falcons",
    scoreA: 2,
    scoreB: 1,
    time: "62'",
  },
  {
    id: "m2",
    tournament: "City League",
    teamA: "Harbor Sharks",
    teamB: "Granite Bears",
    scoreA: 78,
    scoreB: 81,
    time: "Q4 3:12",
  },
  {
    id: "m3",
    tournament: "Regional Cup",
    teamA: "Vortex FC",
    teamB: "Northside United",
    scoreA: 0,
    scoreB: 0,
    time: "12'",
  },
];

export type TournamentStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export type TournamentType =
  | "Single Elimination"
  | "Double Elimination"
  | "Round Robin"
  | "League";

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  type: TournamentType;
  startDate: string;
  endDate: string;
  teamCount: number;
  status: TournamentStatus;
}

export const sportsOptions = [
  "Football",
  "Basketball",
  "Volleyball",
  "Tennis",
  "Cricket",
  "Esports",
];

export const tournamentTypeOptions: TournamentType[] = [
  "Single Elimination",
  "Double Elimination",
  "Round Robin",
  "League",
];

export const tournamentStatusOptions: TournamentStatus[] = [
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
];

export const initialTournaments: Tournament[] = [
  {
    id: "t1",
    name: "Summer Invitational",
    sport: "Football",
    type: "Single Elimination",
    startDate: "2026-06-12",
    endDate: "2026-06-20",
    teamCount: 16,
    status: "Ongoing",
  },
  {
    id: "t2",
    name: "City League",
    sport: "Basketball",
    type: "League",
    startDate: "2026-05-01",
    endDate: "2026-08-30",
    teamCount: 12,
    status: "Ongoing",
  },
  {
    id: "t3",
    name: "Regional Cup",
    sport: "Football",
    type: "Round Robin",
    startDate: "2026-07-01",
    endDate: "2026-07-15",
    teamCount: 8,
    status: "Upcoming",
  },
  {
    id: "t4",
    name: "Winter Classic",
    sport: "Volleyball",
    type: "Double Elimination",
    startDate: "2026-01-10",
    endDate: "2026-01-18",
    teamCount: 10,
    status: "Completed",
  },
  {
    id: "t5",
    name: "Spring Showdown",
    sport: "Tennis",
    type: "Single Elimination",
    startDate: "2026-03-05",
    endDate: "2026-03-12",
    teamCount: 32,
    status: "Completed",
  },
  {
    id: "t6",
    name: "Arena Masters",
    sport: "Esports",
    type: "Double Elimination",
    startDate: "2026-09-01",
    endDate: "2026-09-10",
    teamCount: 24,
    status: "Cancelled",
  },
];

export type TeamStatus = "Active" | "Inactive" | "Disqualified";

export interface Team {
  id: string;
  name: string;
  tournament: string;
  playerCount: number;
  captain: string;
  status: TeamStatus;
  createdDate: string;
  logoUrl?: string;
}

export const teamStatusOptions: TeamStatus[] = ["Active", "Inactive", "Disqualified"];

export const initialTeams: Team[] = [
  {
    id: "team1",
    name: "Ember Wolves",
    tournament: "Summer Invitational",
    playerCount: 18,
    captain: "Jordan Reyes",
    status: "Active",
    createdDate: "2026-05-20",
  },
  {
    id: "team2",
    name: "Iron Falcons",
    tournament: "Summer Invitational",
    playerCount: 20,
    captain: "Casey Okafor",
    status: "Active",
    createdDate: "2026-05-18",
  },
  {
    id: "team3",
    name: "Harbor Sharks",
    tournament: "City League",
    playerCount: 15,
    captain: "Sam Tanaka",
    status: "Active",
    createdDate: "2026-04-02",
  },
  {
    id: "team4",
    name: "Granite Bears",
    tournament: "City League",
    playerCount: 15,
    captain: "Riley Novak",
    status: "Inactive",
    createdDate: "2026-04-05",
  },
  {
    id: "team5",
    name: "Vortex FC",
    tournament: "Regional Cup",
    playerCount: 22,
    captain: "Priya Shah",
    status: "Active",
    createdDate: "2026-06-01",
  },
  {
    id: "team6",
    name: "Northside United",
    tournament: "Regional Cup",
    playerCount: 19,
    captain: "Diego Marín",
    status: "Disqualified",
    createdDate: "2026-06-03",
  },
];

export function getTournamentForTeam(teamName: string): string {
  return initialTeams.find((t) => t.name === teamName)?.tournament ?? "—";
}

export function getTournamentId(tournamentName: string): string {
  return initialTournaments.find((t) => t.name === tournamentName)?.id ?? "";
}

export type MatchStatus = "Upcoming" | "Live" | "Completed" | "Cancelled";

export interface MatchEvent {
  id: string;
  label: string;
  time: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  teamA: string;
  teamB: string;
  scheduledDate: string;
  scheduledTime: string;
  venue: string;
  round: string;
  status: MatchStatus;
  scoreA: number;
  scoreB: number;
  // Live-scoring runtime state. Optional and only populated once a match
  // has been opened on the scoring screen; existing pages ignore these.
  elapsedSeconds?: number;
  timerRunning?: boolean;
  events?: MatchEvent[];
}

export const matchStatusOptions: MatchStatus[] = [
  "Upcoming",
  "Live",
  "Completed",
  "Cancelled",
];

export const roundOptions = [
  "Group Stage",
  "Round 1",
  "Round 2",
  "Quarterfinal",
  "Semifinal",
  "Final",
];

export const initialMatches: Match[] = [
  {
    id: "match1",
    tournamentId: "t1",
    tournamentName: "Summer Invitational",
    teamA: "Ember Wolves",
    teamB: "Iron Falcons",
    scheduledDate: "2026-06-15",
    scheduledTime: "18:00",
    venue: "Riverside Arena",
    round: "Semifinal",
    status: "Live",
    scoreA: 2,
    scoreB: 1,
  },
  {
    id: "match2",
    tournamentId: "t2",
    tournamentName: "City League",
    teamA: "Harbor Sharks",
    teamB: "Granite Bears",
    scheduledDate: "2026-06-15",
    scheduledTime: "19:30",
    venue: "Granite Fieldhouse",
    round: "Week 12",
    status: "Live",
    scoreA: 78,
    scoreB: 81,
  },
  {
    id: "match3",
    tournamentId: "t3",
    tournamentName: "Regional Cup",
    teamA: "Vortex FC",
    teamB: "Northside United",
    scheduledDate: "2026-07-05",
    scheduledTime: "16:00",
    venue: "Northside Park",
    round: "Group Stage",
    status: "Live",
    scoreA: 0,
    scoreB: 0,
  },
  {
    id: "match4",
    tournamentId: "t1",
    tournamentName: "Summer Invitational",
    teamA: "Iron Falcons",
    teamB: "Ember Wolves",
    scheduledDate: "2026-06-20",
    scheduledTime: "17:00",
    venue: "Riverside Arena",
    round: "Final",
    status: "Upcoming",
    scoreA: 0,
    scoreB: 0,
  },
  {
    id: "match5",
    tournamentId: "t2",
    tournamentName: "City League",
    teamA: "Granite Bears",
    teamB: "Harbor Sharks",
    scheduledDate: "2026-06-22",
    scheduledTime: "20:00",
    venue: "Bearclaw Court",
    round: "Week 13",
    status: "Upcoming",
    scoreA: 0,
    scoreB: 0,
  },
  {
    id: "match6",
    tournamentId: "t3",
    tournamentName: "Regional Cup",
    teamA: "Northside United",
    teamB: "Vortex FC",
    scheduledDate: "2026-07-01",
    scheduledTime: "15:00",
    venue: "Northside Park",
    round: "Group Stage",
    status: "Completed",
    scoreA: 2,
    scoreB: 3,
  },
  {
    id: "match7",
    tournamentId: "t2",
    tournamentName: "City League",
    teamA: "Harbor Sharks",
    teamB: "Granite Bears",
    scheduledDate: "2026-05-18",
    scheduledTime: "19:00",
    venue: "Harbor Court",
    round: "Week 10",
    status: "Completed",
    scoreA: 90,
    scoreB: 85,
  },
  {
    id: "match8",
    tournamentId: "t1",
    tournamentName: "Summer Invitational",
    teamA: "Ember Wolves",
    teamB: "Iron Falcons",
    scheduledDate: "2026-06-13",
    scheduledTime: "18:00",
    venue: "Riverside Arena",
    round: "Quarterfinal",
    status: "Cancelled",
    scoreA: 0,
    scoreB: 0,
  },
  {
    id: "match9",
    tournamentId: "t3",
    tournamentName: "Regional Cup",
    teamA: "Vortex FC",
    teamB: "Northside United",
    scheduledDate: "2026-07-03",
    scheduledTime: "16:30",
    venue: "Vortex Ground",
    round: "Round 1",
    status: "Cancelled",
    scoreA: 0,
    scoreB: 0,
  },
];

export type PlayerStatus = "Active" | "Injured" | "Suspended" | "Inactive";

export interface Player {
  id: string;
  name: string;
  team: string;
  jerseyNumber: number;
  position: string;
  status: PlayerStatus;
  createdDate: string;
  photoUrl?: string;
}

export const playerStatusOptions: PlayerStatus[] = [
  "Active",
  "Injured",
  "Suspended",
  "Inactive",
];

export const initialPlayers: Player[] = [
  {
    id: "p1",
    name: "Marco Silva",
    team: "Ember Wolves",
    jerseyNumber: 9,
    position: "Forward",
    status: "Active",
    createdDate: "2026-05-22",
  },
  {
    id: "p2",
    name: "Liam Chen",
    team: "Ember Wolves",
    jerseyNumber: 1,
    position: "Goalkeeper",
    status: "Active",
    createdDate: "2026-05-22",
  },
  {
    id: "p3",
    name: "Noah Whitfield",
    team: "Iron Falcons",
    jerseyNumber: 7,
    position: "Midfielder",
    status: "Injured",
    createdDate: "2026-05-19",
  },
  {
    id: "p4",
    name: "Aiden Brooks",
    team: "Harbor Sharks",
    jerseyNumber: 23,
    position: "Shooting Guard",
    status: "Active",
    createdDate: "2026-04-10",
  },
  {
    id: "p5",
    name: "Elena Petrova",
    team: "Granite Bears",
    jerseyNumber: 34,
    position: "Center",
    status: "Suspended",
    createdDate: "2026-04-12",
  },
  {
    id: "p6",
    name: "Priya Shah",
    team: "Vortex FC",
    jerseyNumber: 10,
    position: "Captain / Midfielder",
    status: "Active",
    createdDate: "2026-06-05",
  },
  {
    id: "p7",
    name: "Diego Marín",
    team: "Northside United",
    jerseyNumber: 4,
    position: "Defender",
    status: "Inactive",
    createdDate: "2026-06-06",
  },
  {
    id: "p8",
    name: "Sofia Martins",
    team: "Vortex FC",
    jerseyNumber: 5,
    position: "Defender",
    status: "Active",
    createdDate: "2026-06-05",
  },
];

