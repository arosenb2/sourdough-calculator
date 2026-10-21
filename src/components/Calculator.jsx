import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import FlourDistribution from './FlourDistribution';
import BreadTypeStep from './steps/BreadTypeStep';
import LevainStep from './steps/LevainStep';
import ScaldSiftStep from './steps/ScaldSiftStep';
import MethodTempsStep from './steps/MethodTempsStep';
import InclusionsStep from './steps/InclusionsStep';
import BakeStep from './steps/BakeStep';
import BrotgewuerzStep from './steps/BrotgewuerzStep';
import WeightStep from './steps/WeightStep';
import {
  validateTotalWeight, validateHydration, validateFlours, validateSaltPercentage,
  validateLevain, validateSifting, validateScald, validateBassinage, validateTemps, validateMixing, validateBake, validateWaterBudget, validateSpice, flourBlendProblem,
} from '../utils/validations';
import { levainFlourContribution, waterBudget, waterBudgetMessage } from '../utils/calculations';
import { defaultRecipeName } from '../utils/formatting';
import { defaultWizardData, toFormula, wizardDataFromRecipe, wizardDataToRecipe } from '../utils/recipeDefaults';
import useRecipeStore from '../stores/recipeStore';

const FloursStep = ({ data, onChange }) => (
  <FlourDistribution
    flours={data.flours}
    onUpdate={(flours) => onChange({ flours })}
    levainFlour={levainFlourContribution(data.levain)}
  />
);

const steps = [
  {
    id: 'breadType',
    title: 'Bread Type',
    description: 'What kind of sourdough bread are you making?',
    component: BreadTypeStep,
  },
  {
    id: 'levain',
    title: 'Levain',
    description: 'How much levain, how is it fed, and with which flours?',
    component: LevainStep,
    validate: (data) => validateLevain(data.levain),
    errorMessage: 'Enter prefermented flour between 1% and 100%, a ratio above zero, and levain flours totaling 100%'
  },
  {
    id: 'flours',
    title: 'Flour Distribution',
    description: 'What share of all your flour is each type? The flour in your levain counts toward it.',
    component: FloursStep,
    validate: (data) => flourBlendProblem(data.flours, data.levain) === null,
    errorMessage: (data) => flourBlendProblem(data.flours, data.levain)
  },
  {
    id: 'hydration',
    title: 'Hydration',
    description: 'What is your target hydration percentage? This includes the water in your levain.',
    input: {
      type: 'number',
      label: 'Hydration percentage',
      placeholder: '75',
    },
    validate: (data) => validateHydration(data.hydration),
    errorMessage: 'Please enter a valid hydration between 50% and 200%'
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
  {
    id: 'scaldSift',
    title: 'Scald, Bassinage & Sifting',
    description: 'Is there a scald or bassinage, and are you sifting fresh-milled flour?',
    component: ScaldSiftStep,
    validate: (data) =>
      validateScald(data.scald) &&
      validateBassinage(data.bassinage) &&
      validateSifting(data.sifting) &&
      validateWaterBudget(waterBudget(data)),
    errorMessage: (data) =>
      waterBudgetMessage(waterBudget(data)) ||
      'The scald flour and bassinage must be above zero, and extraction must be 50–100%'
  },
  {
    id: 'methodTemps',
    title: 'Method, Mixing & Temperatures',
    description: 'How is the dough mixed and handled, and what water temperatures do you use?',
    component: MethodTempsStep,
    validate: (data) => validateTemps(data.temps) && validateMixing(data.mixing),
    errorMessage: 'Water temperatures must be between 32°F and 212°F, and fold counts must be whole numbers from 0 to 20'
  },
  {
    id: 'inclusions',
    title: 'Inclusions',
    description: 'Seeds (soaked or not), sweeteners, and anything else going into the dough.',
    component: InclusionsStep,
    validate: (data) => validateWaterBudget(waterBudget(data)),
    errorMessage: (data) => waterBudgetMessage(waterBudget(data))
  },
  {
    id: 'spice',
    title: 'Brotgewürz',
    description: 'A bread spice blend, mixed into the dough or used to coat the loaf.',
    component: BrotgewuerzStep,
    validate: (data) => validateSpice(data.spice),
    errorMessage: 'The blend needs a total between 0.1% and 10% of flour and at least one ingredient in the ratio'
  },
  {
    id: 'bake',
    title: 'Baking',
    description: 'Where are you baking, and what are the stages?',
    component: BakeStep,
    validate: (data) => validateBake(data.bake),
    errorMessage: 'Each stage needs a temperature between 200°F and 600°F and a time between 1 and 300 minutes'
  },
  {
    id: 'totalWeight',
    title: 'Target Dough Weight',
    description: 'How much dough do you want to make? Pick a preset or enter your own.',
    component: WeightStep,
    validate: (data) => validateTotalWeight(data.totalWeight),
    errorMessage: 'Please enter a valid weight between 1 and 10,000 grams'
  },
];

/**
 * The recipe wizard. With `editing` (a saved recipe) it opens pre-filled, drops the dough
 * weight step, lets you jump between steps, and saves changes back to that recipe.
 */
export default function Calculator({ editing = null }) {
  const navigate = useNavigate();
  const setRecipe = useRecipeStore((state) => state.setRecipe);
  const clearRecipe = useRecipeStore((state) => state.clearRecipe);
  const recipe = useRecipeStore((state) => state.recipe);
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);
  // A saved recipe has no dough weight, so editing skips that step
  const activeSteps = editing ? steps.filter((step) => step.id !== 'totalWeight') : steps;
  const [currentStep, setCurrentStep] = useState(0);
  const [recipeData, setRecipeData] = useState(() => (editing ? wizardDataFromRecipe(editing) : defaultWizardData()));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) clearRecipe();
  }, [clearRecipe, editing]);

  useEffect(() => {
    if (recipe && !editing) {
      navigate('/recipe');
    }
  }, [recipe, editing, navigate]);

  const handleInputChange = (value) => {
    setError('');

    // Round weight inputs using string comparison
    const newValue = activeSteps[currentStep].input?.type === 'number' &&
                    activeSteps[currentStep].id === 'totalWeight' ?
                    Math.round(parseFloat(value)) || '' : value;

    setRecipeData({
      ...recipeData,
      [activeSteps[currentStep].id]: newValue,
    });
  };

  const handlePatch = (patch) => {
    setError('');
    setRecipeData((data) => ({ ...data, ...patch }));
  };

  const handleCalculate = () => {
    setRecipe(wizardDataToRecipe(recipeData));
    // Remove navigation, let useEffect handle it
  };

  const stepProblem = (step) => {
    if (!step.validate || step.validate(recipeData)) return null;
    return typeof step.errorMessage === 'function' ? step.errorMessage(recipeData) : step.errorMessage;
  };

  // Every step has to be valid before changes can be saved; jump to the first one that isn't
  const firstInvalidStep = () => activeSteps.findIndex((step) => stepProblem(step));

  const handleSaveChanges = () => {
    const invalid = firstInvalidStep();
    if (invalid !== -1) {
      setCurrentStep(invalid);
      setError(stepProblem(activeSteps[invalid]));
      return;
    }
    updateRecipe(editing.id, toFormula(wizardDataToRecipe(recipeData)));
    navigate('/saved', { state: { expandedId: editing.id } });
  };

  const nextStep = () => {
    const currentStepData = activeSteps[currentStep];

    if (currentStepData.validate && !currentStepData.validate(recipeData)) {
      setError(
        typeof currentStepData.errorMessage === 'function'
          ? currentStepData.errorMessage(recipeData)
          : currentStepData.errorMessage
      );
      return;
    }

    if (currentStep < activeSteps.length - 1) {
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
    const currentStepData = activeSteps[currentStep];
    if (!currentStepData.validate) return true;

    return currentStepData.validate(recipeData);
  };

  const isLastStep = currentStep === activeSteps.length - 1;
  const currentStepData = activeSteps[currentStep];

  const handleComplete = (recipeData) => {
    setRecipe(recipeData);
    navigate('/recipe');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {editing && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700 dark:text-gray-300">
            Editing <span className="font-semibold">{editing.name || defaultRecipeName(editing)}</span>
          </p>
          <Link to="/saved" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
            Cancel
          </Link>
        </div>
      )}
      <StepIndicator
        steps={activeSteps}
        currentStep={currentStep}
        onSelect={editing ? setCurrentStep : undefined}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">{currentStepData.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentStepData.description}</p>

        <div className="mb-6">
          {currentStepData.component ? (
            <currentStepData.component data={recipeData} onChange={handlePatch} />
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
          {currentStep > 0 && (
            <button
              onClick={previousStep}
              className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Previous
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            {editing && (
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Save changes
              </button>
            )}
            {!(editing && isLastStep) && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
