import { useLocalSearchParams } from 'expo-router';
import { AddRecord } from '../screens/Flows';

export default function Route() {
  const { template, cat } = useLocalSearchParams<{ template?: string; cat?: string }>();
  return <AddRecord templateId={template} catId={cat} />;
}
