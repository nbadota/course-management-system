import React, {useContext, useEffect, useState} from 'react';
import {Calendar, Table, Tabs, Drawer, Button, message,
  Typography, Form, Select, Modal, Popconfirm, InputNumber} from 'antd';
import {useLocation} from 'react-router-dom';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/zh_CN';
import {PickerLocale} from 'antd/es/date-picker/generatePicker';
import {request} from '../../../common/utils/request';
import {CourtContext} from '../../../context/courtContext';
import {usePitchType} from '../../../swrHooks/pitchType';
import {useCourtInfo} from '../../../swrHooks/courtInfo';
import {debounce} from 'lodash';
import {socket} from '../../../common/constant/socketIO';

const {TabPane} = Tabs;
const {Text} = Typography;
const {Option} = Select;

function CourtCalendar() {
  const {courtState} = useContext(CourtContext);
  const {pitchType} = usePitchType(courtState.courtId);
  const {courtInfo} = useCourtInfo();
  const [curPitchType, setCurPitchType] = useState(null);
  const [curDate, setCurDate] = useState(moment().format('YYYYMMDD'));
  const [showDrawer, setShowDrawer] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [consumer, setConsumer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reservationForm] = Form.useForm();
  const [rulesForm] = Form.useForm();
  const [data, setData] = useState([]);
  const [rules, setRules] = useState(null);
  const {state}: any = useLocation();

  useEffect(() => {
    setCurPitchType(pitchType?.[0]);
  }, [pitchType]);

  useEffect(() => {
    if (state) {
      setCurPitchType(state.pitch);
      setCurDate(state.date);
    }
  }, [state]);

  useEffect(() => {
    if (curPitchType) {
      getData();
    }
    setSelected([]);
  }, [curPitchType, curDate]);

  const getData = async ()=> {
    try {
      const res = await request.post('/api/court/getCourtCalendar', {
        courtId: courtState.courtId,
        pitchType: curPitchType,
        curDate: curDate,
      });
      const rules = await request.post('/api/reservation/getReservationRules', {
        courtId: courtState.courtId,
      });
      rulesForm.setFieldsValue(rules.data);
      setRules(rules.data);
      setData(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const onTabClick = (key:string)=> {
    setCurPitchType(key);
  };

  const onSelect = (date:any)=> {
    setCurDate(date.format('YYYYMMDD'));
  };

  const handleReservation = async (fieldsValue: any)=> {
    try {
      setLoading(true);
      await request.post('/api/reservation/create', {
        reservationDate: curDate,
        consumerId: fieldsValue.consumerId,
        courtId: courtState.courtId,
        selected,
      });
      await getData();
      message.success('????????????');
      setShowReservationModal(false);
      reservationForm.resetFields();
      setSelected([]);
      socket.emit('newReservation', JSON.stringify(
          {pitch: curPitchType, selected, date: curDate, room: courtState.courtId}));
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onConsumerSearch = async (value: string) => {
    try {
      const res = await request.post('/api/consumer/searchData', {
        courtId: courtState.courtId,
        search: {
          id_no: value,
        },
      });
      setConsumer(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleReservationCancel = async (id:number) => {
    try {
      await request.post('/api/reservation/update', {
        id,
        values: {
          status: false,
        },
      });
      await getData();
      message.success('????????????');
      socket.emit('reservationCancel', JSON.stringify(
          {pitch: curPitchType, reservationId: id, room: courtState.courtId}));
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleRules = async (fieldsValue: any) => {
    try {
      await request.post('/api/reservation/setReservationRules', {
        values: fieldsValue,
        courtId: courtState.courtId,
      });
      await getData();
      message.success('????????????');
      setShowRulesModal(false);
    } catch (e) {
      message.error(e.message);
    }
  };

  const genColumns = (courtInfo:any[])=> {
    const curCourtInfo = courtInfo.find((item) => item.id === courtState.courtId);
    const res:any = [{
      title: '??????',
      key: 'courtId',
      width: 100,
      fixed: 'left',
      render: (record: any) => {
        return record.name;
      },
    }];
    let {openTime, closeTime} = curCourtInfo;
    if (!openTime || !closeTime) {
      return;
    }
    openTime = moment(openTime, 'HH:mm:ss');
    closeTime = moment(closeTime, 'HH:mm:ss');
    while (true) {
      if (openTime.isSame(closeTime)) {
        break;
      }
      const cloneTime = openTime.clone();
      const obj:any = {
        title: `${cloneTime.format('HH:mm:ss')} - ${cloneTime.add(1, 'h').format('HH:mm:ss')}`,
        key: cloneTime.format('HH:mm:ss'),
        width: 100,
        render: (text: any, record: any) => {
          const subEndTime = moment(cloneTime.format('HH:mm:ss'), 'HH:mm:ss');
          if (subEndTime.isBefore(moment(record.openTime, 'HH:mm:ss')) ||
            subEndTime.isAfter(moment(record.closeTime, 'HH:mm:ss')) ||
            subEndTime.isSame(moment(record.openTime, 'HH:mm:ss'))) {
            return (
              <section>
                <Button size='small'
                  disabled={true}
                  style={{color: '#faad14'}}
                >
                  ????????????
                </Button>
              </section>
            );
          }
          const showList:any = [];
          if (record?.course?.length) {
            record.course.forEach((item:any) => {
              const startTime = moment(item.startTime, 'HH:mm:ss');
              const endTime = moment(item.endTime, 'HH:mm:ss');
              if (subEndTime.isAfter(startTime) && (subEndTime.isBefore(endTime) || subEndTime.isSame(endTime))) {
                showList.push(item);
              }
            });
          }
          if (record?.reservation?.length) {
            record.reservation.forEach((item:any) => {
              const endTime = moment(item.endTime, 'HH:mm:ss');
              if (subEndTime.isSame(endTime)) {
                showList.push(item);
              }
            });
          }
          const index = selected.findIndex((item) => item.endTime === cloneTime.format('HH:mm:ss') &&
            item.pitchId === record.id);
          const cancelDisabled = (cloneTime.isBefore(moment().add(rules?.allowedCancel, 'h')) &&
            moment(moment().format('YYMMDD'), 'YYMMDD').isSame(curDate)) ||
            moment(moment().format('YYMMDD'), 'YYMMDD').isAfter(curDate);
          return (
            <section>
              {
                showList.length ? showList.map((item:any) => {
                  return item.name || (
                    <section key={item.id}>
                      <Button size='small' style={{marginBottom: '5px'}}>{item.consumer.name}</Button>
                      <Popconfirm
                        title="??????????????????"
                        onConfirm={() => handleReservationCancel(item.id)}
                        okText="???"
                        cancelText="???"
                        disabled={
                          cancelDisabled
                        }
                      >
                        <Button size='small'
                          danger
                          disabled={cancelDisabled}
                        >
                          ????????????
                        </Button>
                      </Popconfirm>
                    </section>
                  );
                }) : <Button size='small'
                  type={Number(index) !== -1 ? 'primary' : 'default'}
                  disabled={
                    (cloneTime.isBefore(moment()) && moment(moment().format('YYMMDD'), 'YYMMDD').isSame(curDate)) ||
                  moment(moment().format('YYMMDD'), 'YYMMDD').isAfter(curDate)
                  }
                  onClick={() => {
                    if (Number(index) !== -1) {
                      const newSelected = selected.slice();
                      newSelected.splice(index, 1);
                      setSelected(newSelected);
                    } else {
                      const obj = {
                        startTime: cloneTime.clone().add(-1, 'h').format('HH:mm:ss'),
                        endTime: cloneTime.format('HH:mm:ss'),
                        pitchId: record.id,
                        pitchName: record.name,
                      };
                      setSelected([...selected, obj]);
                    }
                  }}>{Number(index) === -1 ? '????????????' : '?????????'}</Button>
              }
            </section>
          );
        },
      };
      res.push(obj);
      openTime.add(1, 'h');
    }

    return res;
  };

  return (
    <section style={{position: 'relative', height: '100%', paddingTop: '10px'}}>
      <Drawer
        title="??????????????????????????????"
        placement="left"
        onClose={() => setShowDrawer(false)}
        visible={showDrawer}
        getContainer={false}
        mask={false}
        width={300}
        style={{position: 'absolute', height: '80%', top: '10%'}}
      >
        <Calendar
          fullscreen={false}
          locale={locale as unknown as PickerLocale}
          onSelect={onSelect}
        />
      </Drawer>
      <section>
        <section style={{display: 'flex', alignItems: 'center'}}>
          <section>
            <Button disabled={true}>
              <span style={{color: 'black'}}>??????????????????????????????</span>
              <Text italic>{moment(curDate).format('YYYY???MM???DD???')}</Text>
            </Button>
          </section>
          <Button style={{marginLeft: '10px', marginRight: '15px'}} type='primary'
            onClick={() => setShowDrawer(true)}>??????</Button>
          <Button style={{marginRight: '15px'}} type='primary'
            onClick={() => setShowRulesModal(true)}>??????????????????</Button>
          <Button style={{marginRight: '15px'}} type='primary'
            onClick={() => {
              if (selected.length === 0) {
                message.warn('?????????????????????????????????');
                return;
              }
              const endTimeArr = selected.map((item) => item.endTime);
              if (Array.from(new Set(endTimeArr)).length !== selected.length) {
                message.warn('??????????????????????????????');
                return;
              }
              setShowReservationModal(true);
            }}>??????</Button>
          <Tabs style={{marginLeft: '30px', width: '50%'}} onTabClick={onTabClick} activeKey={curPitchType}>
            {
              pitchType && pitchType.map((item:any) => {
                return (
                  <TabPane tab={item} key={item}/>
                );
              })
            }
          </Tabs>
        </section>
        {
          courtInfo?.length &&
          <Table
            columns={genColumns(courtInfo)}
            dataSource={data}
            pagination={false}
            rowKey={(record) => record.id}
            scroll={{x: 1300}}
          />
        }
      </section>
      <Modal
        visible={showReservationModal}
        forceRender={true}
        style={{top: '150px'}}
        footer={null}
        closable={false}
        title="?????????????????????"
        width={400}
      >
        <section>
          ??????????????????????????????
          {
            selected.map((item) => {
              return (
                <section
                  style={{borderBottom: '1px solid #d9d9d9', marginBottom: '10px'}}
                  key={item.startTime}>
                  <Text strong>?????????</Text>{item.pitchName}&nbsp;&nbsp;&nbsp;
                  <Text strong>?????????</Text>{item.startTime} - {item.endTime}
                </section>
              );
            })
          }
        </section>
        <Form
          form={reservationForm}
          onFinish={handleReservation}
        >
          <Form.Item
            label='??????'
            name='consumerId'
            style={{width: '300px'}}
            rules={[{required: true, message: '???????????????'}]}
          >
            <Select showSearch
              onSearch={debounce(onConsumerSearch, 500)}
              filterOption={false}
              placeholder='??????????????????????????????'
            >
              {
                consumer && (
                  <Option key={consumer.id} value={consumer.id}>{`${consumer.name}(${consumer.phone})`}</Option>
                )
              }
            </Select>
          </Form.Item>
          <Form.Item
            style={{marginLeft: '40%'}}
          >
            <Button type="primary" disabled={loading} onClick={() => {
              reservationForm.resetFields();
              setShowReservationModal(false);
            }}>
              ??????
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
              ??????
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={showRulesModal}
        forceRender={true}
        style={{top: '150px'}}
        footer={null}
        closable={false}
        title="?????????????????????"
        width={400}
      >
        <Text type="warning">{!rules && '???????????????????????????'}</Text>
        <Form
          form={rulesForm}
          onFinish={handleRules}
        >
          <Form.Item
            label='????????????????????????'
            name='limit'
            style={{width: '300px'}}
            rules={[{required: true, message: '?????????????????????????????????'}]}
          >
            <InputNumber addonAfter="??????"/>
          </Form.Item>
          <Form.Item
            label='??????????????????????????????'
            name='allowedCancel'
            style={{width: '300px'}}
            rules={[{required: true, message: '???????????????????????????????????????'}]}
          >
            <InputNumber addonAfter="??????"/>
          </Form.Item>
          <Form.Item
            style={{marginLeft: '40%'}}
          >
            <Button type="primary" disabled={loading} onClick={() => {
              setShowRulesModal(false);
            }}>
              ??????
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
              ??????
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default CourtCalendar as React.FC;

