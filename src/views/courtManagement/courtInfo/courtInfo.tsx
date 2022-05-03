import React, {useContext, useEffect, useState} from 'react';
import {Form, Input, Button, TimePicker, Radio, Divider, message, Modal} from 'antd';
import moment from 'moment';
import {useSWRConfig} from 'swr';
import {request} from '../../../common/utils/request';
import {CourtContext} from '../../../context/courtContext';
import {menuList} from '../../../router';
import {useCourtInfo} from '../../../swrHooks/courtInfo';

function CourtInfo() {
  const {mutate} = useSWRConfig();
  const [form] = Form.useForm();
  const {courtInfo} = useCourtInfo();
  const {courtState} = useContext(CourtContext);
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    initForm();
  }, [courtInfo]);

  const initForm = () => {
    if (courtInfo?.length) {
      setShowForm(true);
      const res = courtInfo.find((item:any) => item.id === courtState.courtId);
      const FieldsValue = {
        ...res,
        ...res?.info,
        'opening': (res?.openTime && res?.closeTime) ? [
          moment(res?.openTime, 'HH:mm:ss'),
          moment(res?.closeTime, 'HH:mm:ss'),
        ] : null,
      };
      delete FieldsValue.info;
      form.setFieldsValue(FieldsValue);
      setData(FieldsValue);
    }
  };

  const onFinish = async (fieldsValue: any) => {
    const rangeTimeValue = fieldsValue['opening'];
    const value = {
      ...fieldsValue,
      'opening': rangeTimeValue ?[
        rangeTimeValue[0].format('HH:mm:ss'),
        rangeTimeValue[1].format('HH:mm:ss'),
      ] : null,
    };
    try {
      setLoading(true);
      await request.post('/api/court/update', {
        value,
        id: courtState.courtId,
        menuList,
      });
      await mutate('api/court/isExist');
      message.success('更新成功');
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (fieldsValue: any) => {
    try {
      await request.post('/api/court/update', {
        value: fieldsValue,
        menuList,
      });
      await mutate('api/court/isExist');
      message.success('添加成功');
      setShowModal(false);
    } catch (e) {
      message.error(e.message);
    }
  };

  return showForm ?
      (
        <section>
          <Form
            layout='horizontal'
            style={{marginLeft: '30px', marginTop: '10px'}}
            form={form}
            onFinish={onFinish}
          >
            <Divider orientation="left" plain>
              基础信息
            </Divider>
            <Form.Item
              label='场馆名称'
              name='name'
              style={{width: '500px'}}
              rules={[{required: true, message: '请填写场馆名称'}]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              label='场馆地址'
              name='location'
              style={{width: '500px'}}
              rules={[{required: true, message: '请填写场馆地址'}]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              label='营业时间'
              name='opening'
            >
              <TimePicker.RangePicker/>
            </Form.Item>
            <Divider orientation="left" plain>
              场馆设施与服务
            </Divider>
            <Form.Item
              label='wifi'
              name='wifi'
            >
              <Radio.Group>
                <Radio value='无'>无</Radio>
                <Radio value='有'>有</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label='培训服务'
              name='training'
            >
              <Radio.Group>
                <Radio value='无'>无</Radio>
                <Radio value='有'>有</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label='超市'
              name='supermarket'
            >
              <Radio.Group>
                <Radio value='无'>无</Radio>
                <Radio value='有'>有</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label='淋浴设施'
              name='bath'
            >
              <Radio.Group>
                <Radio value='无'>无</Radio>
                <Radio value='会员免费'>免费</Radio>
                <Radio value='收费'>收费</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label='停车场'
              name='parkingLot'
            >
              <Radio.Group>
                <Radio value='无'>无</Radio>
                <Radio value='免费'>免费</Radio>
                <Radio value='收费'>收费</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{marginRight: '30px'}}>
                提交更改
              </Button>
              <Button style={{marginRight: '30px'}} type="primary" onClick={() => {
                form.resetFields();
                form.setFieldsValue(data);
              }}>
                重置表单
              </Button>
              <Button type="primary" onClick={() => setShowModal(true)}>
                添加场馆
              </Button>
            </Form.Item>
          </Form>
          <Modal
            visible={showModal}
            style={{top: '150px'}}
            footer={null}
            closable={false}
            title="请填写场馆基本信息"
            width={400}
          >
            <Form
              onFinish={handleAdd}
            >
              <Form.Item
                label='场馆名称'
                name='name'
                style={{width: '300px'}}
                rules={[{required: true, message: '请填写场馆名称'}]}
              >
                <Input/>
              </Form.Item>
              <Form.Item
                label='场馆地址'
                name='location'
                style={{width: '300px'}}
                rules={[{required: true, message: '请填写场馆地址'}]}
              >
                <Input/>
              </Form.Item>
              <Form.Item
                style={{marginLeft: '40%'}}
              >
                <Button type="primary" onClick={() => {
                  setShowModal(false);
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" style={{marginLeft: '40px'}}>
                  确认
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </section>
      ) :
    (
      <section style={{margin: '15px'}}>
         还没创建场馆 ？
        <Button type="primary" onClick={() => setShowForm(true)}>点击创建场馆</Button>
      </section>
    )
  ;
}

export default CourtInfo as React.FC;
