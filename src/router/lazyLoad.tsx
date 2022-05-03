import React from 'react';
import {Spin} from 'antd';
import {Guard} from './guard';
import {Meta} from './type';


function lazyLoad(Ele:any, meta:Meta) {
  meta = meta || {};

  if (meta.lazy === false) {
    const Element = <Ele _meta={meta}/>;
    return <Guard element={Element} meta={meta} />;
  }

  const Element = React.lazy(Ele);
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
