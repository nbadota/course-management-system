import React, {FC, useState} from 'react';
import {Button, Form, Input, message, Modal, Select} from 'antd';
import {debounce} from 'lodash';
import {request} from '../../../common/utils/request';

interface Props {
  record: any;
  showModal: boolean;
  onCancel: () => void;
  courtId: number;
  getData: () => Promise<void>;
}

const PayModal:FC<Props> = (props) => {
  const {Option} = Select;
  const {showModal, onCancel, record, courtId, getData} = props;
  const [consumer, setConsumer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handlePay = async (fieldsValue:any) => {
    if (fieldsValue.paymentType ===1 && !fieldsValue.payCode) {
      message.warn('请输入付款码');
      return;
    }
    try {
      setLoading(true);
      await request.post('api/course/pay', {
        courtId: courtId,
        values: {
          ...fieldsValue,
          courseDetail: {
            id: record.id,
            price: record.price,
          },
        },
      });
      await getData();
      message.success('支付成功');
      form.resetFields();
      onCancel();
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onConsumerSearch = async (value: string) => {
    try {
      const res = await request.post('api/consumer/searchData', {
        courtId: courtId,
        search: {
          id_no: value,
        },
      });
      setConsumer(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  return (
    <Modal
      visible={showModal}
      style={{top: '150px'}}
      footer={null}
      closable={false}
      title="请填写支付信息"
      width={400}
    >
      <Form
        form={form}
        onFinish={handlePay}
      >
        <Form.Item
          label='会员'
          name='consumerId'
          style={{width: '300px'}}
          rules={[{required: true, message: '请填写用户'}]}
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
          label='支付类型'
          name='paymentType'
          style={{width: '300px'}}
          rules={[{required: true, message: '请填写支付类型'}]}
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
        <Form.Item
          style={{marginLeft: '40%'}}
        >
          <Button type="primary" disabled={loading} onClick={() => {
            form.resetFields();
            onCancel();
          }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{marginLeft: '40px'}}>
            确认支付
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};


export default PayModal;
