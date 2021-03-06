import React, {useContext, useEffect, useState} from 'react';
import {Tree, InputNumber, Button, message, Table, Modal, Form, Input} from 'antd';
import {TreeDataNode} from 'antd/es';
import {CourtContext} from '../../../context/courtContext';
import {useCourtInfo} from '../../../swrHooks/courtInfo';
import {MenuIcon} from '../../../common/constant/menuIcon';
import {request} from '../../../common/utils/request';

interface extraNode extends TreeDataNode{
  grade: number;
  icon?: 'user' | 'course' | 'court' | 'order';
}

function Permission() {
  const {permissionList} = useCourtInfo();
  const {courtState} = useContext(CourtContext);
  const [treeData, setTreeData] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (permissionList?.length) {
      const permission = permissionList?.find((item:any) => item.courtId === courtState.courtId);
      setTreeData(permission.info);
    }
  }, [permissionList]);

  useEffect(() => {
    getRoleList();
  }, []);

  const getRoleList = async () => {
    try {
      const res = await request.post('/api/role/getData', {
        courtId: courtState.courtId,
      });
      setRoleList(res.data);
    } catch (e) {
      message.error(e.message);
    }
  };

  const formatTreeData = (treeData:any) => {
    return treeData.map((item:any) => {
      return {
        ...item,
        key: item.title,
        children: item?.children ? formatTreeData(item.children) : undefined,
      };
    });
  };

  const replaceNode = (treeData: any, title: any, nodeData: any):any => {
    let isGet = false;
    function deepSearch(treeData:any, title:any) {
      for (let i = 0; i<treeData.length; i++) {
        if (treeData[i].children && treeData[i].children.length > 0) {
          deepSearch(treeData[i].children, title);
        }
        if (title === treeData[i].title || isGet) {
          isGet||(treeData[i] = nodeData);
          isGet = true;
          break;
        }
      }
    }
    deepSearch(treeData, title);
    return treeData;
  };

  const handleGradeChange = (value: number, nodeData: extraNode) => {
    nodeData.grade = value;
    delete nodeData.key;
    const newTreeData = replaceNode(treeData, nodeData.title, nodeData);
    setTreeData(newTreeData);
  };

  const executeGradeChange = async () => {
    try {
      await request.post('/api/court/updatePermissionList', {
        values: treeData,
        courtId: courtState.courtId,
      });
      message.success('????????????');
    } catch (e) {
      message.error('????????????');
    }
  };

  const onFinish = async (fieldsValue: any) => {
    try {
      await request.post('/api/role/update', {
        values: fieldsValue,
        id: editId,
      });
      await getRoleList();
      message.success('????????????');
      setShowModal(false);
      form.resetFields();
    } catch (e) {
      message.error(e.message);
    }
  };

  const columns = [
    {
      title: '????????????',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '????????????',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '??????',
      key: 'operation',
      render: (text: any, record: any) => {
        return (
          <section>
            <Button type='primary' onClick={() => {
              setShowModal(true);
              setEditId(record.id);
            }
            }>??????</Button>
          </section>
        );
      },
    },
  ];

  return (
    <section>
      <section style={{margin: '10px 10px 15px 20px'}}>
        <Button type="primary" onClick={executeGradeChange}>??????????????????</Button>
      </section>
      <section style={{display: 'flex', margin: '0 auto', width: '1100px'}}>
        {
          treeData?.length &&
          <Tree
            style={{
              backgroundColor: '#f0f2f5',
              flex: '1',
              border: '1px solid #bfbfbf',
              padding: '10px',
              borderRadius: '10px',
            }}
            defaultExpandAll={true}
            treeData={formatTreeData(treeData)}
            titleRender={(nodeData: extraNode) => {
              return (
                <section style={{fontSize: '16px'}}>
                  {MenuIcon[nodeData.icon]}&nbsp;
                  <span style={nodeData?.children ? {color: '#030852'} : {color: '#434343'}}>
                    {nodeData.title}
                  </span>&nbsp;
                  <span style={{color: '#1890ff'}}> ???????????????</span>
                  <InputNumber min={0} defaultValue={nodeData.grade}
                    onChange={(value) => handleGradeChange(value, nodeData)}/>
                </section>
              );
            }}
          />
        }
        <Table
          style={{width: '600px', marginLeft: '80px'}}
          columns={columns}
          dataSource={roleList}
          rowKey={(record) => record.id}
          pagination={false}
        />
      </section>
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
          <Form.Item
            label='????????????'
            name='name'
            style={{width: '300px'}}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label='????????????'
            name='grade'
            style={{width: '300px'}}
          >
            <InputNumber/>
          </Form.Item>
          <Form.Item
            style={{marginLeft: '40%'}}
          >
            <Button type="primary" onClick={() => {
              form.resetFields();
              setShowModal(false);
            }}>
              ??????
            </Button>
            <Button type="primary" htmlType="submit" style={{marginLeft: '40px'}}>
              ??????
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default Permission as React.FC;

