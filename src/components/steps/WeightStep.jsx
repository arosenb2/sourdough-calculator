import WeightPicker from '../WeightPicker';

export default function WeightStep({ data, onChange }) {
  return <WeightPicker value={data.totalWeight} onChange={(totalWeight) => onChange({ totalWeight })} />;
}
