import React from 'react';
import {Navigate, RouteObject} from 'react-router-dom';
import {lazyLoad} from './lazyLoad';
import {Route} from './type';


let handleRouteBefore: any = null;

function setRouteBefore(fn:any) {
  handleRouteBefore = fn;
}

function getRouteBefore() {
  return handleRouteBefore;
}

function transformRoutes(routes:Route[]) {
  const list:RouteObject[] = [];
  routes.forEach((route:Route) => {
    const obj:RouteObject = {};
    obj.path = route.path;
    if (route.index) {
      obj.index = route.index;
    }
    if (route.redirect) {
      obj.element = <Navigate to={route.redirect} />;
    }
    if (route.component) {
      obj.element = lazyLoad(route.component, route.meta);
    }
    if (route.children) {
      obj.children = transformRoutes(route.children);
    }
    list.push(obj);
  });
  return list;
}

export {
  setRouteBefore,
  getRouteBefore,
  transformRoutes,
};
