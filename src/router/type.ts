interface Meta {
  title?: string;
  inMenu?: string | boolean;
  needLogin?: boolean;
  icon?: 'user' | 'course' | 'court';
}

interface Route {
  path?: string;
  redirect?: string;
  meta?: Meta;
  component?: any;
  index?: boolean;
  children?: Route[];
}

export {
  Route,
  Meta,
};

