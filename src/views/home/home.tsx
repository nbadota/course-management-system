import React from 'react';
import {Outlet} from 'react-router-dom';
import {Layout} from 'antd';
const {Content} = Layout;

import {Side} from '../../components/sider/sider';
import {Head} from '../../components/header/header';

function Home() {
  return (
    <Layout style={{height: '100%'}}>
      <Head/>
      <Layout>
        <Side/>
        <Layout style={{border: '2px solid grey', margin: '5px'}}>
          <Content>
            <Outlet/>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Home as React.FC;
