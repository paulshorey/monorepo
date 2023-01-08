/*
  0) DEFAULT STATE:
*/
const defaultState = loadState() || {}

/*
  1) REDUCE STATE:
*/
const ThisReducer = (state = defaultState, action) => {
  let newState = { ...state }

  /*
	  2) HANDLE ACTIONS:
	*/
  switch (action.type) {
    case "RX_ACCOUNT_LOGIN":
      newState = { ...action.data }
      break

    default:
      break
  }

  /*
	  3) RETURN (COPY OF) STATE:
	*/
  saveState(newState)
  return newState
}
export default ThisReducer

/*
   4) PERSIST STATE (GET/SAVE TO/FROM LOCAL STORAGE):
*/

function loadState() {
  try {
    const serializedState = localStorage.getItem("rx_state_account")
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

function saveState(state) {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem("rx_state_account", serializedState)
  } catch (err) {
    // Ignore write errors
  }
}
