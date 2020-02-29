import { buildings } from "./config/buildings";
import { managers } from "./config/managers";

export interface IState {
  buildings: { [key: number]: { tier: number; lastCompletedAt: number } };
  managers: number[];
  money: number;
}

export interface IReducer {
  (
    state: IState,
    action: {
      type: string;
      payload: any;
    }
  ): IState;
}

// Takes current state and applies the purchase of a building(or tier) if user has enough money

interface buildBuildingPayload {
  buildingId: number;
  createdAt: number;
}

const buildBuilding: IReducer = (
  state: IState,
  { payload: { buildingId, createdAt } }: { payload: buildBuildingPayload }
) => {
  const building = state.buildings[buildingId];
  const nextTierIndex = building ? building.tier + 1 : 0;

  // @ts-ignore
  const tier = buildings.find(b => b.id === buildingId).tiers[nextTierIndex];

  if (state.money < tier.cost) {
    console.log("User did not have enough money");
    throw new Error("Not enough money");
  }

  const BUILD_WINDOW_MILLIS = 1000 * 60 * 1;
  if (
    !building?.lastCompletedAt &&
    createdAt + BUILD_WINDOW_MILLIS < Date.now()
  ) {
    // user is probably cheating, creating a building with a timestamp that is too old
    throw new Error("Invalid building date");
  }

  return {
    ...state,
    money: state.money - tier.cost,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        tier: nextTierIndex,
        // if the building doesn't have a lastCompletedAt, use the createdAt
        lastCompletedAt: building?.lastCompletedAt ?? createdAt
      }
    }
  };
};

// Takes current state and applies the purchase of a manager if user has enough money
const buyManager: IReducer = (
  state: IState,
  { payload: { managerId } }: { payload: { managerId: number } }
) => {
  const manager = managers.find(m => m.id === managerId);

  if (!manager) throw new Error("Invalid manager");

  if (state.money < manager.cost) throw new Error("Not enough money");

  return {
    ...state,
    money: state.money - manager.cost,
    managers: state.managers.concat(managerId)
  };
};

// Takes current state and applies a work action
const workComplete: IReducer = (
  state,
  {
    payload: { buildingId, completedAt }
  }: { payload: { buildingId: number; completedAt: number } }
) => {
  const userBuilding = state.buildings[buildingId];
  const buildingConfig = buildings.find(b => b.id === buildingId);

  // something went wrong, this isn't a real building?
  if (!buildingConfig) throw new Error("Invalid building");

  const { income } = buildingConfig.tiers[userBuilding.tier];

  if (
    completedAt >=
    userBuilding.lastCompletedAt + buildingConfig.timeout * 1000
  ) {
    return {
      ...state,
      money: state.money + income,
      buildings: {
        ...state.buildings,
        [buildingId]: {
          tier: userBuilding.tier,
          lastCompletedAt: completedAt
        }
      }
    };
  }

  throw new Error("Can't work building again that soon");
};

const actionTypes: { [actionName: string]: IReducer } = {
  buildBuilding,
  buyManager,
  workComplete
};

const defaultState = {
  money: 1000,
  buildings: {},
  managers: []
};

const reduceF: IReducer = (state, action) => {
  const f = actionTypes[action.type];
  if (!f) return defaultState;
  return f(state, action);
};

export default reduceF;
