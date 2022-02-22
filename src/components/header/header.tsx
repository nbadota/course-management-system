import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Layout, Menu, Dropdown, Popconfirm, message} from 'antd';
import {DownOutlined, UserOutlined} from '@ant-design/icons';
import {AuthContext} from '../../context/authContext';
import {request} from '../../common/utils/request';
const {Header} = Layout;

function Head() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const {authState} = useContext(AuthContext);
  const logout = async () => {
    try {
      await request.post('/api/user/logout');
      message.success('退出成功');
      navigate('/login', {replace: true});
    } catch (e) {
      message.error(e);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout">
        <Popconfirm
          title="确认退出登录"
          onConfirm={logout}
          okText="是"
          cancelText="否"
        >
          退出登录
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{backgroundImage: 'linear-gradient(to right , #00FFFF, #0000FF, #00FFFF)', position: 'relative'}}>
      <span style={{fontSize: '20px'}}>LMZ后台</span>
      <section style={{position: 'absolute', right: '100px', top: '0px'}}>
        <Dropdown overlay={menu} visible={visible} onVisibleChange={(flag) => setVisible(flag)}>
          <a style={{color: 'black'}} onClick={(e) => e.preventDefault()}>
            <UserOutlined/><span>{authState.user}</span><DownOutlined/>
          </a>
        </Dropdown>
      </section>
    </Header>
  );
}

export {
  Head,
};
