import useSWR from 'swr';
import {request} from '../common/utils/request';
import {useContext} from 'react';
import {AuthContext} from '../context/authContext';

function useCourtInfo() {
  const {authState} = useContext(AuthContext);
  const fetcher1 = () => request.get('api/court/isExist').then((res) => res.data);

  const {data: courtInfo, error: error1} = useSWR(authState.user ? 'api/court/isExist' : null, fetcher1);

  const fetcher2 = (courtInfo: any) => request.post('api/court/getPermissionList', {
    courtId: courtInfo?.map((item:any) => item.id),
  }).then((res) => res.data);

  const {data: permissionList, error: error2} = useSWR(() => 'api/court/getPermissionList'+ courtInfo.length,
      () => fetcher2(courtInfo));

  return {
    courtInfo,
    permissionList,
    isError: error1 || error2,
  };
}

export {
  useCourtInfo,
};

