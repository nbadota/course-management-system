import React, {useContext, useEffect, useState} from 'react';
import {Form, Input, Button, TimePicker, Radio, Divider, message} from 'antd';
import moment from 'moment';
import {request} from '../../../common/utils/request';
// import {AuthContext} from '../../../context/authContext';
import {CourtContext} from '../../../context/courtContext';

function CourtInfo() {
  const [form] = Form.useForm();
  // const {authState} = useContext(AuthContext);
  const {courtDispatch, courtState} = useContext(CourtContext);
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    initForm();
  }, []);

  const initForm = async () => {
    try {
      const res = await request.get('/api/court/isExist');
      if (res.data) {
        setShowForm(true);
        const FieldsValue = {
          ...res.data,
          ...res.data?.info,
          'opening': (res.data?.openTime && res.data?.closeTime) ? [
            moment(res.data?.openTime, 'HH:mm:ss'),
            moment(res.data?.closeTime, 'HH:mm:ss'),
          ] : null,
        };
        delete FieldsValue.info;
        form.setFieldsValue(FieldsValue);
        setData(FieldsValue);
        courtDispatch({
          type: 'ChangeCourt',
          payload: {
            courtId: res.data.id,
          },
        });
      }
    } catch (e) {
      message.error(e.message);
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
      });
      await initForm();
      message.success('更新成功');
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
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
            >
              <Input/>
            </Form.Item>
            <Form.Item
              label='场馆地址'
              name='location'
              style={{width: '500px'}}
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
              <Button type="primary" onClick={() => {
                form.resetFields();
                form.setFieldsValue(data);
              }}>
                重置表单
              </Button>
            </Form.Item>
          </Form>
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
