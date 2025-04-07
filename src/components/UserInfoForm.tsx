import React, { useState } from 'react';
import Input from './Input';
import Select from './Select';
import { GENDER, SEXUAL_ORIENTATION } from '@/apiSchemas';
import { capitalizeFirstLetter, isEmpty } from '@/utils';
import { toast } from 'react-toastify';
import { useStateContext } from './StateProvider';
import { UserFormData } from '@/types/user';

const genderOptions = GENDER.map((e) => ({
  label: capitalizeFirstLetter(e),
  value: e,
}));

const sexualOrientationOptions = SEXUAL_ORIENTATION.map((e) => ({
  label: capitalizeFirstLetter(e),
  value: e,
}));

const UserInfoForm = () => {
  const { setOnboardInfo, userAddress } = useStateContext();

  const [formData, setFormData] = useState<UserFormData>({
    age: '',
    firstName: '',
    gender: '',
    lastName: '',
    sexualOrientation: '',
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>();

  const handleOnChange = (key: keyof UserFormData, val: string | number) => {
    setFormData((p) => ({
      ...p,
      [key]: val,
    }));
  };

  const hasError = () =>
    Object.keys(formData).filter((key) =>
      isEmpty(formData[key as keyof UserFormData])
    ).length > 0;

  const onSubmit = () => {
    fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify({ ...formData, address: userAddress }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          toast.success(res.message);
          setOnboardInfo((p) => ({ ...p, userInfoSaved: res.data }));
        } else {
          throw new Error(res.massage);
        }
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to save user info');
      });
  };

  const minAge = 18;
  const maxAge = 100;

  return (
    <div>
      <div className='grid grid-cols-2 gap-y-4 gap-x-3 my-3'>
        <Input
          value={formData.firstName}
          onChange={(e) => handleOnChange('firstName', e.target.value)}
          placeholder='Enter FirstName'
          name='firstName'
        />
        <Input
          value={formData.lastName}
          onChange={(e) => handleOnChange('lastName', e.target.value)}
          placeholder='Enter LastName'
          name='lastName'
        />
        <Input
          value={formData.age}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');

            handleOnChange('age', value.length > 0 ? +value : value);
            if (value.length && +value < minAge) {
              setErrors({
                age: `Age must be greater than ${minAge}.`,
              });
              return;
            } else if (value.length && +value > maxAge) {
              setErrors({ age: `Age must be less than ${maxAge}.` });
              return;
            }
            setErrors((p) => ({ ...p, age: undefined }));
          }}
          placeholder='Enter Age'
          error={errors?.age as string}
          name='age'
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
        onClick={onSubmit}
        className='w-full disabled:opacity-45 rounded-md py-1 bg-[#cf29deb3] enabled:hover:bg-[#cf29de]'
      >
        Sign up
      </button>
    </div>
  );
};

export default UserInfoForm;
