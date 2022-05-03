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
      message.success('预约成功');
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
      message.success('取消成功');
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
      message.success('设置成功');
      setShowRulesModal(false);
    } catch (e) {
      message.error(e.message);
    }
  };

  const genColumns = (courtInfo:any[])=> {
    const curCourtInfo = courtInfo.find((item) => item.id === courtState.courtId);
    const res:any = [{
      title: '场地',
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
                  场地关闭
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
                        title="确认取消预约"
                        onConfirm={() => handleReservationCancel(item.id)}
                        okText="是"
                        cancelText="否"
                        disabled={
                          cancelDisabled
                        }
                      >
                        <Button size='small'
                          danger
                          disabled={cancelDisabled}
                        >
                          取消预约
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
                  }}>{Number(index) === -1 ? '选择时段' : '已选择'}</Button>
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
        title="点击日历查询场地安排"
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
              <span style={{color: 'black'}}>您当前查询的日期为：</span>
              <Text italic>{moment(curDate).format('YYYY年MM月DD日')}</Text>
            </Button>
          </section>
          <Button style={{marginLeft: '10px', marginRight: '15px'}} type='primary'
            onClick={() => setShowDrawer(true)}>日历</Button>
          <Button style={{marginRight: '15px'}} type='primary'
            onClick={() => setShowRulesModal(true)}>配置预约规则</Button>
          <Button style={{marginRight: '15px'}} type='primary'
            onClick={() => {
              if (selected.length === 0) {
                message.warn('请先选择预约时段与场地');
                return;
              }
              const endTimeArr = selected.map((item) => item.endTime);
              if (Array.from(new Set(endTimeArr)).length !== selected.length) {
                message.warn('场地或时段选择有冲突');
                return;
              }
              setShowReservationModal(true);
            }}>预约</Button>
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
        title="请填写预约信息"
        width={400}
      >
        <section>
          您当前选择的预约为：
          {
            selected.map((item) => {
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
        <Form
          form={reservationForm}
          onFinish={handleReservation}
        >
          <Form.Item
            label='会员'
            name='consumerId'
            style={{width: '300px'}}
            rules={[{required: true, message: '请填写会员'}]}
          >
            <Select showSearch
              onSearch={debounce(onConsumerSearch, 500)}
              filterOption={false}
              placeholder='请输入用户身份证查找'
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
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
              确认
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
        title="请填写预约规则"
        width={400}
      >
        <Text type="warning">{!rules && '您尚未配置预约规则'}</Text>
        <Form
          form={rulesForm}
          onFinish={handleRules}
        >
          <Form.Item
            label='单日预约时长上限'
            name='limit'
            style={{width: '300px'}}
            rules={[{required: true, message: '请填写单日预约时长上限'}]}
          >
            <InputNumber addonAfter="小时"/>
          </Form.Item>
          <Form.Item
            label='允许提前取消预约时长'
            name='allowedCancel'
            style={{width: '300px'}}
            rules={[{required: true, message: '请填写允许提前取消预约时长'}]}
          >
            <InputNumber addonAfter="小时"/>
          </Form.Item>
          <Form.Item
            style={{marginLeft: '40%'}}
          >
            <Button type="primary" disabled={loading} onClick={() => {
              setShowRulesModal(false);
            }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
              确认
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default CourtCalendar as React.FC;

