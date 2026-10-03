import { useLocalSearchParams } from 'expo-router';
import { RecipientPreview } from '../../../screens/People';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecipientPreview id={id} />;
}
