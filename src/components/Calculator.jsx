import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import FlourDistribution from './FlourDistribution';
import { calculateRecipeFromTotalWeight } from '../utils/calculations';
import { validateSaltPercentage } from '../utils/validations';
import { FLOUR_TYPES } from '../types/recipe';
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
  },
  {
    id: 'flours',
    title: 'Flour Distribution',
    description: 'How would you like to distribute your flour types?',
    component: FlourDistribution,
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
    validate: validateSaltPercentage,
  },
];

export default function Calculator() {
  const navigate = useNavigate();
  const setRecipe = useRecipeStore((state) => state.setRecipe);
  const [currentStep, setCurrentStep] = useState(0);
  const [recipeData, setRecipeData] = useState({
    totalWeight: '',
    flours: [{ type: FLOUR_TYPES.BREAD, percentage: 100 }],
    hydration: '',
    salt: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (value) => {
    setError('');
    setRecipeData({
      ...recipeData,
      [steps[currentStep].id]: value,
    });
  };

  const handleCalculate = () => {
    const calculatedRecipe = calculateRecipeFromTotalWeight(recipeData);
    setRecipe({ ...calculatedRecipe, flours: recipeData.flours });
    navigate('/recipe/new');
  };

  const nextStep = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.validate) {
      if (!currentStepData.validate(recipeData[currentStepData.id])) {
        setError('Please enter a value between 1.5% and 3%');
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCalculate();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

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

        <div className="flex justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md ${
              currentStep === 0
                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={!recipeData[currentStepData.id]}
            className={`px-4 py-2 rounded-md ${
              !recipeData[currentStepData.id]
                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
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