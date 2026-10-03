import { useLocalSearchParams } from 'expo-router';
import { EditPerson } from '../../../screens/People';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditPerson id={id} />;
}
