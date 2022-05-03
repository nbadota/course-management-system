import useSWR from 'swr';
import {request} from '../common/utils/request';

function useCardType(courtId: number) {
  const fetcher = () => request.post('api/card/getData', {courtId}).then((res) => res.data);
  const {data, error} = useSWR('api/card/getData', fetcher);

  return {
    cardType: data,
    isError: error,
  };
}

export {
  useCardType,
};

