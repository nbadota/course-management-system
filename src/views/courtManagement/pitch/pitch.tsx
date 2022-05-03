import React, {useContext, useEffect, useState} from 'react';
import {Table, Button, Modal, Form, Input, TimePicker, Select, message, Popconfirm, AutoComplete} from 'antd';
import moment from 'moment';
import {request} from '../../../common/utils/request';
import {CourtContext} from '../../../context/courtContext';
import {SortOrder} from 'antd/es/table/interface';


function Pitch() {
  const {Option} = Select;
  const {TextArea} = Input;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState({show: false, id: null});
  const [form] = Form.useForm();
  const {courtState} = useContext(CourtContext);

  useEffect(()=> {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await request.post('/api/pitch/getData', {
        courtId: courtState.courtId,
      });
      setData(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const getPitchType = (data: any) => {
    const set = new Set();
    data?.forEach((item: any) => {
      set.add(item.pitchType);
    });

    return Array.from(set).map((item) => {
      return {
        text: item as string,
        value: item as string,
      };
    });
  };

  const handleDelete = async (record:any) => {
    try {
      await request.post('/api/pitch/delData', {
        pitchId: record.id,
      });
      message.success('删除成功');
      await getData();
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleEdit = async (e:any, record:any) => {
    setShowModal(true);
    setEdit({show: true, id: record.id});
    const fieldsValues = {
      ...record,
      'openTime': moment(record.openTime, 'HH:mm:ss'),
      'closeTime': moment(record.closeTime, 'HH:mm:ss'),
    };
    form.setFieldsValue(fieldsValues);
  };

  const onFinish = async (fieldsValue: any) => {
    const values = {
      ...fieldsValue,
      'openTime': fieldsValue.openTime.format('HH:mm:ss'),
      'closeTime': fieldsValue.closeTime.format('HH:mm:ss'),
    };
    if (edit.show) {
      try {
        await request.post('/api/pitch/update', {
          values,
          pitchId: edit.id,
        });
        message.success('修改成功');
        await getData();
        setShowModal(false);
        setEdit({
          ...edit,
          show: false,
        });
        form.resetFields();
      } catch (e) {
        message.error(e.message);
      }
    } else {
      try {
        setLoading(true);
        await request.post('/api/pitch/create', {
          values,
          courtId: courtState.courtId,
        });
        message.success('添加成功');
        await getData();
        setShowModal(false);
        form.resetFields();
      } catch (e) {
        message.error(e.message);
      } finally {
        setLoading(false);
      }
    }
  };


  const columns = [
    {
      title: '场地名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '场地类型',
      dataIndex: 'pitchType',
      key: 'pitchType',
      filters: getPitchType(data),
      onFilter: (value: any, record: any) => record.pitchType.indexOf(value) === 0,
      defaultSortOrder: 'ascend' as SortOrder,
      sorter: (a:any, b:any) => a.pitchType.length - b.pitchType.length,
      sortDirections: [] as SortOrder[],
    },
    {
      title: '开启时间',
      dataIndex: 'openTime',
      key: 'openTime',
    },
    {
      title: '关闭时间',
      dataIndex: 'closeTime',
      key: 'closeTime',
    },
    {
      title: '状态',
      dataIndex: 'activated',
      key: 'activated',
      filters: [
        {
          text: '暂停使用',
          value: false,
        },
        {
          text: '使用中',
          value: true,
        },
      ],
      onFilter: (value: any, record: any) => record.activated === value,
      render: (text:boolean) => {
        switch (text) {
          case false:
            return '暂停使用';
          case true:
            return '使用中';
          default:
            return '';
        }
      },
    },
    {
      title: '备注',
      dataIndex: 'message',
      key: 'message',
      width: 300,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (text:any, record:any) => (
        <section>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record)}
            okText="是"
            cancelText="否"
          >
            <Button danger>删除</Button>
          </Popconfirm>
          <Button type="primary" onClick={(e) => handleEdit(e, record)}>修改</Button>
        </section>
      ),
    },
  ];

  return (
    <section>
      <section style={{margin: '10px 10px 15px 20px'}}>
        <Button type="primary" onClick={() => setShowModal(true)}>添加场地</Button>
      </section>
      <Table columns={columns} dataSource={data}
        rowKey={(record) => record.name}
        pagination={{position: ['bottomLeft'], pageSize: 6}}/>
      <Modal
        visible={showModal}
        style={{top: '150px'}}
        footer={null}
        closable={false}
        title="请填写场地信息"
        width={400}
      >
        <Form
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            label='场地名称'
            name='name'
            rules={[{required: true, message: '请填写场地名称'}]}
            style={{width: '300px'}}
          >
            <Input placeholder="请填写场地名称"/>
          </Form.Item>
          <Form.Item
            label='场地类型'
            name='pitchType'
            rules={[{required: true, message: '请填写场地类型'}]}
            style={{width: '300px'}}
          >
            <AutoComplete
              placeholder="请输入或选择已有场地类型"
              options={getPitchType(data)}
            />
          </Form.Item>
          <Form.Item
            label='开启时间'
            name='openTime'
            rules={[{required: true, message: '请填写开启时间'}]}
          >
            <TimePicker/>
          </Form.Item>
          <Form.Item
            label='关闭时间'
            name='closeTime'
            rules={[{required: true, message: '请填写关闭时间'}]}
          >
            <TimePicker/>
          </Form.Item>
          <Form.Item
            label='场地状态'
            name='activated'
            rules={[{required: true, message: '请填写场地状态'}]}
          >
            <Select placeholder="请选择场地状态">
              <Option value={0}>暂停使用</Option>
              <Option value={1}>使用中</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='备注'
            name='message'
          >
            <TextArea rows={2}/>
          </Form.Item>
          <Form.Item
            style={{marginLeft: '40%'}}
          >
            <Button type="primary" onClick={() => {
              form.resetFields();
              setShowModal(false);
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

export default Pitch as React.FC;
