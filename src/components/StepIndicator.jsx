import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <nav aria-label="Progress" className="mb-8 relative">
      {/* Progress line */}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-indigo-600 transition-all duration-500 ease-in-out"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      {/* Step indicators */}
      <ol className="relative flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <div
              className={`relative flex h-8 w-8 items-center justify-center rounded-full 
                transition-colors duration-200
                ${
                  index <= currentStep
                    ? 'bg-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
            >
              <CheckCircleIcon
                className={`h-5 w-5 transition-colors duration-200
                  ${
                    index <= currentStep
                      ? 'text-white'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                aria-hidden="true"
              />
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}