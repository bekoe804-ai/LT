import { useLocalSearchParams } from 'expo-router';
import { ReplacePerson } from '../../../screens/People';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReplacePerson id={id} />;
}
