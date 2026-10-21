import { waterBudget, waterBudgetMessage } from '../../utils/calculations';

/** Explains why a step can't continue when the dough's water adds up to more than its hydration. */
export default function WaterBudgetWarning({ data }) {
  const message = waterBudgetMessage(waterBudget(data));
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
      {message}
    </p>
  );
}
