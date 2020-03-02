import React from "react";
import useGameState from "./hooks/useGameState";
import Game from "./components/Game";
import GameContext from "./lib/GameContext";
import { resetDeviceId, getDeviceId } from "./lib/device";

const uuid = getDeviceId();

function App() {
  const { error, state, dispatch, loading, additionalIncome } = useGameState(
    uuid
  );

  return (
    // @ts-ignore
    <GameContext.Provider value={{ dispatch, state }}>
      <div className="App">
        <header className="App-header">
          <h1>definitely not an adventure capitalist ripoff</h1>
        </header>
        {!loading && additionalIncome > 0 && (
          <h4>You earned ${additionalIncome} while you were away.</h4>
        )}

        {error && <p className="error">{error.message}</p>}

        {!loading && state && <Game />}

        {!loading && (
          <div className="container">
            <hr />
            <button className="reset-device" onClick={() => resetDeviceId()}>
              Reset Game
            </button>
          </div>
        )}
      </div>
    </GameContext.Provider>
  );
}

export default App;
