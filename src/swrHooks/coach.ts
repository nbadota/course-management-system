import useSWR from 'swr';
import {request} from '../common/utils/request';

function useCoach(courtId: number) {
  const fetcher = () => request.post('api/staff/getData', {
    courtId,
    search: {
      roleId: 2,
    },
  }).then((res) => res.data);
  const {data, error} = useSWR('api/staff/getData', fetcher);

  return {
    coach: data,
    isError: error,
  };
}

export {
  useCoach,
};

