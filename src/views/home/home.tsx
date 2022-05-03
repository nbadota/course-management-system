import React, {useContext, useEffect} from 'react';
import {Outlet} from 'react-router';
import {Layout, notification, Typography, Button} from 'antd';
import {useNavigate} from 'react-router-dom';
import moment from 'moment';

import {Side} from '../../components/sider/sider';
import {Head} from '../../components/header/header';
import {CourtContext} from '../../context/courtContext';
import {useCourtInfo} from '../../swrHooks/courtInfo';

import {socket} from '../../common/constant/socketIO';
const {Content} = Layout;
const {Text} = Typography;

function Home() {
  const {courtInfo, permissionList} = useCourtInfo();
  const {courtDispatch, courtState} = useContext(CourtContext);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      socket.emit('leaveRoom', courtState.courtId);
    };
  }, []);

  useEffect(() => {
    const courtId = courtState.courtId || courtInfo?.[0]?.id;
    if (courtInfo?.length) {
      courtDispatch({
        type: 'ChangeCourt',
        payload: {
          courtId: courtId,
        },
      });
      socket.emit('joinRoom', courtId);
    }
  }, [courtInfo]);

  useEffect(() => {
    if (permissionList?.length) {
      localStorage.setItem('permissionList', JSON.stringify(permissionList));
    }
  }, [permissionList]);

  useEffect(() => {
    socket.on('enter', (data) => {
      console.log(data);
    });
    socket.on('newReservation', (data) => {
      const {selected, pitch, date} = JSON.parse(data);
      notification['info']({
        message: `您有新的预约`,
        duration: null,
        description: (
          <section>
            <Text strong>日期：</Text>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}
            {
              selected.map((item: any) => {
                return (
                  <section
                    style={{borderBottom: '1px solid #d9d9d9', marginBottom: '10px'}}
                    key={item.startTime}>
                    <Text strong>场地：</Text>{item.pitchName}&nbsp;&nbsp;&nbsp;
                    <Text strong>时间：</Text>{item.startTime} - {item.endTime}
                  </section>
                );
              })
            }
          </section>
        ),
        btn: (<Button onClick={() => navigate('court-calendar', {state: {pitch, date}})}>前往查看</Button>),
        onClose: close,
      });
    });
    socket.on('reservationCancel', (data) => {
      const {reservation, pitch} = JSON.parse(data);
      notification['warning']({
        message: '您有预约被取消',
        duration: null,
        description: (
          <>
            <Text strong>日期：</Text>{moment(reservation.reservationDate, 'YYYYMMDD').format('YYYY年MM月DD日')}
            <section
              style={{borderBottom: '1px solid #d9d9d9', marginBottom: '10px'}}
            >
              <Text strong>场地：</Text>{reservation.pitch.name}&nbsp;&nbsp;&nbsp;
              <Text strong>时间：</Text>{reservation.startTime} - {reservation.endTime}
              <Text strong>用户：</Text>{reservation.consumer.name} - {reservation.consumer.phone}
            </section>
          </>
        ),
        btn: (<Button onClick={() =>
          navigate('court-calendar',
              {state: {pitch, date: reservation.reservationDate}})}>前往查看</Button>),
        onClose: close,
      });
    });
  }, []);

  return (
    <Layout style={{height: '100%'}}>
      <Head court={courtInfo}/>
      <Layout>
        <Side permissionLists={permissionList}/>
        <Layout style={{border: '2px solid #bfbfbf', borderLeft: '0px', margin: '5px 5px 5px 0px', overflowY: 'auto'}}>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Home as React.FC;
