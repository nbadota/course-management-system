import {Route} from '../../router/type';
import _ from 'lodash';

function transformRoutesToMenus(routes:Route[]) {
  const list:any = [];
  for (const route of routes) {
    const menuItem:any = {};
    if (!route.meta.inMenu && route.children) {
      route.children.forEach((item, index, arr) => {
        if (!menuItem.title) {
          menuItem.title = item.meta.inMenu;
          menuItem.icon = item.meta.icon;
          menuItem.children = [{path: item.path, title: item.meta.title}];
        } else if (menuItem.title !== item.meta.inMenu) {
          const curMenuItem = _.cloneDeep(menuItem);
          list.push(curMenuItem);
          menuItem.title = item.meta.inMenu;
          menuItem.icon = item.meta.icon;
          menuItem.children = [{path: item.path, title: item.meta.title}];
          if (index === arr.length - 1) {
            list.push(menuItem);
          }
        } else {
          menuItem.children.push({path: item.path, title: item.meta.title});
          if (index === arr.length - 1) {
            list.push(menuItem);
          }
        }
      });
    }
    if (route.meta.inMenu) {
      menuItem.path = route.path;
      menuItem.title = route.meta.title;
      list.push(menuItem);
    }
  }
  return list;
}

export {
  transformRoutesToMenus,
};
