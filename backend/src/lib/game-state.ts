import reduceAction, { IState } from "../reducers";
import { managersById } from "./../config/managers";
import { buildingsById } from "./../config/buildings";

// NOTE: This function mutates input. Definetly would not do this usually.
export function fastForwardGameState(state) {
  const activeManagers = state.managers.map(m => managersById[m]);

  let additionalIncome = 0;
  // for every active manager, apply the "work" that was completed while user was away
  for (const manager of activeManagers) {
    const building = buildingsById[manager.buildingId];
    const buildingTimeoutMillis = building.timeout * 1000;
    const { lastCompletedAt, tier: tierIndex } = state.buildings[
      manager.buildingId
    ];
    const tier = building.tiers[tierIndex];

    // figure out how many "work" actions have occurred since the last build
    const completeN = Math.floor(
      (Date.now() - lastCompletedAt) / buildingTimeoutMillis
    );

    additionalIncome += tier.income * completeN;
    const newLastCompletedAt =
      lastCompletedAt + buildingTimeoutMillis * completeN;

    // mutate the building state
    state.buildings[manager.buildingId].lastCompletedAt = newLastCompletedAt;
  }

  state.money = state.money + additionalIncome;
  return { state, additionalIncome };
}

export function applyActions(currentState: IState, actions) {
  try {
    const newState = actions.reduce(reduceAction, currentState);
    return { state: newState };
  } catch (error) {
    // coudln't apply the actions for some reason, revert to last known good.
    return { state: currentState, error: error.message };
  }
}
