import React, {useContext, useEffect, useState} from 'react';
import {Button, Form, Input, Modal, Popconfirm, Select, Table, InputNumber, message} from 'antd';
import {CourtContext} from '../../../context/courtContext';
import {request} from '../../../common/utils/request';
import {usePitchType} from '../../../swrHooks/pitchType';

function Card() {
  const {Option} = Select;
  const {TextArea} = Input;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState({show: false, id: null});
  const [search, setSearch] = useState('');
  const {courtState} = useContext(CourtContext);
  const {pitchType} = usePitchType(courtState.courtId);

  const [form] = Form.useForm();

  useEffect(() => {
    getData();
  }, []);

  const getData = async (search: any= '') => {
    const data = {
      search: search || undefined,
      courtId: courtState.courtId,
    };
    try {
      const res = await request.post('./api/card/getData', data);
      setData(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };


  const handleDelete = async (record: any) => {
    try {
      await request.post('/api/card/delData', {
        cardId: record.id,
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
  };

  const onFinish = async (fieldsValue: any) => {
    if (edit.show) {
      try {
        await request.post('api/card/update', {
          values: fieldsValue,
          cardId: edit.id,
        });
        message.success('更新成功');
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
        await request.post('api/card/create', {
          values: fieldsValue,
          courtId: courtState.courtId,
        });
        message.success('创建成功');
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

  const columns:any = [
    {
      title: '会员卡名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
    },
    {
      title: '有效时长',
      dataIndex: 'validTime',
      key: 'validTime',
      width: 100,
      render: (text:any) => text + '小时',
    },
    {
      title: '折扣',
      dataIndex: 'disCount',
      key: 'disCount',
      width: 100,
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'activated',
      key: 'activated',
      width: 100,
      filters: [
        {
          text: '下架',
          value: false,
        },
        {
          text: '激活',
          value: true,
        },
      ],
      onFilter: (value: any, record: any) => record.activated === value,
      render: (text:boolean) => {
        switch (text) {
          case false:
            return '下架';
          case true:
            return '激活';
          default:
            return '';
        }
      },
    },
    {
      title: '持有人数',
      dataIndex: 'sum',
      key: 'sum',
      width: 100,
    },
    {
      title: '使用说明',
      dataIndex: 'instruction',
      key: 'instruction',
      width: 300,
      ellipsis: true,
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
      fixed: 'right',
      width: 180,
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
        <Button type="primary" onClick={() => setShowModal(true)}>创建会员卡</Button>
        <Input style={{width: '300px', marginLeft: '20px'}}
          placeholder="输入会员卡名称" onBlur={(e) => setSearch(e.target.value)}/>
        <Button type="primary" onClick={() => getData(search)}>搜索会员卡</Button>
      </section>
      <Table columns={columns} dataSource={data}
        rowKey={(record) => record.name}
        pagination={{position: ['bottomLeft'], pageSize: 6}}
        scroll={{x: 1300}}
      />
      <Modal
        visible={showModal}
        style={{top: '80px'}}
        footer={null}
        closable={false}
        title="请填写会员卡信息"
        width={400}
      >
        <Form
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            label='会员卡名称'
            name='name'
            rules={edit.show ? [] : [{required: true, message: '请填写会员卡名称'}]}
            style={{width: '300px'}}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label='会员卡类型'
            name='type'
            rules={edit.show ? [] : [{required: true, message: '请填写会员卡类型'}]}
            style={{width: '300px'}}
          >
            <Select placeholder="请选择会员卡类型">
              {
                pitchType && pitchType.map((item:any) => {
                  return (
                    <Option value={item} key={item}>{item}</Option>
                  );
                })
              }
            </Select>
          </Form.Item>
          <Form.Item
            label='折扣'
            name='disCount'
            rules={edit.show ? [] :[{required: true, message: '请填写折扣'}]}
          >
            <InputNumber step={0.01} max={1} min={0.1}/>
          </Form.Item>
          <Form.Item
            label='定价'
            name='price'
            rules={edit.show ? [] : [{required: true, message: '请填写定价'}]}
          >
            <InputNumber step={1} min={0}/>
          </Form.Item>
          <Form.Item
            label='有效时长'
            name='validTime'
            rules={edit.show ? [] : [{required: true, message: '请填写有效时长'}]}
          >
            <InputNumber step={1} min={1} addonAfter="小时"/>
          </Form.Item>
          <Form.Item
            label='会员卡状态'
            name='activated'
            rules={edit.show ? [] : [{required: true, message: '请填写会员卡状态'}]}
            style={{width: '300px'}}
          >
            <Select placeholder="请选择会员卡状态">
              <Option value={1}>激活</Option>
              <Option value={0}>下架</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='使用说明'
            name='instruction'
          >
            <TextArea rows={2}/>
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
    </section>
  );
}

export default Card as React.FC;
