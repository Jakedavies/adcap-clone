import React from "react";
import { IManager } from "./../config/managers";
import GameContext from "../lib/GameContext";

interface ManagerProps {
  owned: boolean;
  balance: number;
  manager: IManager;
}

export default function Manager({ owned, manager, balance }: ManagerProps) {
  // @ts-ignore
  const { dispatch } = React.useContext(GameContext);

  return (
    <div
      className={`manager ${manager.cost < balance ? "purchasable" : ""} `}
      onClick={() => {
        if (manager.cost < balance) {
          dispatch({ type: "buyManager", payload: { managerId: manager.id } });
        }
      }}
    >
      <div>
        <h4>{manager.name}</h4>
        <p>{manager.description}</p>
        <p style={{ fontWeight: 600 }}>${manager.cost}</p>
      </div>
    </div>
  );
}
