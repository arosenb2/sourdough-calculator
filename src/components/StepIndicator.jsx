import { CheckIcon } from '@heroicons/react/24/solid';

// A check means the step is done: only steps before the current one get it. The current step
// shows a solid dot, and steps still to come are empty.
function StepDot({ index, currentStep }) {
  const done = index < currentStep;
  const current = index === currentStep;

  return (
    <div
      className={`relative flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full
        transition-colors duration-200
        ${done || current ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      {done && <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" aria-hidden="true" />}
      {current && <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white" aria-hidden="true" />}
    </div>
  );
}

export default function StepIndicator({ steps, currentStep, onSelect }) {
  return (
    <nav aria-label="Progress" className="mb-8 relative">
      {/* Progress line */}
      <div className="absolute top-3 sm:top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
      <div
        className="absolute top-3 sm:top-4 left-0 h-0.5 bg-indigo-600 transition-all duration-500 ease-in-out"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      {/* Step indicators */}
      <ol className="relative flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-label={`Go to ${step.title}`}
                aria-current={index === currentStep ? 'step' : undefined}
                title={step.title}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <StepDot index={index} currentStep={currentStep} />
              </button>
            ) : (
              <StepDot index={index} currentStep={currentStep} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
