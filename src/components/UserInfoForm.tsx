import React, { useState } from 'react';
import Input from './Input';
import Select from './Select';
import { GENDER, SEXUAL_ORIENTATION } from '@/apiSchemas';
import { capitalizeFirstLetter, isEmpty } from '@/utils';

interface FormDataProps {
  firstName: string;
  lastName: string;
  age: number | string;
  gender: string;
  sexualOrientation: string;
}

const genderOptions = GENDER.map((e) => ({
  label: capitalizeFirstLetter(e),
  value: e,
}));

const sexualOrientationOptions = SEXUAL_ORIENTATION.map((e) => ({
  label: capitalizeFirstLetter(e),
  value: e,
}));

const UserInfoForm = () => {
  const [formData, setFormData] = useState<FormDataProps>({
    age: '',
    firstName: '',
    gender: '',
    lastName: '',
    sexualOrientation: '',
  });

  const handleOnChange = (key: keyof FormDataProps, val: string | number) => {
    setFormData((p) => ({
      ...p,
      [key]: val,
    }));
  };

  const hasError = () =>
    Object.keys(formData).filter((key) =>
      isEmpty(formData[key as keyof FormDataProps])
    ).length > 0;

  return (
    <div>
      <div className='grid grid-cols-2 gap-3 my-3'>
        <Input
          value={formData.firstName}
          onChange={(e) => handleOnChange('firstName', e.target.value)}
          placeholder='Enter FirstName'
        />
        <Input
          value={formData.lastName}
          onChange={(e) => handleOnChange('lastName', e.target.value)}
          placeholder='Enter LastName'
        />
        <Input
          value={formData.age}
          onChange={(e) => handleOnChange('age', e.target.value)}
          placeholder='Enter Age'
        />
        <Select
          options={genderOptions}
          value={formData.gender}
          onChange={(e) => handleOnChange('gender', e.target.value)}
          placeholder='Select Gender'
        />
        <Select
          options={sexualOrientationOptions}
          value={formData.sexualOrientation}
          onChange={(e) => handleOnChange('sexualOrientation', e.target.value)}
          placeholder='Select Sexual Orientation'
        />
      </div>
      <button
        disabled={hasError()}
        className='w-full disabled:opacity-45 rounded-md py-1 bg-[#cf29deb3] enabled:hover:bg-[#cf29de]'
      >
        Sign up
      </button>
    </div>
  );
};

export default UserInfoForm;
