import React, { useState, useEffect } from "react";
import { IBuilding } from "./../config/buildings";
import GameContext from "../lib/GameContext";
import { managersByBuildingId } from "./../config/managers";

interface IBuildingProps {
  building: IBuilding;
  tierIndex: number;
  balance: number;
}

const PROGRESS_TICK_RATE = 20;

export default function Building({
  building,
  tierIndex,
  balance
}: IBuildingProps) {
  // @ts-ignore
  const { dispatch, state } = React.useContext(GameContext);

  const [working, setWorking] = useState<undefined | number>(undefined);
  const [progress, setProgress] = useState(0);

  const tier = building.tiers[tierIndex] ?? building.tiers[0];

  const manager = managersByBuildingId[building.id];
  const managerOwned = manager && state.managers.includes(manager.id);
  const nextTier = building.tiers[tierIndex + 1];

  const upgrade = () => {
    if (nextTier.cost > balance) return;

    dispatch({
      type: "buildBuilding",
      payload: { buildingId: building.id, createdAt: Date.now() }
    });
  };

  const doWork = () => {
    if (!working) {
      const progressPerTick = PROGRESS_TICK_RATE / (building.timeout * 1000);

      const timer = window.setInterval(() => {
        setProgress(p => p + progressPerTick);
      }, PROGRESS_TICK_RATE);

      setWorking(timer);
    }
  };

  useEffect(() => {
    if (working) {
      setTimeout(() => {
        window.clearInterval(working);
        setWorking(undefined);
        dispatch({
          type: "workComplete",
          payload: { buildingId: building.id, completedAt: Date.now() }
        });
        setProgress(0);
      }, building.timeout * 1000);
    }
  }, [working, building.timeout]);

  useEffect(() => {
    if (managerOwned && !working) {
      doWork();
    }
  }, [working, managerOwned]);

  return (
    <div
      className={`building tier-${tierIndex} ${tierIndex < 0 &&
        nextTier.cost < balance &&
        "purchasable"}`}
    >
      {tierIndex >= 0 ? (
        <div>
          <div
            style={{
              height: "5px",
              backgroundColor: "green",
              width: `${progress * 100}%`
            }}
          />
          <h4>
            {tier.name} {working && "(Working)"}
          </h4>
          {managerOwned && (
            <p>
              Being worked by{" "}
              <span style={{ fontWeight: "bold" }}>{manager.name}</span>
            </p>
          )}
          <button disabled={!!working} onClick={doWork}>
            Work
          </button>
          {nextTier && (
            <button
              disabled={(!!working && !managerOwned) || nextTier.cost > balance}
              onClick={upgrade}
            >
              Upgrade Building ${nextTier.cost}
            </button>
          )}
        </div>
      ) : (
        <div onClick={upgrade}>
          <h4>{building.name}</h4>
          <p style={{ fontWeight: 600 }}>${nextTier.cost}</p>
        </div>
      )}
    </div>
  );
}
