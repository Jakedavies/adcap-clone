import { useEffect, useState } from "react";
import reduce, { IState, IDispatch } from "../reducers";
import useActionSync from "./useActionSync";
import { getState } from "./../lib/api";

export default function useGameState(deviceId: string) {
  // app state load
  const [state, setState] = useState<IState | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<undefined | Error>(undefined);
  const [additionalIncome, setAdditionalIncome] = useState(0);

  function onSyncError(state: IState, error: Error) {
    setState(state);
    setError(error);
  }

  const { addActionToSync } = useActionSync(deviceId, onSyncError);

  function dispatch(action: IDispatch) {
    console.log("dispatching");
    // @ts-ignore
    setState(state => reduce(state, action));

    addActionToSync(action);
  }

  // initiallizes the state
  useEffect(() => {
    if (state) return;
    getState(deviceId)
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
  }, [state, deviceId]);

  return { state, dispatch, loading, error, additionalIncome };
}
