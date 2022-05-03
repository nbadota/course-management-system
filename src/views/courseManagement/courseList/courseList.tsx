import React, {useContext, useEffect, useState} from 'react';
import {
  Button, Form, Input, Modal, Popconfirm, Select, Table, TimePicker,
  DatePicker, InputNumber, Checkbox, Row, Col, message, Popover,
} from 'antd';
import {debounce} from 'lodash';
import 'moment/dist/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import {PickerLocale} from 'antd/es/date-picker/generatePicker';
import {CourtContext} from '../../../context/courtContext';
import {request} from '../../../common/utils/request';
import {WeekMap} from '../../../common/constant/common';
import PayModal from './payModal';

function CourseList() {
  const {Option} = Select;
  const {TextArea} = Input;
  const {RangePicker} = DatePicker;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const {courtState} = useContext(CourtContext);
  const [coach, setCoach] = useState([]);
  const [pitch, setPitch] = useState([]);
  const [edit, setEdit] = useState({show: false, id: null});
  const [pay, setPay] = useState({show: false, record: null});
  const [form] = Form.useForm();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await request.post('api/course/getData', {
        courtId: courtState.courtId,
      });
      setData(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleDelete = async (record:any) => {
    try {
      await request.post('api/course/delData', {
        courseId: record.id,
      });
      await getData();
      message.success('删除成功');
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleEdit = async (e:any, record:any) => {
    setShowModal(true);
    setEdit({show: true, id: record.id});
  };

  const onFinish = async (fieldsValue:any) => {
    const date = fieldsValue?.date;
    const time = fieldsValue?.time;
    const values = {
      ...fieldsValue,
      date: date ? [
        date[0].format('YYYY-MM-DD'),
        date[1].format('YYYY-MM-DD'),
      ] : undefined,
      time: time ? [
        time[0].format('HH:mm:ss'),
        time[1].format('HH:mm:ss'),
      ] : undefined,
    };
    if (edit.show) {
      try {
        await request.post('api/course/update', {
          values,
          courseId: edit.id,
        });
        await getData();
        setEdit({
          ...edit,
          show: false,
        });
        form.resetFields();
        message.success('修改成功');
        setShowModal(false);
      } catch (e) {
        message.error(e.message);
      }
    } else {
      try {
        setLoading(true);
        await request.post('api/course/create', {
          values,
          courtId: courtState.courtId,
        });
        await getData();
        message.success('新增成功');
        form.resetFields();
        setShowModal(false);
      } catch (e) {
        message.error(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const onCoachSearch = async (value:string) => {
    try {
      const res = await request.post('api/staff/getData', {
        courtId: courtState.courtId,
        search: {
          name: value,
          roleName: '教练',
        },
      });
      setCoach(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const onPitchSearch = async (value:string) => {
    try {
      const res = await request.post('api/pitch/getData', {
        courtId: courtState.courtId,
        search: {
          name: value,
          activated: true,
        },
      });
      setPitch(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const columns:any = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '课程类型',
      dataIndex: 'courseType',
      key: 'courseType',
      width: 100,
      render: (text:number) => {
        switch (text) {
          case 0:
            return '团课';
          case 1:
            return '私教';
          default:
            return '';
        }
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
    },
    {
      title: '课程日期',
      key: 'date',
      width: 200,
      render: (record:any) => {
        return `${record.startDate} -> ${record.endDate}`;
      },
    },
    {
      title: '上课时间',
      key: 'time',
      width: 200,
      render: (record:any) => {
        return `${record.startTime} - ${record.endTime}`;
      },
    },
    {
      title: '报名人数/人数上限',
      key: 'classSize',
      width: 150,
      render: (record: any) => {
        return `${record.currentSize}/${record.classSize}`;
      },
    },
    {
      title: '每周上课时间',
      dataIndex: 'weekly',
      key: 'weekly',
      width: 200,
      render: (text:string) => {
        let res = '每周';
        for (let i=0; i < text.length; i++) {
          if (text[i] === '1') {
            res += ' '+ WeekMap.get(i) +' ';
          }
        }

        return res;
      },
    },
    {
      title: '场地',
      key: 'pitch',
      width: 100,
      render: (record: any) => {
        return record.pitch.name;
      },
    },
    {
      title: '教练',
      key: 'coach',
      width: 100,
      render: (record: any) => {
        return (<Popover title='详细信息' trigger='hover' content={(<section>
          <p>{record.staff.message}</p>
        </section>)}><Button size='small'>{record.staff.name}</Button></Popover>);
      },
    },
    {
      title: '状态',
      dataIndex: 'activated',
      key: 'activated',
      width: 80,
      render: (text:boolean) => {
        switch (text) {
          case true:
            return '已开始';
          case false:
            return '已结束';
          default:
            return '';
        }
      },
    },
    {
      title: '简介',
      dataIndex: 'message',
      key: 'message',
      width: 300,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (text:any, record:any) => (
        <section style={{display: 'flex', flexWrap: 'wrap'}}>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record)}
            okText="是"
            cancelText="否"
          >
            <Button danger size='small'>删除</Button>
          </Popconfirm>
          <Button type="primary" size='small' onClick={(e) => handleEdit(e, record)}>修改</Button>
          <Button type="primary" size='small' onClick={(e) => setPay({show: true, record: record})}>购课</Button>
        </section>
      ),
    },
  ];


  return (
    <section>
      <section style={{margin: '10px 10px 15px 20px'}}>
        <Button type="primary" onClick={() => setShowModal(true)}>新增课程</Button>
      </section>
      <Table columns={columns} dataSource={data}
        rowKey={(record) => record.id}
        pagination={{position: ['bottomLeft'], pageSize: 6}}
        scroll={{x: 1300}}
      />
      <Modal
        visible={showModal}
        style={{top: '5px'}}
        width={400}
        footer={null}
        closable={false}
        title="请填写课程信息"
      >
        <Form
          form={form}
          onFinish={onFinish}
          style={{width: '400px'}}
        >
          <Form.Item
            label='课程名称'
            name='name'
            rules={edit.show ? [] : [{required: true, message: '请填写课程名称'}]}
            style={{width: '300px'}}
          >
            <Input placeholder='课程名称'/>
          </Form.Item>
          <Form.Item
            label='课程类型'
            name='courseType'
            rules={edit.show ? [] : [{required: true, message: '请填写课程类型'}]}
            style={{width: '300px'}}
          >
            <Select placeholder='课程类型'>
              <Option value={0}>团课</Option>
              <Option value={1}>私教课</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='价格'
            name='price'
            style={{width: '300px'}}
            rules={edit.show ? [] : [{required: true, message: '请填写价格'}]}
          >
            <InputNumber step={1} min={0}/>
          </Form.Item>
          <Form.Item
            label='人数上限'
            name='classSize'
            style={{width: '300px'}}
            rules={edit.show ? [] : [{required: true, message: '请填写人数上限'}]}
          >
            <InputNumber step={1} min={1}/>
          </Form.Item>
          <Form.Item
            label='课程日期'
            name='date'
            style={{width: '300px'}}
            rules={edit.show ? [] : [{required: true, message: '请填写课程日期'}]}
          >
            <RangePicker locale={locale as unknown as PickerLocale}/>
          </Form.Item>
          <Form.Item
            label='上课时间'
            name='time'
            style={{width: '300px'}}
            rules={edit.show ? [] : [{required: true, message: '请填写上课时间'}]}
          >
            <TimePicker.RangePicker/>
          </Form.Item>
          <Form.Item
            label='每周上课时间'
            name='weekly'
            style={{width: '380px'}}
            rules={edit.show ? [] : [{required: true, message: '请填写每周上课时间'}]}
          >
            <Checkbox.Group>
              <Row>
                <Col span={6}>
                  <Checkbox value={1} style={{lineHeight: '32px'}}>
                    周一
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value={2} style={{lineHeight: '32px'}}>
                    周二
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value={3} style={{lineHeight: '32px'}}>
                    周三
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value={4} style={{lineHeight: '32px'}}>
                    周四
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value={5} style={{lineHeight: '32px'}}>
                    周五
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value={6} style={{lineHeight: '32px'}}>
                    周六
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value={7} style={{lineHeight: '32px'}}>
                    周日
                  </Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            label='教练'
            name='coachId'
            style={{width: '300px'}}
            rules={edit.show ? [] : [{required: true, message: '请填写教练'}]}
          >
            <Select showSearch
              onSearch={debounce(onCoachSearch, 200)}
              filterOption={false}
              placeholder='请输入教练姓名查找'
            >
              {
                coach.map((item) => {
                  return (
                    <Option key={item.id} value={item.id}>{item.name}</Option>
                  );
                })
              }
            </Select>
          </Form.Item>
          <Form.Item
            label='场地'
            name='pitchId'
            style={{width: '300px'}}
            rules={edit.show ? [] : [{required: true, message: '请填写场地'}]}
          >
            <Select showSearch
              onSearch={debounce(onPitchSearch, 200)}
              filterOption={false}
              placeholder='请输入场地名称查找'
            >
              {
                pitch.map((item) => {
                  return (
                    <Option key={item.id} value={item.id}>{item.name}</Option>
                  );
                })
              }
            </Select>
          </Form.Item>
          {
            edit.show && (
              <Form.Item
                label='状态'
                name='activated'
                style={{width: '300px'}}
              >
                <Select placeholder='请输入课程状态'>
                  <Option value={true}>已开始</Option>
                  <Option value={false}>已结束</Option>
                </Select>
              </Form.Item>
            )
          }
          <Form.Item
            label='简介'
            name='message'
            style={{width: '300px'}}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            style={{marginLeft: '40%'}}
          >
            <Button type="primary" onClick={() => {
              form.resetFields();
              setShowModal(false);
              setEdit({...edit, show: false});
            }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
              确认
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <PayModal
        showModal={pay.show}
        record={pay.record}
        onCancel={() => setPay({...pay, show: false})}
        courtId={courtState.courtId}
        getData={getData}
      />
    </section>
  );
}

export default CourseList as React.FC;

