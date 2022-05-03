import React from 'react';
import {useRoutes} from 'react-router';
import {SWRConfig} from 'swr';
import {message} from 'antd';
import {routes, onRouteBefore} from './router';
import {setRouteBefore, transformRoutes} from './router/utils';
import {AuthProvider} from './context/authContext';
import {CourtProvider} from './context/courtContext';
import './App.css';

function App() {
  const arr = transformRoutes(routes);
  const Element = useRoutes(arr);
  setRouteBefore(onRouteBefore);

  return (
    <SWRConfig value={{
      onError: (error, key) => {
        message.error(error.message || error);
      },
    }}>
      <CourtProvider>
        <AuthProvider>
          {Element}
        </AuthProvider>
      </CourtProvider>
    </SWRConfig>
  );
}

export default App;
