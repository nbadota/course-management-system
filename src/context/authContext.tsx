import React from 'react';
import {createContext, useReducer, FC} from 'react';

interface User {
  user: string;
  grade: number;
}

interface Action {
  type: string;
  payload: User;
}

const AuthContext = createContext({authState: null, authDispatch: null});

const initialStateUser:User = localStorage.getItem('user') ?
  JSON.parse(localStorage.getItem('user')) : {
    user: '',
    grade: 0,
  };


const authReducer = (state: User, action:Action) => {
  switch (action.type) {
    case 'LOGIN':
      const loginState = {
        ...state,
        user: action.payload.user,
        grade: action.payload.grade,
      };
      localStorage.setItem('user', JSON.stringify(loginState));
      return loginState;
    case 'LOGOUT':
      const logoutState = {
        ...state,
        user: '',
        grade: 0,
      };
      localStorage.clear();
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
