import React, {FC} from 'react';
import {Button, Form, Input, Modal, Select} from 'antd';

interface Props {
  record: any,
  showModal: boolean,
  handleEdit: (fieldsValue: any, record: any) => Promise<void>,
  onCancel: () => void,
}

const EditModal:FC<Props> = (props) => {
  const {Option} = Select;
  const {showModal, handleEdit, record, onCancel} = props;
  const [form] = Form.useForm();
  return (
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
        onFinish={(values) => {
          handleEdit(values, record);
          form.resetFields();
          onCancel();
        }}
      >
        <Form.Item
          label='姓名'
          name='name'
          style={{width: '300px'}}
        >
          <Input placeholder="会员姓名"/>
        </Form.Item>
        <Form.Item
          label='手机'
          name='phone'
          style={{width: '300px'}}
        >
          <Input placeholder="会员手机"/>
        </Form.Item>
        <Form.Item
          label='微信'
          name='phone'
          style={{width: '300px'}}
        >
          <Input placeholder="会员微信"/>
        </Form.Item>
        <Form.Item
          label='会员状态'
          name='activated'
          style={{width: '300px'}}
        >
          <Select placeholder='会员状态'>
            <Option value={true}>使用中</Option>
            <Option value={false}>已停卡</Option>
          </Select>
        </Form.Item>
        <Form.Item
          style={{marginLeft: '40%'}}
        >
          <Button type="primary" onClick={() => {
            form.resetFields();
            onCancel();
          }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" style={{marginLeft: '40px'}}>
            确认
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};


export default EditModal;
