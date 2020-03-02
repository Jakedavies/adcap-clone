import applyAction, { IState } from "../reducers";
import { managersById } from "./../config/managers";
import { buildingsById } from "./../config/buildings";
import { applyActions, fastForwardGameState } from "../lib/game-state";
import UserService from "./../services/user";

export default function indexRoute(server, options, next) {
  server.get("/state/:deviceId", async (req, res) => {
    const User = new UserService({ knex: server.knex });
    const { state } = await User.getState(req.params.deviceId);
    const { state: newState, additionalIncome } = fastForwardGameState(state);

    await User.updateUserState(req.params.deviceId, newState);

    return { state: newState, additionalIncome };
  });

  server.post("/state/:deviceId", async (req, res) => {
    const User = new UserService({ knex: server.knex });

    const user = await User.getState(req.params.deviceId);
    if (!user) throw new Error("Unknown User");

    // apply all the state updates we were sent
    const { state: newState, error } = applyActions(
      user.state,
      req.body.actions
    );

    if (!error) {
      await User.updateUserState(req.params.deviceId, newState);
    }

    // response with the new state
    return { state: newState };
  });

  next();
}
