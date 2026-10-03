import { useLocalSearchParams } from 'expo-router';
import { Category } from '../../screens/Testament';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Category id={id} />;
}
