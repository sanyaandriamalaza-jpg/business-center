import React, { useState, useEffect } from "react";
import ReactSlider from "react-slider";

type RangeSliderProps = {
  min?: number;
  max?: number;
  step?: number;
  minDistance?: number;
  initialValue?: [number, number];
  onValueChange: (values: [number, number]) => void;
};

export default function CRangeSlider({
  min = 0,
  max = 200,
  step = 1,
  minDistance = 30,
  initialValue = [0, 100],
  onValueChange,
}: RangeSliderProps) {
  const [values, setValues] = useState<[number, number]>(initialValue);

  useEffect(() => {
    onValueChange(values);
  }, [values, onValueChange]);

  return (
    <ReactSlider
      className="w-full h-2 rounded"
      thumbClassName="h-5 w-5 bg-indigo-600 rounded-full shadow-md -mt-1.5"
      value={values}
      min={min}
      max={max}
      step={step}
      ariaLabel={["Min value", "Max value"]}
      onChange={(newValues) => {
        if (Array.isArray(newValues)) {
          setValues(newValues as [number, number]);
        }
      }}
      pearling
      minDistance={minDistance}
      renderTrack={(props, state) => {
        const { key, ...rest } = props;
        const isActiveTrack = state.index === 1;
        return (
          <div
            key={key}
            {...rest}
            className={`h-2 rounded ${
              isActiveTrack ? "bg-cPrimaryHover/40" : "bg-gray-300"
            }`}
          />
        );
      }}
      renderThumb={(props, state) => {
        const { key, ...rest } = props;
        return (
          <div
            key={key}
            {...rest}
            className="relative flex flex-col items-center focus:outline-none focus:ring-0"
            tabIndex={0}
          >
            <div className="h-5 w-5 bg-cPrimary rounded-full shadow-md -mt-1.5" />
            <span className="text-sm font-medium text-cStandard mt-1 select-none">
              {state.valueNow}
            </span>
          </div>
        );
      }}
    />
  );
}
