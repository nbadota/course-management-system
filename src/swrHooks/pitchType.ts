import useSWR from 'swr';
import {request} from '../common/utils/request';

function usePitchType(courtId: number) {
  const fetcher = () => request.post('api/pitch/getPitchType', {
    courtId,
  }).then((res) => res.data);
  const {data, error} = useSWR('api/pitch/getPitchType', fetcher);

  return {
    pitchType: data,
    isError: error,
  };
}

export {
  usePitchType,
};

