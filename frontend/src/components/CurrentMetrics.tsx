import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MetricCard } from './MetricCard';
import { Thermometer, Droplet } from 'lucide-react';

const fmt1 = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export function CurrentMetrics() {
  const { temperature, humidity } = useSelector(
    (state: RootState) => state.dashboard.currentMetrics
  );

  return (
    <>
      <MetricCard
        title="Current Temp"
        metric={fmt1.format(Number(temperature))}
        unit="°C"
        icon={<Thermometer />}
      />
      <MetricCard
        title="Current Humidity"
        metric={fmt1.format(Number(humidity))}
        unit="%"
        icon={<Droplet />}
      />
    </>
  );
}
