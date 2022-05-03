import React, {useContext, useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Select, Table, Upload, Avatar, Image} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import {UploadListType} from 'antd/es/upload/interface';
import {request} from '../../../common/utils/request';
import {CourtContext} from '../../../context/courtContext';
import {isDEV, imgHostDev, imgHostPrd} from '../../../common/utils/ENV';

function StaffManagement() {
  const {Option} = Select;
  const {TextArea} = Input;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState({show: false, id: null});
  const [roleList, setRoleList] = useState([]);
  const {courtState} = useContext(CourtContext);
  const [form] = Form.useForm();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await request.post('/api/staff/getData', {
        courtId: courtState.courtId,
      });
      const role = await request.post('/api/role/getData', {
        courtId: courtState.courtId,
      });
      setData(res.data);
      setRoleList(role.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const uploadProps = {
    maxCount: 1,
    fileList,
    listType: 'picture' as UploadListType,
    onRemove: (file: any) => {
      setFileList((prevState) => {
        const index = prevState.indexOf(file);
        const newFileList = prevState.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
  };

  const handleDelete = async (record: any) => {
    try {
      await request.post('/api/staff/delData', {
        staffId: record.id,
      });
      message.success('删除成功');
      await getData();
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleEdit = (e:any, record: any) => {
    setShowModal(true);
    setEdit({show: true, id: record.id});
    const fieldsValues = {
      name: record.name,
      message: record.message,
    };
    form.setFieldsValue(fieldsValues);
  };

  const onFinish = async (fieldsValue: any) => {
    const avatar = fieldsValue?.avatar?.[0]?.originFileObj;
    delete fieldsValue?.avatar;
    const formData = new FormData();
    formData.append('values', JSON.stringify(fieldsValue));
    formData.append('courtId', courtState.courtId);
    if (edit.show) {
      formData.append('staffId', edit.id);
    }
    formData.append('avatar', avatar);
    if (edit.show) {
      try {
        await request.post('/api/staff/update', formData,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
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
        await request.post('/api/staff/create', formData,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
        message.success('录入成功');
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

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const columns = [
    {
      title: '工作照片',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (text:any, record:any) => {
        let src = '';
        if (text?.path) {
          const index = text.path.indexOf('images');
          src = text.path.substring(index).replace(/\\/g, '/');
        }
        return (
          <Avatar size={64} src={<Image src={isDEV ? `${imgHostDev}/${src}` : `${imgHostPrd}/${src}`}/>}/>
        );
      },
    },
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
      title: '角色',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (text: any) => {
        return roleList?.find((item) => item.id === text)?.name;
      },
      filters: roleList.map((item) => {
        return {
          text: item.name,
          value: item.id,
        };
      }),
      onFilter: (value: any, record: any) => record.roleId === value,
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
        <Button type="primary" onClick={() => setShowModal(true)}>录入员工信息</Button>
      </section>
      <Table columns={columns} dataSource={data}
        rowKey={(record) => record.id}
        pagination={{position: ['bottomLeft'], pageSize: 5}}
      />
      <Modal
        visible={showModal}
        style={{top: '150px'}}
        width={400}
        footer={null}
        closable={false}
        title="请填写员工信息"
      >
        <Form
          form={form}
          onFinish={onFinish}
          style={{width: '400px'}}
        >
          <Form.Item
            label='姓名'
            name='name'
            rules={[{required: true, message: '请填员工姓名'}]}
            style={{width: '300px'}}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label='电话'
            name='phone'
            style={{width: '300px'}}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label='角色'
            name='roleId'
            style={{width: '300px'}}
          >
            <Select placeholder="请选择员工角色">
              {
                roleList.map((item) => (<Option key={item.name} value={item.id}>{item.name}</Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label='简介'
            name='message'
            style={{width: '300px'}}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            label='工作照'
            name='avatar'
            valuePropName="fileList"
            getValueFromEvent={normFile}
            style={{width: '300px'}}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>请选择文件</Button>
            </Upload>
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
    </section>);
}

export default StaffManagement as React.FC;

