import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {Meta} from './type';
import {getRouteBefore} from './utils';

function Guard({element, meta}:{element: React.ReactElement, meta:Meta}) {
  const {pathname} = useLocation();
  meta = meta || {};

  const handleRouteBefore = getRouteBefore();
  if (handleRouteBefore) {
    const newPath = handleRouteBefore({pathname, meta});
    if (newPath && newPath !== pathname) {
      element = <Navigate to={newPath} />;
    }
  }

  return element;
}

export {
  Guard,
};

