import { useLocalSearchParams } from 'expo-router';
import { Ticket } from '../../screens/Settings';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Ticket id={id} />;
}
