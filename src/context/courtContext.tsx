import React from 'react';
import {createContext, useReducer, FC} from 'react';

interface Court {
  courtId?: number;
}

interface Action {
  type: string;
  payload: Court;
}

const CourtContext = createContext({courtState: null, courtDispatch: null});

const initialStateCourt:Court = localStorage.getItem('court') ?
  JSON.parse(localStorage.getItem('court')) : {
    courtId: null,
  };


const courtReducer = (state: Court, action:Action) => {
  switch (action.type) {
    case 'ChangeCourt':
      const newState = {
        ...state,
        courtId: action.payload.courtId,
      };
      localStorage.setItem('court', JSON.stringify(newState));
      return newState;
    default:
      return {
        ...state,
      };
  }
};

const CourtProvider:FC = ({children}) => {
  const [courtState, courtDispatch] = useReducer(courtReducer, initialStateCourt);
  return (
    <CourtContext.Provider value={{courtState, courtDispatch}}>
      {children}
    </CourtContext.Provider>
  );
};


export {
  CourtContext,
  CourtProvider,
};
