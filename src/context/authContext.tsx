import React from 'react';
import {createContext, useReducer, FC} from 'react';

interface User {
  user: string;
}

interface Action {
  type: string;
  payload: User;
}

const AuthContext = createContext({authState: null, authDispatch: null});

const initialStateUser:User = localStorage.getItem('user') ?
  JSON.parse(localStorage.getItem('user')) : {
    user: '',
  };


const authReducer = (state: User, action:Action) => {
  switch (action.type) {
    case 'LOGIN':
      const loginState = {
        ...state,
        user: action.payload.user,
      };
      localStorage.setItem('user', JSON.stringify(loginState));
      return loginState;
    case 'LOGOUT':
      const logoutState = {
        ...state,
        user: '',
      };
      localStorage.setItem('user', JSON.stringify(logoutState));
      return logoutState;
    default:
      return {
        ...state,
      };
  }
};

const AuthProvider:FC = ({children}) => {
  const [authState, authDispatch] = useReducer(authReducer, initialStateUser);
  return (
    <AuthContext.Provider value={{authState, authDispatch}}>
      {children}
    </AuthContext.Provider>
  );
};


export {
  AuthProvider,
  AuthContext,
};
