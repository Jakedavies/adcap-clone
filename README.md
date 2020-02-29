# Description

A browser based adventure capitalist clone with basic functionality. Features:
- Purchasing of buildings
- Purchasing of managers
- Ability to "work" a building to earn money after the "work" is completed
- When a manager is purchased the associated building should be worked automatically
- When the user is offline and reload the applicaiton, any managers assigned should have earned income while the user was away.
- Full stack application with backend validation and syncing from the backend
- User can reset their application to start over


Deployed demo can be found [here](https://adcap.jakedavies.info)


## Architecture

Straight forward frontend react app + nodejs backend + postgres. Backend/frontend communication is a via simple API.
Core architecture decision being the shared `reducers` that are used to optimistically update the UI state and also update stored state while also validating. If validation fails then state is reverted to last known good.

*User state definition*

```
interface IState {
  buildings: { [key: number]: { tier: number; lastCompletedAt: number } };
  managers: number[];
  money: number;
}

interface Action {
  type: string;
  payload: any;
}
```


### Backend

Backend has two core functions, get state and save state. 

- `GET /state/:deviceId` will upsert the user based on their device_id (generated and saved on the frontend) and return the current state. In addition when the app state is loaded, we fast forward any work done by "managers" before sending the state to the client. The income earned from fast-forwarding is `additionalIncome`.

> Response `{state: IState, incomeEarned, additionalIncome: number}`

- `POST /state/:deviceId` applies state updates in order. If an update occurs applying any of the state update, an error and the last-known-good state are returned

> Request `{actions: Action[]}`

> Response `{state: IState, error?: string }`

Knex is used for querying as well as migrations.
Schema:
```
(users)
  id: integer primary key
  device_id: varchar(255)
  state: text

```


### Frontend

- On initial load a deviceId is generated and stored in local browser storage, user can reset this which will generate a new deviceId which will reset their application
- Uses a simple state object injected via context and a redux-like dispatch pattern to trigger reducers with payloads
- the useGameState hook does a lot the heavy lifting with respect to backend communication and initializing the application
> This hook buffers state updates and syncs to backend every 500 milliseconds

## Tradeoffs

- No user authentication. We simply generate a device_id on frontend load and save that, user authentication/management seemed out of scope.
- 1 client at a time right now, because of the way state is fast forwarded, running multiple clients will mess this up. This is currently not enforced but revision ID's would allow us to enforce this.
- Not much work was put into ui design, I'm certainly not a designer. 

## Possible Improvements

- styling is sloppy combination of inline + single css file. Real world I would normally use styled-components organized with some sanity and some shared css.
- Replace the symlink module sharing with lerna or something so we can treat them as a shared node module.
- I didn't bother adding indexes to the db but for a start you definetly want one a unique one on users.device_id since its our lookup key most of the time.
- I would normally dockerize the whole app so that to get started development you just run `docker-compose up`. I didn't bother here.


## Development 
- Start the database `docker-compose up -d`
- Run migrations from backend/ `yarn run migrate `
- Start the backend (from backend/ again) `yarn run dev`
- From another terminal start the frontend in frontend/ folder `yarn run start`

