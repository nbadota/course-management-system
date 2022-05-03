import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button, message, Popconfirm, Table, Popover, Form, Input} from 'antd';
import moment from 'moment';
import {CourtContext} from '../../../context/courtContext';
import {request} from '../../../common/utils/request';
// import {useCardType} from '../../../swrHooks/card';
import {PayStatus} from '../../../common/constant/pay';

function CardOrder() {
  const [data, setData] = useState(null);
  const {courtState} = useContext(CourtContext);
  // const {cardType} = useCardType(courtState.courtId);

  const paginationRef = useRef({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  useEffect(() => {
    getCount();
    getData();
  }, []);

  const getData = async (search: any = {}) => {
    const searchNotEmpty = Object.keys(search).length !== 0;
    if (searchNotEmpty) {
      paginationRef.current = {
        ...paginationRef.current,
        current: 1,
      };
    }
    try {
      const res = await request.post('api/order/getData', {
        courtId: courtState.courtId,
        pagination: {
          current: paginationRef.current.current,
          pageSize: paginationRef.current.pageSize,
        },
        search: {
          ...search,
          type: 0,
        },
      });
      setData(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };


  const getCount = async (search : any= {}) => {
    try {
      const res = await request.post('api/order/getDataSum', {
        courtId: courtState.courtId,
        search: {
          ...search,
          type: 0,
        },
      });
      paginationRef.current = {
        ...paginationRef.current,
        total: res.data,
      };
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

  const handleCancel = (record: any) => {
    return 0;
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '支付方式',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (text:number) => {
        switch (text) {
          case 1:
            return '支付宝';
          case 0:
            return '现金支付';
          default:
            return '';
        }
      },
    },
    {
      title: '总价',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '会员',
      dataIndex: 'consumer',
      key: 'consumer',
      render: (text:any) => {
        return (<Popover title='详细信息' trigger='hover' content={(<section>
          <p>手机: {text.phone}</p>
          <p>微信: {text.wechat}</p>
          <p>身份证号: {text.id_no}</p>
        </section>)}><Button size='small'>{text.name}</Button></Popover>);
      },
    },
    {
      title: '会员卡',
      key: 'item',
      render: (record: any) => {
        return record.cardType.name;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => {
        return moment(text).format('YYYY/MM/DD HH:mm:ss');
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text:number) => {
        switch (text) {
          case PayStatus.SUCCESS:
            return '成功';
          case PayStatus.FAIL:
            return '失败';
          case PayStatus.CANCEL:
            return '已取消';
          case PayStatus.ABNORMAL:
            return '需手动取消';
          case PayStatus.WAIT_USER_PAY:
            return '待支付';
          default:
            return '';
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text:any, record:any) => (
        <section>
          <Popconfirm
            title="确定要取消吗？"
            onConfirm={() => handleCancel(record)}
            okText="是"
            cancelText="否"
          >
            <Button danger size='small'>取消订单</Button>
          </Popconfirm>
        </section>
      ),
    },
  ];

  return (
    <section>
      <Form
        style={{margin: '10px 10px 15px 20px'}}
        onFinish={(values) => {
          getCount(values);
          getData(values);
        }}
        layout='inline'
      >
        <Form.Item
          label='订单编号'
          name='code'
          style={{width: '300px'}}
          normalize={(value, prevValue, prevValues) => {
            if (!value) {
              return undefined;
            }
            return value;
          }}
        >
          <Input placeholder="订单编号"/>
        </Form.Item>
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
      <Table columns={columns} dataSource={data}
        rowKey={(record) => record.code}
        pagination={{position: ['bottomLeft'], ...paginationRef.current, onChange: onChange,
          showTotal: ((total) => `共${total}条数据`)}}/>
    </section>
  );
}

export default CardOrder as React.FC;

