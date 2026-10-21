import { useState } from 'react';
import { WEIGHT_GROUPS } from '../types/recipe';
import { formatWeight } from '../utils/formatting';
import { Label, inputClass } from './steps/fields';

/**
 * Pick a target dough weight from presets or type one in grams. `value` seeds the field.
 * The typed text is kept locally so it can be cleared and retyped; `onChange` gets the
 * rounded grams, or '' when the field isn't a number. `onPreset` fires after a preset click.
 */
export default function WeightPicker({ value, onChange, onPreset }) {
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState(value === undefined || value === null ? '' : String(value));
  const grams = Math.round(parseFloat(text));

  const choose = (preset) => {
    setActiveId(preset.id);
    setText(String(preset.grams));
    onChange(preset.grams);
    if (onPreset) onPreset(preset.grams);
  };

  const type = (next) => {
    setActiveId(null);
    setText(next);
    onChange(Math.round(parseFloat(next)) || '');
  };

  return (
    <div className="space-y-4">
      {WEIGHT_GROUPS.map((group) => (
        <fieldset key={group.id}>
          <legend className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">{group.label}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.presets.map((preset) => {
              const selected = preset.id === activeId && preset.grams === grams;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose(preset)}
                  className={`flex justify-between gap-3 text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                  }`}
                >
                  <span>{preset.label}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatWeight(preset.grams)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div>
        <Label htmlFor="dough-weight">Or enter a weight (grams)</Label>
        <input
          id="dough-weight"
          type="number"
          min="1"
          max="10000"
          placeholder="800"
          className={inputClass}
          value={text}
          onChange={(e) => type(e.target.value)}
        />
      </div>
    </div>
  );
}
