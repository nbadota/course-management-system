import React from 'react';
import {Spin} from 'antd';
import {Guard} from './guard';
import {Meta} from './type';


function lazyLoad(importFn:any, meta:Meta) {
  meta = meta || {};
  const Element = React.lazy(importFn);
  const lazyElement = (
    <React.Suspense fallback={<Spin size="large" />}>
      <Element _meta={meta}/>
    </React.Suspense>
  );

  return <Guard element={lazyElement} meta={meta} />;
}

export {
  lazyLoad,
};
