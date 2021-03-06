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
      message.success('????????????');
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
      message.success('????????????');
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
      message.info('?????????????????????????????????');
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
      message.success('????????????');
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
      title: '??????',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '??????',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '??????',
      dataIndex: 'wechat',
      key: 'wechat',
    },
    {
      title: '?????????',
      dataIndex: 'card',
      key: 'card',
      render: (text: number) => {
        return cardType.find((item:any) => text === item.id).name;
      },
    },
    {
      title: '????????????',
      dataIndex: 'remainingTime',
      key: 'remainingTime',
    },
    {
      title: '??????',
      dataIndex: 'activated',
      key: 'activated',
      render: (text:boolean) => {
        switch (text) {
          case false:
            return '?????????';
          case true:
            return '?????????';
          default:
            return '';
        }
      },
    },
    {
      title: '??????',
      dataIndex: 'message',
      key: 'message',
      width: 300,
      ellipsis: true,
    },
    {
      title: '??????',
      key: 'action',
      render: (text:any, record:any) => (
        <section>
          <Popconfirm
            title="?????????????????????"
            onConfirm={() => handleDelete(record)}
            okText="???"
            cancelText="???"
          >
            <Button danger size='small'>??????</Button>
          </Popconfirm>
          <Button type="primary" size='small' onClick={() => setEditModal({record: record, show: true})}>??????</Button>
        </section>
      ),
    },
  ];

  return (
    <section>
      <section style={{margin: '10px 10px 15px 20px', display: 'flex'}}>
        <Button type="primary" style={{marginRight: '20px'}} onClick={() => setShowModal(true)}>????????????</Button>
        <Form
          form={searchForm}
          onFinish={(values) => {
            getCount(values);
            getData(values);
          }}
          layout='inline'
        >
          <Form.Item
            label='????????????'
            name='id_no'
            style={{width: '300px'}}
            normalize={(value, prevValue, prevValues) => {
              if (!value) {
                return undefined;
              }
              return value;
            }}
          >
            <Input placeholder="??????????????????"/>
          </Form.Item>
          <Form.Item
            label='??????'
            name='phone'
            style={{width: '300px'}}
            normalize={(value, prevValue, prevValues) => {
              if (!value) {
                return undefined;
              }
              return value;
            }}
          >
            <Input placeholder="????????????"/>
          </Form.Item>
          <Form.Item
          >
            <Button type="primary" htmlType="submit" >
              ??????
            </Button>
          </Form.Item>
        </Form>
      </section>
      <Table columns={columns} dataSource={data}
        rowKey={(record) => record.phone}
        pagination={{position: ['bottomLeft'], onChange: onChange, ...paginationRef.current,
          showTotal: ((total) => `???${total}?????????`)}}/>
      <Modal
        visible={showModal}
        style={{top: '150px'}}
        footer={null}
        closable={false}
        title="?????????????????????"
        width={400}
      >
        <Form
          form={form}
          onFinish={onFinish}
        >
          <section style={{display: showPayFrom ? undefined : 'none'}}>
            <Form.Item
              label='????????????'
              name='paymentType'
              style={{width: '300px'}}
              required
            >
              <Select placeholder="?????????????????????">
                <Option value={0}>??????</Option>
                <Option value={1}>?????????</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label='???????????????'
              name='payCode'
              style={{width: '300px'}}
              required
            >
              <Input placeholder="?????????????????????" />
            </Form.Item>
          </section>
          <section style={{display: showPayFrom ? 'none' : undefined}}>
            <Form.Item
              label='??????'
              name='name'
              rules={[{required: true, message: '?????????????????????'}]}
              style={{width: '300px'}}
            >
              <Input placeholder="?????????????????????"/>
            </Form.Item>
            <Form.Item
              label='??????'
              name='phone'
              rules={[{required: true, message: '?????????????????????'}]}
              style={{width: '300px'}}
            >
              <Input placeholder="?????????????????????"/>
            </Form.Item>
            <Form.Item
              label='??????'
              name='wechat'
              style={{width: '300px'}}
            >
              <Input placeholder="?????????????????????"/>
            </Form.Item>
            <Form.Item
              label='????????????'
              name='id_no'
              rules={[{required: true, message: '?????????????????????'}]}
            >
              <Input placeholder="?????????????????????"/>
            </Form.Item>
            <Form.Item
              label='?????????'
              name='card'
              rules={[{required: true, message: '??????????????????'}]}
            >
              <Select placeholder="??????????????????">
                {
                  cardType?.map((item:any) => {
                    return <Option key={item.name} value={item.id}>{item.name+` (??????${item.price}???)`}</Option>;
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label='??????'
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
                    ??????
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
                    ??????
                  </Button>
                </>
              ) : (
                <>
                  <Button type="primary" onClick={() => {
                    form.resetFields();
                    setShowModal(false);
                  }}>
                    ??????
                  </Button>
                  <Button type="primary" style={{marginLeft: '40px'}} onClick={() => {
                    form.validateFields(['name', 'phone', 'id_no', 'card'])
                        .then(() => setShowPayFrom(true))
                        .catch(() => {
                          message.error('?????????????????????');
                        },
                        );
                  }}>
                    ????????????
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
