import React from 'react';
import {useRoutes} from 'react-router-dom';
import {routes, onRouteBefore} from './router';
import {setRouteBefore, transformRoutes} from './router/utils';
import {AuthProvider} from './context/authContext';
import {CourtProvider} from './context/courtContext';
import './App.css';


function App() {
  const Element = useRoutes(transformRoutes(routes));
  setRouteBefore(onRouteBefore);
  return (
    <CourtProvider>
      <AuthProvider>
        {Element}
      </AuthProvider>
    </CourtProvider>
  );
}

export default App;
