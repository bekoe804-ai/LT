import { useLocalSearchParams } from 'expo-router';
import { DocumentViewer } from '../screens/Record';

export default function Route() {
  const { rec, i } = useLocalSearchParams<{ rec: string; i: string }>();
  return <DocumentViewer recId={rec} index={Number(i) || 0} />;
}
