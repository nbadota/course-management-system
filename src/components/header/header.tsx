import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Layout, Menu, Dropdown, Popconfirm, message, Image} from 'antd';
import {DownOutlined, UserOutlined, OrderedListOutlined} from '@ant-design/icons';
import {AuthContext} from '../../context/authContext';
import {request} from '../../common/utils/request';
import {CourtContext} from '../../context/courtContext';
const {Header} = Layout;

interface Props {
  court: any[];
}

const Head: React.FC<Props> = (props) => {
  const {court} = props;
  const [visible, setVisible] = useState(false);
  const [courtVisible, setCourtVisible] = useState(false);
  const navigate = useNavigate();
  const {authState, authDispatch} = useContext(AuthContext);
  const {courtDispatch} = useContext(CourtContext);
  const logout = async () => {
    try {
      await request.post('/api/user/logout');
      message.success('退出成功');
      authDispatch({
        type: 'LOGOUT',
      });
      courtDispatch({
        type: 'ChangeCourt',
        payload: {
          courtId: null,
        },
      });
      navigate('/login', {replace: true});
    } catch (e) {
      message.error(e);
    }
  };

  const handleCourtChange = (id: number) => {
    courtDispatch({
      type: 'ChangeCourt',
      payload: {
        courtId: id,
      },
    });
    location.reload();
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

  const courtMenu = (
    <Menu>
      {
        court?.length && court.map((item) => {
          return (
            <Menu.Item key={item.id}>
              <Popconfirm
                title="确认切换场馆"
                onConfirm={() => handleCourtChange(item.id)}
                okText="是"
                cancelText="否"
              >
                {item.name}
              </Popconfirm>
            </Menu.Item>
          );
        })
      }
    </Menu>
  );

  return (
    <Header style={{
      backgroundColor: '#f5f5f5',
      position: 'relative',
      boxShadow: '0 2px 8px #948D8D',
      zIndex: '1',
      display: 'flex',
    }}>
      <Image width={30} src={require('./nativebaselogo.png')}/>
      <section style={{
        fontSize: '20px',
        width: '115px',
        height: '40px',
        lineHeight: '40px',
        borderRight: '2px solid #bfbfbf',
        alignSelf: 'center',
        marginLeft: '5px',
      }}
      >
        LMZ后台
      </section>
      <section style={{position: 'absolute', left: '220px', top: '0px'}}>
        <Dropdown overlay={courtMenu} visible={courtVisible} onVisibleChange={(flag) => setCourtVisible(flag)}>
          <a style={{color: 'black'}} onClick={(e) => e.preventDefault()}>
            <OrderedListOutlined/>切换场馆<DownOutlined/>
          </a>
        </Dropdown>
      </section>
      <section style={{position: 'absolute', right: '100px', top: '0px'}}>
        <Dropdown overlay={menu} visible={visible} onVisibleChange={(flag) => setVisible(flag)}>
          <a style={{color: 'black'}} onClick={(e) => e.preventDefault()}>
            <UserOutlined/><span>{authState.user}</span><DownOutlined/>
          </a>
        </Dropdown>
      </section>
    </Header>
  );
};

export {
  Head,
};
