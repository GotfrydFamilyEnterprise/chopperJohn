// CAP-01/04/06: shared structural capacity for initialization, rebuild and display.
export const DEFENSE_HITS=Object.freeze({outpost:20,headquarters:6});
export const defenseCapacity=base=>base.main?DEFENSE_HITS.headquarters:DEFENSE_HITS.outpost;
