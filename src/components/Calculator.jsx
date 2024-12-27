import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import FlourDistribution from './FlourDistribution';
import { validateTotalWeight, validateHydration, validateFlours, validateSaltPercentage } from '../utils/validations';
import useRecipeStore from '../stores/recipeStore';

const steps = [
  {
    id: 'totalWeight',
    title: 'Total Dough Weight',
    description: 'What is your target total dough weight?',
    input: {
      type: 'number',
      label: 'Total dough weight (grams)',
      placeholder: '800',
    },
    validate: (data) => validateTotalWeight(data.totalWeight),
    errorMessage: 'Please enter a valid weight between 1 and 10,000 grams'
  },
  {
    id: 'flours',
    title: 'Flour Distribution',
    description: 'How would you like to distribute your flour types?',
    component: FlourDistribution,
    validate: (data) => validateFlours(data.flours),
    errorMessage: 'Please ensure flour percentages total 100%'
  },
  {
    id: 'hydration',
    title: 'Hydration',
    description: 'What is your target hydration percentage?',
    input: {
      type: 'number',
      label: 'Hydration percentage',
      placeholder: '75',
    },
    validate: (data) => validateHydration(data.hydration),
    errorMessage: 'Please enter a valid hydration between 50% and 100%'
  },
  {
    id: 'salt',
    title: 'Salt',
    description: 'What percentage of salt would you like to use? (1.5% - 3%)',
    input: {
      type: 'number',
      label: 'Salt percentage',
      placeholder: '2',
    },
    validate: (data) => validateSaltPercentage(data.salt),
    errorMessage: 'Please enter a valid salt percentage between 1.5% and 3%'
  },
];

export default function Calculator() {
  const navigate = useNavigate();
  const setRecipe = useRecipeStore((state) => state.setRecipe);
  const clearRecipe = useRecipeStore((state) => state.clearRecipe);
  const recipe = useRecipeStore((state) => state.recipe);
  const [currentStep, setCurrentStep] = useState(0);
  const [recipeData, setRecipeData] = useState({
    totalWeight: '',
    flours: [{ type: 'BF', percentage: 100 }],
    hydration: '',
    salt: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    clearRecipe();
  }, [clearRecipe]);

  useEffect(() => {
    if (recipe) {
      navigate('/recipe');
    }
  }, [recipe, navigate]);

  const handleInputChange = (value) => {
    setError('');

    // Handle flour array separately from number inputs
    if (steps[currentStep].id === 'flours') {
      setRecipeData({
        ...recipeData,
        flours: value
      });
      return;
    }

    // Round weight inputs using string comparison
    const newValue = steps[currentStep].input?.type === 'number' &&
                    steps[currentStep].id === 'totalWeight' ?
                    Math.round(parseFloat(value)) || '' : value;

    setRecipeData({
      ...recipeData,
      [steps[currentStep].id]: newValue,
    });
  };

  const handleCalculate = () => {
    const calculatedRecipe = {
      total: parseFloat(recipeData.totalWeight),
      hydration: parseFloat(recipeData.hydration),
      saltPercentage: parseFloat(recipeData.salt),
      flours: recipeData.flours
    };

    setRecipe(calculatedRecipe);
    // Remove navigation, let useEffect handle it
  };

  const nextStep = () => {
    const currentStepData = steps[currentStep];

    if (currentStepData.validate && !currentStepData.validate(recipeData)) {
      setError(currentStepData.errorMessage);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      handleCalculate();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData.validate) return true;

    return currentStepData.validate(recipeData);
  };

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleComplete = (recipeData) => {
    setRecipe(recipeData);
    navigate('/recipe');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">{currentStepData.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentStepData.description}</p>

        <div className="mb-6">
          {currentStepData.component ? (
            <currentStepData.component
              flours={recipeData.flours}
              onUpdate={(flours) => handleInputChange(flours)}
            />
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {currentStepData.input.label}
              </label>
              <input
                type={currentStepData.input.type}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder={currentStepData.input.placeholder}
                value={recipeData[currentStepData.id]}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </>
          )}
          {error && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={previousStep}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              !canProceed()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLastStep ? 'Calculate' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}