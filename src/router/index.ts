import {Route, Meta} from './type';
import Cookies from 'js-cookie';
import {transformRoutesToMenus} from '../common/utils/user';
import Home from '../views/home/home';

// 全局路由配置
const routes:Route[] = [
  {
    path: '/',
    redirect: '/home/court-calendar',
    meta: {
      inMenu: false,
    },
  },
  {
    path: '/home', // 首页不需要懒加载，否则会导致不必要刷新。
    component: Home, // () => import(/* webpackChunkName: "home" */ '../views/home/home'),
    meta: {
      title: '首页',
      needLogin: true,
      inMenu: false,
      lazy: false,
    },
    children: [
      {
        component: () => import(/* webpackChunkName: "courtInfo" */ '../views/courtManagement/courtInfo/courtInfo'),
        index: true,
        meta: {
          inMenu: false,
        },
      },
      {
        path: 'court-info',
        component: () => import(/* webpackChunkName: "courtInfo" */ '../views/courtManagement/courtInfo/courtInfo'),
        meta: {
          title: '基本信息',
          inMenu: '场管管理',
          icon: 'court',
        },
      },
      {
        path: 'pitch',
        component: () => import(/* webpackChunkName: "pitch" */ '../views/courtManagement/pitch/pitch'),
        meta: {
          title: '场地设置',
          inMenu: '场管管理',
        },
      },
      {
        path: 'staff',
        component: () =>
          import(/* webpackChunkName: "staff" */ '../views/courtManagement/staffManagement/staffManagement'),
        meta: {
          title: '员工管理',
          inMenu: '场管管理',
        },
      },
      {
        path: 'court-calendar',
        component: () =>
          import(/* webpackChunkName: "courtCalendar" */ '../views/courtManagement/courtCalendar/courtCalendar'),
        meta: {
          title: '场地日历',
          inMenu: '场管管理',
        },
      },
      {
        path: 'permission',
        component: () =>
          import(/* webpackChunkName: "permission" */ '../views/courtManagement/permission/permission'),
        meta: {
          title: '权限管理',
          inMenu: '场管管理',
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
        component: () =>
          import(/* webpackChunkName: "classSchedule" */ '../views/courseManagement/classSchedule/classSchedule'),
        meta: {
          title: '课程表',
          inMenu: '课程管理',
          icon: 'course',
        },
      },
      {
        path: 'course-list',
        component: () =>
          import(/* webpackChunkName: "courseList" */ '../views/courseManagement/courseList/courseList'),
        meta: {
          title: '课程列表',
          inMenu: '课程管理',
          icon: 'course',
        },
      },
      {
        path: 'card-orders',
        component: () => import(/* webpackChunkName: "cardOrders" */ '../views/order/cardOrder/cardOrder'),
        meta: {
          title: '售卡订单',
          inMenu: '订单管理',
          icon: 'order',
        },
      },
      {
        path: 'course-orders',
        component: () => import(/* webpackChunkName: "courseOrders" */ '../views/order/courseOrder/courseOrder'),
        meta: {
          title: '售课订单',
          inMenu: '订单管理',
          icon: 'order',
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

const menuList = transformRoutesToMenus(routes);

export {
  routes,
  onRouteBefore,
  menuList,
};
