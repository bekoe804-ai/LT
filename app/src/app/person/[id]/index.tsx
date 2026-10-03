import { useLocalSearchParams } from 'expo-router';
import { PersonScreen } from '../../../screens/People';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PersonScreen id={id} />;
}
