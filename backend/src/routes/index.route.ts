import applyAction, { IState } from "../reducers";
import { managersById } from "./../config/managers";
import { buildingsById } from "./../config/buildings";

export default function indexRoute(server, options, next) {
  function updateDeviceState(deviceId, state) {
    return server
      .knex("users")
      .update({ state: JSON.stringify(state) })
      .where({ device_id: deviceId })
      .limit(1);
  }

  server.get("/state/:deviceId", async (req, res) => {
    const [user] = await server
      .knex("users")
      .where({ device_id: req.params.deviceId });

    // if we don't have a user
    if (!user) {
      const state = applyAction(null, { type: "init", payload: {} });
      await server.knex("users").insert({
        device_id: req.params.deviceId,
        state: JSON.stringify(state)
      });
      return { state: state };
    }

    // if the user existed, we should fast forward the work any managers did when they were gone
    const state: IState = JSON.parse(user.state);

    const activeManagers = state.managers.map(m => managersById[m]);

    // TODO: Would be nice to move the fast forwarding code here somewhere else.
    let additionalIncome = 0;
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

    await updateDeviceState(req.params.deviceId, state);

    return { state: state, additionalIncome };
  });

  server.post("/state/:deviceId", async (req, res) => {
    const [user] = await server
      .knex("users")
      .where({ device_id: req.params.deviceId });

    if (!user) {
      return res.code(403).json({ error: "INVALID_DEVICE" });
    }

    const { actions } = req.body;
    const currentState = JSON.parse(user.state);

    // apply all the state updates we were sent
    let newState;
    try {
      newState = actions.reduce(applyAction, currentState);
      req.log.info(`Applied ${actions.length} actions`);
    } catch (error) {
      // coudln't apply the actions for some reason, revert to last known good.
      return { state: currentState, error: error.message };
    }

    await updateDeviceState(req.params.deviceId, newState);

    // response with the new state
    return { state: newState };
  });

  next();
}
