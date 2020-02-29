import React from "react";
import { buildings } from "./../config/buildings";
import Building from "./../components/Building";
import Manager from "./../components/Manager";
import GameContext from "../lib/GameContext";
import { managers } from "./../config/managers";

export default function() {
  // @ts-ignore
  const { state } = React.useContext(GameContext);

  const availableManagers = managers.filter(
    m => !state.managers.includes(m.id) && !!state.buildings[m.buildingId]
  );

  return (
    <div className="container">
      <div>
        <h3>
          <span style={{ fontWeight: 200 }}>Balance:</span> ${state.money}{" "}
        </h3>
      </div>
      <div className="buildings-container">
        <h2>Buildings</h2>
        {buildings.map(b => {
          // @ts-ignore
          const ownedTier = state.buildings[b.id]?.tier ?? -1;
          return (
            <Building
              key={b.id}
              balance={state.money}
              building={b}
              tierIndex={ownedTier}
            />
          );
        })}
      </div>
      {availableManagers.length > 0 && (
        <div className="managers-container">
          <h2>Managers</h2>

          {availableManagers.map(manager => {
            const owned = !!state.managers.includes(manager.id);
            return (
              <Manager
                key={manager.id}
                owned={owned}
                balance={state.money}
                manager={manager}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
