import { useEffect, useState } from "react";
import { IState, IDispatch } from "../reducers";
import { syncState } from "./../lib/api";

const SYNC_FREQUENCY = 500;

export default function useActionSync(
  deviceId: string,
  onSyncError: (state: IState, error: Error) => void
) {
  const [actionSyncBuffer, setActionSyncBuffer] = useState<IDispatch[]>([]);
  const [lastSync, setLastSync] = useState(0);
  const [syncing, setSyncing] = useState(false);

  function addActionToSync(action: IDispatch) {
    console.log("adding action");
    setActionSyncBuffer(b => b.concat(action));
  }

  // this effect is basically a debounced sync
  useEffect(() => {
    if (syncing) return;
    if (actionSyncBuffer.length === 0) return;
    if (lastSync + SYNC_FREQUENCY > Date.now()) return;

    console.log("sync effect");

    // grab the current buffer and then reset it
    setSyncing(true);
    const submitBuffer = actionSyncBuffer;
    console.log(submitBuffer);
    setActionSyncBuffer([]);

    syncState(deviceId, submitBuffer)
      .then(({ state, error }: { state: IState; error: string }) => {
        // if we got an error property back it means the state
        // could not be applied because of a reducer error
        // reset state and buffer
        if (error) {
          setActionSyncBuffer([]);
          onSyncError(state, new Error(error));
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
      });
  }, [syncing, lastSync, actionSyncBuffer, deviceId]);

  return { addActionToSync };
}
