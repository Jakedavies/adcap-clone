export interface IManager {
  name: string;
  id: number;
  cost: number;
  buildingId: number;
  description: string;
}

export const managers: IManager[] = [
  {
    name: "Lemony Lewis",
    description: "Works the lemon stand",
    cost: 100,
    id: 1,
    buildingId: 1
  },
  {
    name: "Crabby Jack",
    description: "Works the crab stand",
    cost: 1400,
    id: 2,
    buildingId: 2
  },
  {
    name: "Drunken Dave",
    description: "Pours beer for the thirsty patrons",
    id: 3,
    buildingId: 3,
    cost: 50000
  }
];

export const managersById: { [id: number]: IManager } = managers.reduce(
  (acc, manager) => ({
    ...acc,
    [manager.id]: manager
  }),
  {}
);

export const managersByBuildingId: { [id: number]: IManager } = managers.reduce(
  (acc, manager) => ({
    ...acc,
    [manager.buildingId]: manager
  }),
  {}
);
