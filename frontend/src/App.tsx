import React from "react";
import useGameState from "./hooks/useGameState";
import Game from "./components/Game";
import GameContext from "./lib/GameContext";
import { reset, getUserId } from "./lib/userId";

const uuid = getUserId();

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

        {error && <p style={{ color: "red" }}>{error.message}</p>}

        {!loading && state && <Game />}

        {!loading && (
          <div style={{ maxWidth: "650px", margin: "auto", marginTop: "20px" }}>
            <hr style={{ color: "lightgrey" }} />
            <button style={{ marginTop: "20px" }} onClick={() => reset()}>
              Reset Game
            </button>
          </div>
        )}
      </div>
    </GameContext.Provider>
  );
}

export default App;
