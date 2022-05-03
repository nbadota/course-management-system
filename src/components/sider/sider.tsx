import React, {useContext} from 'react';
import {Layout, Menu, Spin} from 'antd';
import {useNavigate, useLocation} from 'react-router';
import {MenuIcon} from '../../common/constant/menuIcon';
import {CourtContext} from '../../context/courtContext';
import {AuthContext} from '../../context/authContext';
const {Sider} = Layout;
const {SubMenu} = Menu;

interface MenuItem {
  title: string;
  icon?: 'user' | 'course';
  path?: string;
  children?: MenuItem[];
  grade?: number;
}

interface Props {
  permissionLists: any[];
}

const Side: React.FC<Props> = (props) =>{
  const {permissionLists} = props;
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const {courtState} = useContext(CourtContext);
  const {authState} = useContext(AuthContext);
  const permissionList = permissionLists?.find((item:any) => item.courtId === courtState.courtId);

  const getMenuKeys = (pathname:string, menuList:MenuItem[]):{selectedKeys: string[], openKeys: string[]} => {
    const arr = pathname.split('/');
    const selectedKeys = [arr[arr.length-1]];
    const getOpenKeys = (menuList:MenuItem[]):MenuItem => {
      return menuList?.find((item) => {
        if (item.children) {
          return getOpenKeys(item.children);
        }
        return item.path === selectedKeys[0];
      });
    };
    const openKeys = [getOpenKeys(menuList)?.title];
    return {selectedKeys, openKeys};
  };

  const {selectedKeys, openKeys} = getMenuKeys(pathname, permissionList?.info);

  const renderMenu = (routes:MenuItem[]) => {
    return routes?.map((item) => {
      if (item.grade >= authState.grade) {
        return null;
      }
      if (item.children) {
        return <SubMenu key={item.title} title={item.title} icon={MenuIcon[item.icon]}>
          {renderMenu(item.children)}
        </SubMenu>;
      }
      return <Menu.Item key={item.path} onClick={() => navigate(item.path)}>{item.title}</Menu.Item>;
    });
  };

  return permissionList ? (
    <Sider style={{overflowY: 'auto', overflowX: 'hidden', borderRight: '2px solid #bfbfbf', background: '#fff'}}>
      <Menu
        mode="inline"
        style={{height: '100%', borderRight: 0}}
        defaultOpenKeys={openKeys}
        defaultSelectedKeys={selectedKeys}
      >
        {
          renderMenu(permissionList?.info)
        }
      </Menu>
    </Sider>
  ) : (<Spin tip="加载中..."/>);
};

export {
  Side,
};
