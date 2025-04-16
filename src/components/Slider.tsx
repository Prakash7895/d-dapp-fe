'use client';

import RangeSlider, {
  ReactRangeSliderInputProps,
} from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import React, { FC, useEffect } from 'react';

interface SliderProps {
  label?: string;
  value: [number, number];
  min: number;
  max: number;
  step?: number;
  onChange: (value: [number, number]) => void;
  unit: string;
  className?: string;
  thumbs?: 1 | 2;
}

const Slider: FC<SliderProps> = ({
  label,
  max,
  min,
  onChange,
  step = 1,
  unit,
  value,
  className,
  thumbs = 1,
}) => {
  const id = `range-slider-dd-${thumbs}-${step}-${new Date().getTime()}`;
  let props: ReactRangeSliderInputProps = {};
  if (thumbs == 1) {
    props = {
      rangeSlideDisabled: true,
      thumbsDisabled: [true, false],
    };
    value[0] = min;
  }

  useEffect(() => {
    const slider = document.getElementById(id);

    const range = slider?.getElementsByClassName(
      'range-slider__range'
    )?.[0] as HTMLDivElement;

    const sliderThumbs = slider?.getElementsByClassName('range-slider__thumb');
    const lowerThumb = Array.from(sliderThumbs!).find((el) =>
      el.getAttribute('data-lower')
    ) as HTMLDivElement;

    if (slider && range) {
      range.style.background = '#D43EE1';
      Array.from(sliderThumbs!).map((el) => {
        (el as HTMLDivElement).style.background = '#CF29DE';
      });
      if (thumbs === 1 && lowerThumb) {
        range.style.borderRadius = '6px';
        lowerThumb.style.width = '0';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbs]);

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-300'>
          {label}
        </label>
      )}
      <div className='flex justify-between items-center'>
        <span className='text-sm text-gray-400'>
          {min}
          {unit}
        </span>
        <span className='text-sm text-gray-400'>
          {max}
          {unit}
        </span>
      </div>
      <RangeSlider
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={onChange}
        {...props}
      />
    </div>
  );
};

export default Slider;
