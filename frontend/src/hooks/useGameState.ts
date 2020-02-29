import { useEffect, useState } from "react";
import reduce, { IState } from "../reducers";

export interface IDispatch {
  type: string;
  payload: any;
}

const SYNC_FREQUENCY = 500;
const BACKEND_URL = "http://localhost:3030";

export default function useGameState(deviceId: string) {
  // app state load
  const [state, setState] = useState<IState | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<undefined | Error>(undefined);
  const [additionalIncome, setAdditionalIncome] = useState(0);

  // syncing state. NOTE: An improvement might be to seperate these concerns (syncing vs app state)
  const [actionSyncBuffer, setActionSyncBuffer] = useState<IDispatch[]>([]);
  const [lastSync, setLastSync] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // this effect is basically a debounced sync
  useEffect(() => {
    if (syncing) return;
    if (lastSync + SYNC_FREQUENCY > Date.now()) return;

    // grab the current buffer and then reset it
    setSyncing(true);
    const submitBuffer = actionSyncBuffer;
    setActionSyncBuffer([]);

    fetch(`${BACKEND_URL}/state/${deviceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions: submitBuffer })
    })
      .then(res => res.json())
      .then(({ state, error }: { state: IState; error: string }) => {
        // if we got an error property back it means the state
        // could not be applied because of a reducer error
        // reset state and buffer
        if (error) {
          setActionSyncBuffer([]);
          setError(new Error(error));
          setState(state);
        }
        setLastSync(Date.now());
        setSyncing(false);
      })
      .catch(e => {
        // if an unexpected error occurs we do not reset state
        // we set up so we can retry syncing by pushing the actions back to the start of the buffer
        setActionSyncBuffer(submitBuffer.concat(actionSyncBuffer));
        setLastSync(Date.now());
        setSyncing(false);
        setError(e.message);
      });
  }, [syncing, lastSync, actionSyncBuffer, deviceId]);

  function dispatch(action: IDispatch) {
    // @ts-ignore
    setState(state => reduce(state, action));

    setActionSyncBuffer(b => b.concat(action));
  }

  // initiallizes the state
  useEffect(() => {
    fetch(`${BACKEND_URL}/state/${deviceId}`)
      .then(res => res.json())
      .then(response => {
        if (response.error) setError(response.error);
        setState(response.state);
        setAdditionalIncome(response.additionalIncome);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [deviceId]);

  return { state, dispatch, loading, error, additionalIncome };
}
