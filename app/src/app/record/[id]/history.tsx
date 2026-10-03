import { useLocalSearchParams } from 'expo-router';
import { RecordHistory } from '../../../screens/Record';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecordHistory id={id} />;
}
