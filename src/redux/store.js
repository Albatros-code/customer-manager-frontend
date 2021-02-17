import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk';

// Reducers
import dataReducers from './reducers/dataReducers';
import userReducers from './reducers/userReducers';
import uiReducers from './reducers/uiReducers';

const initialState = {};

const reducers = combineReducers({
    data: dataReducers,
    user: userReducers,
    ui: uiReducers
});

const middleware = [thunk];

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));

const store = createStore(reducers, initialState, enhancer)

export default store;