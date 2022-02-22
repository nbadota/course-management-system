import React from 'react';
import {Layout, Menu} from 'antd';
import {useNavigate, useLocation} from 'react-router-dom';
import {routes} from '../../router';
import {transformRoutesToMenus} from '../../common/utils/user';
import {MenuIcon} from '../../common/constant/menuIcon';
const {Sider} = Layout;
const {SubMenu} = Menu;

interface MenuItem {
  title: string;
  icon?: 'user' | 'course';
  path?: string;
  children?: MenuItem[];
}

function Side() {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const menuList = transformRoutesToMenus(routes);

  const getMenuKeys = (pathname:string, menuList:MenuItem[]):{selectedKeys: string[], openKeys: string[]} => {
    const arr = pathname.split('/');
    const selectedKeys = [arr[arr.length-1]];
    const getOpenKeys = (menuList:MenuItem[]):MenuItem => {
      return menuList.find((item) => {
        if (item.children) {
          return getOpenKeys(item.children);
        }
        return item.path === selectedKeys[0];
      });
    };
    const openKeys = [getOpenKeys(menuList).title];
    return {selectedKeys, openKeys};
  };

  const {selectedKeys, openKeys} = getMenuKeys(pathname, menuList);

  const renderMenu = (routes:MenuItem[]) => {
    return routes.map((item) => {
      if (item.children) {
        return <SubMenu key={item.title} title={item.title} icon={MenuIcon[item.icon]}>
          {renderMenu(item.children)}
        </SubMenu>;
      }
      return <Menu.Item key={item.path} onClick={() => navigate(item.path)}>{item.title}</Menu.Item>;
    });
  };
  return (
    <Sider style={{overflowY: 'scroll', overflowX: 'hidden'}}>
      <Menu
        mode="inline"
        style={{height: '100%', borderRight: 0}}
        defaultOpenKeys={openKeys}
        defaultSelectedKeys={selectedKeys}
      >
        {
          renderMenu(menuList)
        }
      </Menu>
    </Sider>
  );
}

export {
  Side,
};
