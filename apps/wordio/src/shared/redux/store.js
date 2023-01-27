import { applyMiddleware, createStore, combineReducers } from "redux";
import { composeWithDevTools } from "@redux-devtools/extension";

/*
	MIDDLEWARE
	will intercept each action, and do something before the reducers
*/
import thunk from "redux-thunk";

/*
	REDUCERS
	will receive an action (and state), and modify the state
*/
import reducer_account from "./reducers/account";
import reducer_output from "./reducers/output";
import reducer_input from "./reducers/input";
import reducer_ui from "./reducers/ui";

let reducers = combineReducers({
  account: reducer_account,
  output: reducer_output,
  input: reducer_input,
  ui: reducer_ui,
});

/*
	STORE
	**global** "state" accessible by multiple components,
	rather than an individual component's local private state (this.state)
*/
const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunk)));

export default store;
