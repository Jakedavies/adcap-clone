export interface IBuildingTier {
  cost: number;
  income: number;
  name: string;
}

export interface IBuilding {
  timeout: number;
  name: string;
  id: number;
  tiers: IBuildingTier[];
}

export const buildings: IBuilding[] = [
  {
    name: "Lemonade Stand",
    id: 1,
    timeout: 0.3,
    tiers: [
      {
        cost: 10,
        income: 1,
        name: "Cardboard Lemonade Stand"
      },
      {
        cost: 100,
        income: 10,
        name: "Scrap Wood Lemonade Stand"
      },
      {
        cost: 500,
        income: 100,
        name: "Fine Lumber Lemonade Stand"
      },
      {
        cost: 1000,
        income: 150,
        name: "Rich Mahogany Lemonade Stand"
      }
    ]
  },
  {
    name: "Crab Shop",
    id: 2,
    timeout: 1,
    tiers: [
      {
        cost: 800,
        income: 160,
        name: "Joe's Crab Shack"
      },
      {
        cost: 3200,
        income: 600,
        name: "Joe's Crab Emporium"
      },
      {
        cost: 8800,
        income: 1800,
        name: "Joe's Crab Empire"
      },
      {
        cost: 29000,
        income: 15000,
        name: "CRABWORLD"
      }
    ]
  },
  {
    name: "Brewery",
    id: 3,
    timeout: 4,
    tiers: [
      {
        cost: 15000,
        income: 5000,
        name: "Dank Basement Brewing Co."
      },
      {
        cost: 80000,
        income: 14000,
        name: "Crafty Hopz Microbrewery"
      },
      {
        cost: 260000,
        income: 60000,
        name: "Craft Beer Market"
      },
      {
        cost: 1000000,
        income: 89000,
        name: "Molson Coors Subsidiary 18211233452 LTD "
      }
    ]
  }
];

export const buildingsById: { [id: number]: IBuilding } = buildings.reduce(
  (acc, building) => ({
    ...acc,
    [building.id]: building
  }),
  {}
);
