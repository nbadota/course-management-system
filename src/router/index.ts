import {Route, Meta} from './type';
import Cookies from 'js-cookie';

// 全局路由配置
const routes:Route[] = [
  {
    path: '/',
    redirect: '/home/user-list',
    meta: {
      inMenu: false,
    },
  },
  {
    path: '/home',
    component: () => import(/* webpackChunkName: "home" */ '../views/home/home'),
    meta: {
      title: '首页',
      needLogin: true,
      inMenu: false,
    },
    children: [
      {
        component: () => import(/* webpackChunkName: "userList" */ '../views/userManagement/userList/userList'),
        index: true,
        meta: {
          inMenu: false,
        },
      },
      {
        path: 'court-info',
        component: () => import(/* webpackChunkName: "userList" */ '../views/courtManagement/courtInfo/courtInfo'),
        meta: {
          title: '基本信息',
          inMenu: '场地管理',
          icon: 'court',
        },
      },
      {
        path: 'pitch',
        component: () => import(/* webpackChunkName: "userList" */ '../views/courtManagement/pitch/pitch'),
        meta: {
          title: '场地设置',
          inMenu: '场地管理',
        },
      },
      {
        path: 'user-list',
        component: () => import(/* webpackChunkName: "userList" */ '../views/userManagement/userList/userList'),
        meta: {
          title: '会员列表',
          inMenu: '会员管理',
          icon: 'user',
        },
      },
      {
        path: 'card',
        component: () => import(/* webpackChunkName: "Card" */ '../views/userManagement/card/card'),
        meta: {
          title: '会员卡',
          inMenu: '会员管理',
        },
      },
      {
        path: 'class-schedule',
        component: () => import(/* webpackChunkName: "userList" */ '../views/userManagement/userList/userList'),
        meta: {
          title: '课程表',
          inMenu: '课程管理',
          icon: 'course',
        },
      },
      {
        path: 'group-classes',
        component: () => import(/* webpackChunkName: "userList" */ '../views/userManagement/userList/userList'),
        meta: {
          title: '团课列表',
          inMenu: '课程管理',
          icon: 'course',
        },
      },
    ],
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '../views/login/login'),
    meta: {
      title: '登录',
      inMenu: false,
    },
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "404" */ '../views/404Page/index'),
    meta: {
      title: '404',
      inMenu: false,
    },
  },
];

/**
 * @description: 全局路由拦截
 * @param {string} pathname 当前路由路径
 * @param {object} meta 当前路由自定义meta字段
 * @return {string} 需要跳转到其他页时就return一个该页的path路径
 */

const onRouteBefore = ({pathname, meta}:{pathname: string, meta: Meta}) => {
  // 动态修改页面title
  if (meta.title !== undefined) {
    document.title = meta.title;
  }
  // 判断未登录跳转登录页
  if (meta.needLogin) {
    if (!Cookies.get('x-cid')) {
      return '/login';
    }
  }

  return pathname;
};

export {
  routes,
  onRouteBefore,
};
