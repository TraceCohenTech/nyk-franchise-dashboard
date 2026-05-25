export interface Season {
  season: string;
  wins: number;
  losses: number;
  pct: number;
  coach: string;
  playoffs: string;
  playoffResult: string;
  seed: number | null;
  era: string;
  leadScorer: string;
  leadPPG: number;
  leadRebounder: string;
  leadRPG: number;
  leadAssist: string;
  leadAPG: number;
  allStars: string[];
  keyPlayers: string[];
  note: string;
  offRtg: number;
  defRtg: number;
  pace: number;
}

export const SEASONS: Season[] = [
  { season: "1998-99", wins: 27, losses: 23, pct: .540, coach: "Jeff Van Gundy", playoffs: "NBA Finals", playoffResult: "Lost to Spurs 1-4", seed: 8, era: "Finals Run", leadScorer: "Allan Houston", leadPPG: 18.2, leadRebounder: "Patrick Ewing", leadRPG: 8.8, leadAssist: "Charlie Ward", leadAPG: 5.2, allStars: ["Patrick Ewing"], keyPlayers: ["Allan Houston","Latrell Sprewell","Patrick Ewing","Larry Johnson","Marcus Camby","Charlie Ward"], note: "8-seed magic run to Finals. Lockout-shortened 50-game season.", offRtg: 99.8, defRtg: 96.2, pace: 87.4 },
  { season: "1999-00", wins: 50, losses: 32, pct: .610, coach: "Jeff Van Gundy", playoffs: "ECF", playoffResult: "Lost to Pacers 2-4", seed: 3, era: "Finals Run", leadScorer: "Allan Houston", leadPPG: 19.7, leadRebounder: "Patrick Ewing", leadRPG: 9.8, leadAssist: "Charlie Ward", leadAPG: 4.7, allStars: ["Allan Houston"], keyPlayers: ["Allan Houston","Latrell Sprewell","Patrick Ewing","Larry Johnson","Marcus Camby","Kurt Thomas"], note: "First 50-win season since 96-97. Ewing's final full season.", offRtg: 101.3, defRtg: 100.4, pace: 89.8 },
  { season: "2000-01", wins: 48, losses: 34, pct: .585, coach: "Jeff Van Gundy", playoffs: "First Round", playoffResult: "Lost to Raptors 2-3", seed: 4, era: "Post-Ewing", leadScorer: "Allan Houston", leadPPG: 20.2, leadRebounder: "Marcus Camby", leadRPG: 11.5, leadAssist: "Mark Jackson", leadAPG: 5.5, allStars: ["Allan Houston"], keyPlayers: ["Allan Houston","Latrell Sprewell","Marcus Camby","Kurt Thomas","Glen Rice"], note: "Ewing traded to Seattle. First-round upset by Raptors.", offRtg: 100.2, defRtg: 98.9, pace: 90.1 },
  { season: "2001-02", wins: 30, losses: 52, pct: .366, coach: "Don Chaney", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Dark Ages", leadScorer: "Allan Houston", leadPPG: 20.0, leadRebounder: "Kurt Thomas", leadRPG: 8.8, leadAssist: "Mark Jackson", leadAPG: 6.2, allStars: [], keyPlayers: ["Allan Houston","Latrell Sprewell","Kurt Thomas","Shandon Anderson"], note: "First missed playoffs since 1986-87. End of 14-year streak.", offRtg: 97.1, defRtg: 101.5, pace: 89.2 },
  { season: "2002-03", wins: 37, losses: 45, pct: .451, coach: "Don Chaney", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Dark Ages", leadScorer: "Allan Houston", leadPPG: 22.5, leadRebounder: "Kurt Thomas", leadRPG: 7.9, leadAssist: "Howard Eisley", leadAPG: 4.6, allStars: [], keyPlayers: ["Allan Houston","Kurt Thomas","Antonio McDyess","Shandon Anderson"], note: "Houston's best scoring season. Team still missed playoffs.", offRtg: 98.5, defRtg: 101.2, pace: 90.5 },
  { season: "2003-04", wins: 39, losses: 43, pct: .476, coach: "Don Chaney / Lenny Wilkens", playoffs: "First Round", playoffResult: "Lost to Nets 0-4", seed: 7, era: "Dark Ages", leadScorer: "Stephon Marbury", leadPPG: 20.2, leadRebounder: "Kurt Thomas", leadRPG: 8.5, leadAssist: "Stephon Marbury", leadAPG: 8.9, allStars: [], keyPlayers: ["Stephon Marbury","Allan Houston","Kurt Thomas","Penny Hardaway","Tim Thomas"], note: "Marbury arrives mid-season. Swept by Nets in first round.", offRtg: 99.8, defRtg: 101.1, pace: 89.7 },
  { season: "2004-05", wins: 33, losses: 49, pct: .402, coach: "Lenny Wilkens / Herb Williams", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Isiah Era", leadScorer: "Stephon Marbury", leadPPG: 21.7, leadRebounder: "Kurt Thomas", leadRPG: 8.2, leadAssist: "Stephon Marbury", leadAPG: 8.1, allStars: [], keyPlayers: ["Stephon Marbury","Jamal Crawford","Kurt Thomas","Tim Thomas"], note: "Isiah Thomas takes over as GM. Wilkens resigns mid-season.", offRtg: 101.8, defRtg: 106.2, pace: 91.3 },
  { season: "2005-06", wins: 23, losses: 59, pct: .280, coach: "Larry Brown", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Isiah Era", leadScorer: "Stephon Marbury", leadPPG: 16.3, leadRebounder: "Channing Frye", leadRPG: 7.0, leadAssist: "Stephon Marbury", leadAPG: 6.1, allStars: [], keyPlayers: ["Stephon Marbury","Jamal Crawford","Eddy Curry","Channing Frye","Quentin Richardson"], note: "$124M payroll, 23 wins. Larry Brown fired after 1 season.", offRtg: 101.0, defRtg: 108.6, pace: 91.7 },
  { season: "2006-07", wins: 33, losses: 49, pct: .402, coach: "Isiah Thomas", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Isiah Era", leadScorer: "Eddy Curry", leadPPG: 19.5, leadRebounder: "Eddy Curry", leadRPG: 7.0, leadAssist: "Stephon Marbury", leadAPG: 5.4, allStars: [], keyPlayers: ["Eddy Curry","Stephon Marbury","Jamal Crawford","David Lee","Quentin Richardson","Steve Francis"], note: "Isiah Thomas becomes coach AND GM. Brawl vs Nuggets.", offRtg: 104.3, defRtg: 107.4, pace: 94.0 },
  { season: "2007-08", wins: 23, losses: 59, pct: .280, coach: "Isiah Thomas", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Isiah Era", leadScorer: "Zach Randolph", leadPPG: 17.6, leadRebounder: "Zach Randolph", leadRPG: 10.3, leadAssist: "Stephon Marbury", leadAPG: 5.4, allStars: [], keyPlayers: ["Zach Randolph","Stephon Marbury","Jamal Crawford","David Lee","Nate Robinson","Quentin Richardson"], note: "Rock bottom. Isiah fired. MSG sexual harassment lawsuit.", offRtg: 103.1, defRtg: 110.4, pace: 94.8 },
  { season: "2008-09", wins: 32, losses: 50, pct: .390, coach: "Mike D'Antoni", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Rebuild", leadScorer: "David Lee", leadPPG: 16.0, leadRebounder: "David Lee", leadRPG: 11.7, leadAssist: "Chris Duhon", leadAPG: 7.2, allStars: ["David Lee"], keyPlayers: ["David Lee","Al Harrington","Nate Robinson","Chris Duhon","Wilson Chandler","Danilo Gallinari"], note: "D'Antoni era begins. Young core developing. Marbury bought out.", offRtg: 104.3, defRtg: 108.3, pace: 97.1 },
  { season: "2009-10", wins: 29, losses: 53, pct: .354, coach: "Mike D'Antoni", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Rebuild", leadScorer: "David Lee", leadPPG: 20.2, leadRebounder: "David Lee", leadRPG: 11.7, leadAssist: "Nate Robinson", leadAPG: 4.1, allStars: ["David Lee"], keyPlayers: ["David Lee","Al Harrington","Wilson Chandler","Danilo Gallinari","Nate Robinson","Tracy McGrady"], note: "Tanking for draft position. Lee has career year before departure.", offRtg: 105.1, defRtg: 110.0, pace: 97.5 },
  { season: "2010-11", wins: 42, losses: 40, pct: .512, coach: "Mike D'Antoni", playoffs: "First Round", playoffResult: "Lost to Celtics 0-4", seed: 6, era: "Melo Era", leadScorer: "Amar'e Stoudemire", leadPPG: 25.3, leadRebounder: "Amar'e Stoudemire", leadRPG: 8.2, leadAssist: "Raymond Felton", leadAPG: 9.0, allStars: ["Amar'e Stoudemire","Carmelo Anthony"], keyPlayers: ["Amar'e Stoudemire","Carmelo Anthony","Chauncey Billups","Toney Douglas","Wilson Chandler"], note: "Stoudemire MVP candidate. Melo traded from Denver mid-season.", offRtg: 107.2, defRtg: 107.5, pace: 95.1 },
  { season: "2011-12", wins: 36, losses: 30, pct: .545, coach: "Mike D'Antoni / Mike Woodson", playoffs: "First Round", playoffResult: "Lost to Heat 1-4", seed: 7, era: "Melo Era", leadScorer: "Carmelo Anthony", leadPPG: 22.6, leadRebounder: "Tyson Chandler", leadRPG: 10.0, leadAssist: "Jeremy Lin", leadAPG: 6.2, allStars: ["Carmelo Anthony","Tyson Chandler"], keyPlayers: ["Carmelo Anthony","Amar'e Stoudemire","Tyson Chandler","Jeremy Lin","J.R. Smith"], note: "LINSANITY! Jeremy Lin goes from couch-surfer to global sensation.", offRtg: 102.9, defRtg: 102.3, pace: 91.4 },
  { season: "2012-13", wins: 54, losses: 28, pct: .659, coach: "Mike Woodson", playoffs: "Conf Semis", playoffResult: "Lost to Pacers 2-4", seed: 2, era: "Melo Era", leadScorer: "Carmelo Anthony", leadPPG: 28.7, leadRebounder: "Tyson Chandler", leadRPG: 10.7, leadAssist: "Raymond Felton", leadAPG: 5.5, allStars: ["Carmelo Anthony","Tyson Chandler"], keyPlayers: ["Carmelo Anthony","J.R. Smith","Tyson Chandler","Raymond Felton","Jason Kidd","Iman Shumpert"], note: "Best record since 96-97. Melo scoring title. First division title since 93-94.", offRtg: 106.1, defRtg: 103.2, pace: 92.9 },
  { season: "2013-14", wins: 37, losses: 45, pct: .451, coach: "Mike Woodson", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Melo Era", leadScorer: "Carmelo Anthony", leadPPG: 27.4, leadRebounder: "Carmelo Anthony", leadRPG: 8.1, leadAssist: "Raymond Felton", leadAPG: 5.6, allStars: ["Carmelo Anthony"], keyPlayers: ["Carmelo Anthony","J.R. Smith","Tyson Chandler","Iman Shumpert","Tim Hardaway Jr."], note: "Phil Jackson hired as president. Woodson fired. Complete collapse.", offRtg: 103.5, defRtg: 106.7, pace: 93.8 },
  { season: "2014-15", wins: 17, losses: 65, pct: .207, coach: "Derek Fisher", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Triangle", leadScorer: "Carmelo Anthony", leadPPG: 24.2, leadRebounder: "Carmelo Anthony", leadRPG: 6.6, leadAssist: "Jose Calderon", leadAPG: 4.7, allStars: ["Carmelo Anthony"], keyPlayers: ["Carmelo Anthony","Jose Calderon","Langston Galloway","Tim Hardaway Jr.","Iman Shumpert"], note: "WORST season in franchise history. Phil's triangle experiment. 65 losses.", offRtg: 101.0, defRtg: 109.1, pace: 95.6 },
  { season: "2015-16", wins: 32, losses: 50, pct: .390, coach: "Derek Fisher / Kurt Rambis", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Triangle", leadScorer: "Carmelo Anthony", leadPPG: 21.8, leadRebounder: "Robin Lopez", leadRPG: 7.3, leadAssist: "Jose Calderon", leadAPG: 4.2, allStars: ["Carmelo Anthony"], keyPlayers: ["Carmelo Anthony","Kristaps Porzingis","Robin Lopez","Arron Afflalo","Jerian Grant"], note: "Kristaps Porzingis drafted! Unicorn era begins. Fisher fired.", offRtg: 102.3, defRtg: 106.4, pace: 95.5 },
  { season: "2016-17", wins: 31, losses: 51, pct: .378, coach: "Jeff Hornacek", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Triangle", leadScorer: "Carmelo Anthony", leadPPG: 22.4, leadRebounder: "Kristaps Porzingis", leadRPG: 7.2, leadAssist: "Derrick Rose", leadAPG: 4.4, allStars: ["Carmelo Anthony","Kristaps Porzingis"], keyPlayers: ["Carmelo Anthony","Kristaps Porzingis","Derrick Rose","Courtney Lee","Joakim Noah"], note: "Rose and Noah acquisitions. Porzingis All-Star. Melo's last season.", offRtg: 105.2, defRtg: 108.5, pace: 96.5 },
  { season: "2017-18", wins: 29, losses: 53, pct: .354, coach: "Jeff Hornacek", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Rebuild 2.0", leadScorer: "Kristaps Porzingis", leadPPG: 22.7, leadRebounder: "Enes Kanter", leadRPG: 11.0, leadAssist: "Trey Burke", leadAPG: 3.6, allStars: ["Kristaps Porzingis"], keyPlayers: ["Kristaps Porzingis","Tim Hardaway Jr.","Enes Kanter","Courtney Lee","Frank Ntilikina"], note: "Porzingis tears ACL in Feb. Melo traded to OKC. Full rebuild begins.", offRtg: 104.8, defRtg: 109.2, pace: 97.6 },
  { season: "2018-19", wins: 17, losses: 65, pct: .207, coach: "David Fizdale", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Rebuild 2.0", leadScorer: "Tim Hardaway Jr.", leadPPG: 19.3, leadRebounder: "Mitchell Robinson", leadRPG: 6.4, leadAssist: "Emmanuel Mudiay", leadAPG: 3.9, allStars: [], keyPlayers: ["Tim Hardaway Jr.","Mitchell Robinson","Kevin Knox","Allonzo Trier","Emmanuel Mudiay"], note: "Tied franchise-worst record. Tank for Zion (got RJ Barrett at #3).", offRtg: 104.6, defRtg: 113.8, pace: 99.4 },
  { season: "2019-20", wins: 21, losses: 45, pct: .318, coach: "David Fizdale / Mike Miller", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Rebuild 2.0", leadScorer: "Julius Randle", leadPPG: 19.5, leadRebounder: "Julius Randle", leadRPG: 9.7, leadAssist: "Elfrid Payton", leadAPG: 7.2, allStars: [], keyPlayers: ["Julius Randle","RJ Barrett","Mitchell Robinson","Marcus Morris","Elfrid Payton"], note: "COVID-shortened. Fizdale fired. Randle signed as free agent.", offRtg: 106.8, defRtg: 112.2, pace: 99.7 },
  { season: "2020-21", wins: 41, losses: 31, pct: .569, coach: "Tom Thibodeau", playoffs: "First Round", playoffResult: "Lost to Hawks 1-4", seed: 4, era: "Thibs Era", leadScorer: "Julius Randle", leadPPG: 24.1, leadRebounder: "Julius Randle", leadRPG: 10.2, leadAssist: "Julius Randle", leadAPG: 6.0, allStars: ["Julius Randle"], keyPlayers: ["Julius Randle","RJ Barrett","Derrick Rose","Immanuel Quickley","Mitchell Robinson","Reggie Bullock"], note: "Thibs COTY! Randle MIP + All-Star. Back to playoffs after 8 years.", offRtg: 110.1, defRtg: 106.7, pace: 97.0 },
  { season: "2021-22", wins: 37, losses: 45, pct: .451, coach: "Tom Thibodeau", playoffs: "Missed", playoffResult: "DNQ", seed: null, era: "Thibs Era", leadScorer: "Julius Randle", leadPPG: 20.1, leadRebounder: "Julius Randle", leadRPG: 9.9, leadAssist: "Julius Randle", leadAPG: 5.1, allStars: [], keyPlayers: ["Julius Randle","RJ Barrett","Evan Fournier","Mitchell Robinson"], note: "Sophomore slump. Randle regresses. Brunson quietly recruited.", offRtg: 110.0, defRtg: 112.4, pace: 97.3 },
  { season: "2022-23", wins: 47, losses: 35, pct: .573, coach: "Tom Thibodeau", playoffs: "Conf Semis", playoffResult: "Lost to Heat 2-4", seed: 5, era: "Brunson Era", leadScorer: "Jalen Brunson", leadPPG: 24.0, leadRebounder: "Julius Randle", leadRPG: 10.0, leadAssist: "Jalen Brunson", leadAPG: 6.2, allStars: ["Julius Randle","Jalen Brunson"], keyPlayers: ["Jalen Brunson","Julius Randle","RJ Barrett","Josh Hart","Mitchell Robinson","Immanuel Quickley"], note: "Brunson's breakout. +10 wins overnight. First Conf Semis since 2013.", offRtg: 114.5, defRtg: 112.3, pace: 97.7 },
  { season: "2023-24", wins: 50, losses: 32, pct: .610, coach: "Tom Thibodeau", playoffs: "Conf Semis", playoffResult: "Lost to Pacers 3-4", seed: 2, era: "Brunson Era", leadScorer: "Jalen Brunson", leadPPG: 28.7, leadRebounder: "Julius Randle", leadRPG: 9.2, leadAssist: "Jalen Brunson", leadAPG: 6.7, allStars: ["Jalen Brunson","Julius Randle"], keyPlayers: ["Jalen Brunson","Julius Randle","OG Anunoby","Josh Hart","Donte DiVincenzo","Mitchell Robinson","Miles McBride"], note: "OG Anunoby trade transforms roster. Brunson 28.7 PPG. Heartbreaking Game 7 loss.", offRtg: 118.3, defRtg: 113.5, pace: 100.4 },
  { season: "2024-25", wins: 51, losses: 31, pct: .622, coach: "Tom Thibodeau", playoffs: "ECF", playoffResult: "Lost to Pacers 2-4", seed: 3, era: "Brunson Era", leadScorer: "Jalen Brunson", leadPPG: 25.7, leadRebounder: "Karl-Anthony Towns", leadRPG: 13.9, leadAssist: "Jalen Brunson", leadAPG: 7.5, allStars: ["Jalen Brunson","Karl-Anthony Towns"], keyPlayers: ["Jalen Brunson","Karl-Anthony Towns","Mikal Bridges","OG Anunoby","Josh Hart","Miles McBride"], note: "KAT & Bridges arrive. Beat Celtics in semis. First ECF since 2000.", offRtg: 117.8, defRtg: 113.0, pace: 100.1 },
  { season: "2025-26", wins: 53, losses: 29, pct: .646, coach: "Tom Thibodeau", playoffs: "ECF (3-0)", playoffResult: "In Progress — 3-0 vs CLE", seed: 3, era: "Brunson Era", leadScorer: "Jalen Brunson", leadPPG: 26.4, leadRebounder: "Karl-Anthony Towns", leadRPG: 13.5, leadAssist: "Jalen Brunson", leadAPG: 7.8, allStars: ["Jalen Brunson","Karl-Anthony Towns"], keyPlayers: ["Jalen Brunson","Karl-Anthony Towns","Mikal Bridges","OG Anunoby","Josh Hart","Mitchell Robinson","Miles McBride","Jordan Clarkson","Jose Alvarado"], note: "NBA Cup champions. 120-66 blowout of Nets. Swept 76ers R2. Up 3-0 vs Cavs in ECF.", offRtg: 118.5, defRtg: 112.8, pace: 100.8 },
];

export interface PlayoffRound {
  round: string;
  opponent: string;
  result: string;
  games: { game: number; result: string; score: string; loc: string; brunsonPts: number; katPts: number; bridgesPts: number }[];
}

export const PLAYOFF_2026: PlayoffRound[] = [
  { round: "R1 vs Hawks", opponent: "Atlanta Hawks", result: "W 4-2", games: [
    { game: 1, result: "W", score: "113-102", loc: "Home", brunsonPts: 31, katPts: 18, bridgesPts: 14 },
    { game: 2, result: "L", score: "106-107", loc: "Home", brunsonPts: 22, katPts: 20, bridgesPts: 16 },
    { game: 3, result: "L", score: "108-109", loc: "Away", brunsonPts: 28, katPts: 15, bridgesPts: 19 },
    { game: 4, result: "W", score: "114-98",  loc: "Away", brunsonPts: 34, katPts: 22, bridgesPts: 18 },
    { game: 5, result: "W", score: "126-97",  loc: "Home", brunsonPts: 27, katPts: 25, bridgesPts: 21 },
    { game: 6, result: "W", score: "140-89",  loc: "Away", brunsonPts: 36, katPts: 19, bridgesPts: 24 },
  ]},
  { round: "R2 vs 76ers", opponent: "Philadelphia 76ers", result: "W 4-0", games: [
    { game: 1, result: "W", score: "137-98",  loc: "Home", brunsonPts: 32, katPts: 24, bridgesPts: 20 },
    { game: 2, result: "W", score: "108-102", loc: "Home", brunsonPts: 29, katPts: 18, bridgesPts: 15 },
    { game: 3, result: "W", score: "108-94",  loc: "Away", brunsonPts: 26, katPts: 22, bridgesPts: 17 },
    { game: 4, result: "W", score: "144-114", loc: "Away", brunsonPts: 38, katPts: 28, bridgesPts: 22 },
  ]},
  { round: "ECF vs Cavs", opponent: "Cleveland Cavaliers", result: "W 3-0 (ongoing)", games: [
    { game: 1, result: "W", score: "115-104", loc: "Home", brunsonPts: 38, katPts: 13, bridgesPts: 18 },
    { game: 2, result: "W", score: "109-93",  loc: "Home", brunsonPts: 19, katPts: 18, bridgesPts: 19 },
    { game: 3, result: "W", score: "121-108", loc: "Away", brunsonPts: 33, katPts: 21, bridgesPts: 16 },
  ]},
];

export const ECF_STATS = [
  { name: "Jalen Brunson",    pts: 30.0, reb: 4.3,  ast: 10.3, fgPct: 48.3, threePct: 15.4, pm: 48,  role: "Star" },
  { name: "Karl-Anthony Towns", pts: 17.3, reb: 13.0, ast: 3.0,  fgPct: 50.0, threePct: 40.0, pm: 31,  role: "Star" },
  { name: "Mikal Bridges",    pts: 18.3, reb: 4.0,  ast: 2.3,  fgPct: 69.6, threePct: 60.0, pm: 52,  role: "Star" },
  { name: "OG Anunoby",       pts: 13.5, reb: 4.5,  ast: 2.5,  fgPct: 41.2, threePct: 30.0, pm: 37,  role: "Star" },
  { name: "Josh Hart",        pts: 19.5, reb: 5.5,  ast: 5.5,  fgPct: 46.9, threePct: 37.5, pm: -5,  role: "Core" },
  { name: "Mitchell Robinson",pts: 4.0,  reb: 5.0,  ast: 0.5,  fgPct: 60.0, threePct: 0,    pm: -9,  role: "Core" },
  { name: "Landry Shamet",    pts: 4.5,  reb: 2.5,  ast: 0,    fgPct: 60.0, threePct: 100.0,pm: 18,  role: "Bench" },
  { name: "Miles McBride",    pts: 2.5,  reb: 3.0,  ast: 2.0,  fgPct: 11.1, threePct: 14.3, pm: 0,   role: "Bench" },
  { name: "Jordan Clarkson",  pts: 3.5,  reb: 1.0,  ast: 0,    fgPct: 60.0, threePct: 50.0, pm: 1,   role: "Bench" },
  { name: "Jose Alvarado",    pts: 2.0,  reb: 1.0,  ast: 0.5,  fgPct: 66.7, threePct: 0,    pm: -3,  role: "Bench" },
];

export const ERA_COLORS: Record<string, string> = {
  "Finals Run":  "#F58426",
  "Post-Ewing":  "#F58426",
  "Dark Ages":   "#475569",
  "Isiah Era":   "#DC2626",
  "Rebuild":     "#8B5CF6",
  "Melo Era":    "#EAB308",
  "Triangle":    "#F59E0B",
  "Rebuild 2.0": "#475569",
  "Thibs Era":   "#006BB6",
  "Brunson Era": "#006BB6",
};

export const ERAS = [
  { name: "Finals Run",  range: "1999-2001", color: "#F58426" },
  { name: "Dark Ages",   range: "2002-2004", color: "#475569" },
  { name: "Isiah Era",   range: "2005-2008", color: "#DC2626" },
  { name: "Rebuild",     range: "2009-2010", color: "#8B5CF6" },
  { name: "Melo Era",    range: "2011-2017", color: "#EAB308" },
  { name: "Rebuild 2.0", range: "2018-2020", color: "#475569" },
  { name: "Brunson Era", range: "2021-2026", color: "#006BB6" },
];

export const ANOMALIES = [
  { title: "8-Seed Finals Run (1999)", desc: "Only the 2nd 8-seed ever to reach the NBA Finals. Won 27 of 50 lockout games, beat #1 Miami, #4 Atlanta, #2 Indiana before falling to Spurs.", severity: "legendary" as const },
  { title: "$124M Payroll → 23 Wins (2005-06)", desc: "NBA's highest payroll at $124M — $74.5M over the cap — and just 23 wins. Larry Brown fired after one season. Historic ROI disaster.", severity: "catastrophic" as const },
  { title: "17-65 × 2 (2015 & 2019)", desc: "Franchise-worst 17-65 TWICE in five years. Phil's triangle experiment, then Fizdale's tank. Same number, same misery, different decades.", severity: "catastrophic" as const },
  { title: "Linsanity — 7 Straight Wins (Feb 2012)", desc: "Jeremy Lin went from sleeping on teammates' couches to global phenomenon. 38 pts vs Lakers. 22.5 PPG in the streak. Then left for Houston for less money than MSG offered.", severity: "legendary" as const },
  { title: "120-66 Nets Demolition (2026)", desc: "54-point blowout — largest victory margin in franchise regular season history. A statement game that made NBA history.", severity: "historic" as const },
  { title: "Brunson's 28.7 PPG Season (2023-24)", desc: "3rd-highest single-season PPG in Knicks history, behind only Bernard King (32.9) and Richie Guerin (29.5). Context: he made $27M/yr vs KD's $45M.", severity: "historic" as const },
  { title: "4 Consecutive Winning Seasons (2023-26)", desc: "47→50→51→53 wins — first sustained competitive run since the Ewing 90s. First time in 27 years fans could plan playoff trips in January.", severity: "historic" as const },
  { title: "The Isiah Double Disaster (2006-08)", desc: "GM AND head coach simultaneously. 56-108 record. MSG sexual harassment lawsuit. Nuggets brawl. Eddy Curry trade. Jerome James contract. Historically bad.", severity: "catastrophic" as const },
];
