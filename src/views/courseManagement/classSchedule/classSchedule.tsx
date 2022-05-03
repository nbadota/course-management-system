import React, {useContext, useEffect, useState} from 'react';
import {Calendar, Typography, Tabs, message, Table} from 'antd';
import 'moment/dist/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import {PickerLocale} from 'antd/es/date-picker/generatePicker';
import {CourtContext} from '../../../context/courtContext';
import {request} from '../../../common/utils/request';
import {useCoach} from '../../../swrHooks/coach';

const {TabPane} = Tabs;

function ClassSchedule() {
  const {courtState} = useContext(CourtContext);
  const {coach} = useCoach(courtState.courtId);
  const [curCoach, setCurCoach] = useState(null);
  const [curDate, setCurDate] = useState(moment().format('YYYYMMDD'));
  const [data, setData] = useState([]);

  useEffect(() => {
    setCurCoach(coach?.[0]?.id);
  }, [coach]);

  useEffect(() => {
    if (curCoach) {
      getData();
    }
  }, [curCoach, curDate]);

  const getData = async function() {
    try {
      const res = await request.post('api/course/getClassSchedule', {
        search: {
          coachId: curCoach,
        },
        curDate: curDate,
      });
      setData(res.data);
      message.success('查询成功');
    } catch (e) {
      message.error(e.message);
    }
  };

  const onTabClick = function(key:string) {
    setCurCoach(key);
  };

  const onSelect = function(date: any) {
    setCurDate(date.format('YYYYMMDD'));
  };

  const columns = [
    {
      title: '上课时间',
      key: 'time',
      render: (record: any) => {
        return `${record.startTime} - ${record.endTime}`;
      },
    },
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '上课场地',
      key: 'pitch',
      render: (record: any) => {
        return record.pitch.name;
      },
    },
    {
      title: '上课人数 / 人数上限',
      key: 'pitch',
      render: (record: any) => {
        return `${record.currentSize} / ${record.classSize}`;
      },
    },
  ];

  return (
    <section style={{display: 'flex'}}>
      <section style={{margin: '15px 0px 0px 30px', width: '300px'}}>
        <Typography.Title style={{textAlign: 'center'}} level={4}>点击日历查询课程安排</Typography.Title>
        <Calendar fullscreen={false} locale={locale as unknown as PickerLocale} onSelect={onSelect}/>
      </section>
      <section style={{flex: '1', marginLeft: '60px'}}>
        <Tabs style={{width: '90%'}} onTabClick={onTabClick} activeKey={String(curCoach)}>
          {
            coach && coach.map((item:any) => {
              return (
                <TabPane tab={item.name} key={item.id}/>
              );
            })
          }
        </Tabs>
        <Table columns={columns} dataSource={data}
          style={{width: '90%'}}
          pagination={false}
          rowKey={(record) => record.id}
        />
      </section>
    </section>
  );
}

export default ClassSchedule as React.FC;

