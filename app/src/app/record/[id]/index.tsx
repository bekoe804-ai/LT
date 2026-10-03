import { useLocalSearchParams } from 'expo-router';
import { RecordScreen } from '../../../screens/Record';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecordScreen id={id} />;
}
