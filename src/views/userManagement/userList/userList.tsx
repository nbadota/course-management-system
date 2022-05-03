import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Select, Table} from 'antd';
import {CourtContext} from '../../../context/courtContext';
import {request} from '../../../common/utils/request';
import {useCardType} from '../../../swrHooks/card';
import EditModal from './editModal';

function UserList() {
  const {Option} = Select;
  const {TextArea} = Input;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [editModal, setEditModal] = useState({
    show: false,
    record: null,
  });
  const [showPayFrom, setShowPayFrom] = useState(false);
  const paginationRef = useRef({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const {courtState} = useContext(CourtContext);

  const {cardType} = useCardType(courtState.courtId);

  useEffect(() => {
    getCount();
    getData();
  }, []);

  const getData = async (search : any= undefined) => {
    if (search) {
      paginationRef.current = {
        ...paginationRef.current,
        current: 1,
      };
    }
    try {
      const res = await request.post('api/consumer/getData', {
        courtId: courtState.courtId,
        pagination: {
          current: paginationRef.current.current,
          pageSize: paginationRef.current.pageSize,
        },
        search: search,
      });
      setData(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const getCount = async (search : any= undefined) => {
    try {
      const res = await request.post('api/consumer/getDataSum', {
        courtId: courtState.courtId,
        search: search,
      });
      paginationRef.current = {
        ...paginationRef.current,
        total: res.data,
      };
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleEdit = async (fieldsValue: any, record:any) => {
    try {
      await request.post('api/consumer/update', {
        values: fieldsValue,
        consumerId: record.id,
      });
      await getData();
      message.success('修改成功');
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleDelete = async (record: any) => {
    try {
      await request.post('api/consumer/delData', {
        consumerId: record.id,
      });
      paginationRef.current = {
        ...paginationRef.current,
        current: 1,
      };
      await getCount();
      await getData();
      message.success('删除成功');
    } catch (e) {
      message.error(e.message);
    }
  };

  const onChange = async (page: number) => {
    paginationRef.current={
      ...paginationRef.current,
      current: page,
    };

    await getData();
  };

  const onFinish = async (fieldsValue : any) => {
    if (fieldsValue.paymentType == null || (fieldsValue.paymentType !== 0 && fieldsValue.payCode == null)) {
      message.info('请继续填写支付相关信息');
      return;
    }
    const values = {
      ...fieldsValue,
      card: cardType.find((item:any) => item.id === fieldsValue.card),
    };
    try {
      setLoading(true);
      await request.post('api/consumer/create', {
        values,
        courtId: courtState.courtId,
      });
      message.success('开卡成功');
      await getCount();
      await getData();
      setShowModal(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '微信',
      dataIndex: 'wechat',
      key: 'wechat',
    },
    {
      title: '会员卡',
      dataIndex: 'card',
      key: 'card',
      render: (text: number) => {
        return cardType.find((item:any) => text === item.id).name;
      },
    },
    {
      title: '剩余时长',
      dataIndex: 'remainingTime',
      key: 'remainingTime',
    },
    {
      title: '状态',
      dataIndex: 'activated',
      key: 'activated',
      render: (text:boolean) => {
        switch (text) {
          case false:
            return '已停卡';
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
            <Button danger size='small'>删除</Button>
          </Popconfirm>
          <Button type="primary" size='small' onClick={() => setEditModal({record: record, show: true})}>修改</Button>
        </section>
      ),
    },
  ];

  return (
    <section>
      <section style={{margin: '10px 10px 15px 20px', display: 'flex'}}>
        <Button type="primary" style={{marginRight: '20px'}} onClick={() => setShowModal(true)}>会员开卡</Button>
        <Form
          form={searchForm}
          onFinish={(values) => {
            getCount(values);
            getData(values);
          }}
          layout='inline'
        >
          <Form.Item
            label='身份证号'
            name='id_no'
            style={{width: '300px'}}
            normalize={(value, prevValue, prevValues) => {
              if (!value) {
                return undefined;
              }
              return value;
            }}
          >
            <Input placeholder="会员身份证号"/>
          </Form.Item>
          <Form.Item
            label='手机'
            name='phone'
            style={{width: '300px'}}
            normalize={(value, prevValue, prevValues) => {
              if (!value) {
                return undefined;
              }
              return value;
            }}
          >
            <Input placeholder="会员手机"/>
          </Form.Item>
          <Form.Item
          >
            <Button type="primary" htmlType="submit" >
              搜索
            </Button>
          </Form.Item>
        </Form>
      </section>
      <Table columns={columns} dataSource={data}
        rowKey={(record) => record.phone}
        pagination={{position: ['bottomLeft'], onChange: onChange, ...paginationRef.current,
          showTotal: ((total) => `共${total}条数据`)}}/>
      <Modal
        visible={showModal}
        style={{top: '150px'}}
        footer={null}
        closable={false}
        title="请填写会员信息"
        width={400}
      >
        <Form
          form={form}
          onFinish={onFinish}
        >
          <section style={{display: showPayFrom ? undefined : 'none'}}>
            <Form.Item
              label='支付类型'
              name='paymentType'
              style={{width: '300px'}}
              required
            >
              <Select placeholder="请填写支付类型">
                <Option value={0}>现金</Option>
                <Option value={1}>支付宝</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label='用户付款码'
              name='payCode'
              style={{width: '300px'}}
              required
            >
              <Input placeholder="使用扫码枪输入" />
            </Form.Item>
          </section>
          <section style={{display: showPayFrom ? 'none' : undefined}}>
            <Form.Item
              label='姓名'
              name='name'
              rules={[{required: true, message: '请填写会员姓名'}]}
              style={{width: '300px'}}
            >
              <Input placeholder="请填写会员姓名"/>
            </Form.Item>
            <Form.Item
              label='手机'
              name='phone'
              rules={[{required: true, message: '请填写会员手机'}]}
              style={{width: '300px'}}
            >
              <Input placeholder="请填写会员手机"/>
            </Form.Item>
            <Form.Item
              label='微信'
              name='wechat'
              style={{width: '300px'}}
            >
              <Input placeholder="请填写会员微信"/>
            </Form.Item>
            <Form.Item
              label='身份证号'
              name='id_no'
              rules={[{required: true, message: '请填写身份证号'}]}
            >
              <Input placeholder="请填写身份证号"/>
            </Form.Item>
            <Form.Item
              label='会员卡'
              name='card'
              rules={[{required: true, message: '请填写会员卡'}]}
            >
              <Select placeholder="请选择会员卡">
                {
                  cardType?.map((item:any) => {
                    return <Option key={item.name} value={item.id}>{item.name+` (售价${item.price}元)`}</Option>;
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label='备注'
              name='message'
            >
              <TextArea rows={2}/>
            </Form.Item>
          </section>
          <Form.Item
            style={{marginLeft: '40%'}}
          >
            {
              showPayFrom ? (
                <>
                  <Button type="primary" disabled={loading} onClick={() => {
                    setShowPayFrom(false);
                    form.resetFields(['paymentType', 'payCode']);
                  }}>
                    返回
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
                    确认
                  </Button>
                </>
              ) : (
                <>
                  <Button type="primary" onClick={() => {
                    form.resetFields();
                    setShowModal(false);
                  }}>
                    取消
                  </Button>
                  <Button type="primary" style={{marginLeft: '40px'}} onClick={() => {
                    form.validateFields(['name', 'phone', 'id_no', 'card'])
                        .then(() => setShowPayFrom(true))
                        .catch(() => {
                          message.error('用户信息不完整');
                        },
                        );
                  }}>
                    前往支付
                  </Button>
                </>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
      <EditModal
        record={editModal.record}
        showModal={editModal.show}
        onCancel={() => setEditModal({...editModal, show: false})}
        handleEdit={handleEdit}
      />
    </section>
  );
}

export default UserList as React.FC;
