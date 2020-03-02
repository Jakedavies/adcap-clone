import applyAction, { IState } from "../reducers";
import reduceAction from "../reducers";

export default class User {
  knex;
  constructor({ knex }) {
    if (!knex) throw new Error("Expected options to contain property 'knex'");
    this.knex = knex;
  }

  async getState(deviceId: string): Promise<{ state: IState }> {
    const [user] = await this.knex("users").where({ device_id: deviceId });

    if (!user) {
      const state = applyAction(null, { type: "init", payload: {} });
      await this.knex("users").insert({
        device_id: deviceId,
        state: JSON.stringify(state)
      });
      return { state: state };
    }

    return { state: JSON.parse(user.state) };
  }

  updateUserState(deviceId, state) {
    return this.knex("users")
      .update({ state: JSON.stringify(state) })
      .where({ device_id: deviceId })
      .limit(1);
  }
}
