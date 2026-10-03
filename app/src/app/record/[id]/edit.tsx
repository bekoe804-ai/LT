import { useLocalSearchParams } from 'expo-router';
import { EditRecord } from '../../../screens/Record';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditRecord id={id} />;
}
