import React from 'react';
import {Result} from 'antd';

function Index() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="对不起, 您访问的页面不存在"
    />
  );
}

export default Index as React.FC;

