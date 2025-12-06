import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const QuantitySelector = ({ value, onChange, min = 1, max = 99, disabled = false }: QuantitySelectorProps) => {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-brand-dark">Quantity</label>
      <div className="flex items-center rounded-xl border border-brand/20 bg-white">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || value <= min}
          className="rounded-l-xl p-2 text-brand-dark transition hover:bg-brand-light/20 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = Math.max(min, Math.min(max, Number(e.target.value) || min));
            onChange(newValue);
          }}
          min={min}
          max={max}
          disabled={disabled}
          className="w-16 border-0 bg-transparent px-2 py-2 text-center text-sm font-semibold text-brand-dark focus:outline-none disabled:opacity-40"
        />
        <button
          type="button"
          onClick={increment}
          disabled={disabled || value >= max}
          className="rounded-r-xl p-2 text-brand-dark transition hover:bg-brand-light/20 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

