'use client';

import React, { useState, ReactNode } from 'react';
import { useStateContext } from './StateProvider';
import { toast } from 'react-toastify';
import { updateUserInfo } from '@/apiCalls';
import {
  GENDER,
  GENDER_PREFERENCES,
  SEXUAL_ORIENTATION,
  userUpdateSchema,
  UserUpdateSchemaType,
} from '@/apiSchemas';
import { Pencil, X, MapPin } from 'lucide-react';
import Loader from './Loader';
import Button from './Button';
import {
  capitalizeEveryFirstChar,
  genderOptions,
  sexualOrientationOptions,
} from '@/utils';
import MultiSelect from './MultiSelect';
import Slider from './Slider';
import { IForm } from '@/types/user';

interface EditableFieldProps {
  label: string;
  value: string | number | string[] | [number, number];
  isEditing: boolean;
  onChange: (value: string | number | string[] | [number, number]) => void;
  type?:
    | 'text'
    | 'number'
    | 'select'
    | 'textarea'
    | 'multi-select'
    | 'slider'
    | 'email';
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
  unit?: string;
  thumbs?: 1 | 2;
  error?: string;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  options,
  placeholder,
  min,
  max,
  required = false,
  className,
  step = 5,
  unit,
  thumbs = 1,
  error,
  autoComplete,
}) => {
  if (!isEditing) {
    return (
      <div className={className}>
        <label className='block text-sm font-medium text-gray-300 mb-1'>
          {label}
        </label>
        <div
          className={`px-4 py-2 overflow-auto bg-gray-800 border border-gray-700 rounded-md text-white flex ${
            type === 'textarea' ? 'min-h-[105px]' : 'min-h-[42px] items-center'
          }`}
        >
          {value || (
            <span className='text-gray-500'>
              {placeholder || `No ${label.toLowerCase()} set`}
            </span>
          )}
        </div>
      </div>
    );
  }

  const errClassName = error ? 'border border-red-500' : '';

  return (
    <div className={className}>
      <label className='block text-sm font-medium text-gray-300 mb-1'>
        {label}
      </label>
      {type === 'select' && options ? (
        <select
          value={value?.toString() || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errClassName}`}
          required={required}
        >
          <option value=''>Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value?.toString() || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errClassName}`}
          placeholder={placeholder}
          required={required}
        />
      ) : type === 'multi-select' ? (
        <MultiSelect
          options={options?.map((el) => el.label) ?? []}
          selectedValues={(value || []) as string[]}
          onChange={(values) => onChange(values)}
          placeholder={placeholder}
          hasError={!!error}
        />
      ) : type === 'slider' ? (
        <Slider
          value={value as [number, number]}
          min={min!}
          max={max!}
          step={step}
          onChange={onChange}
          unit={unit!}
          thumbs={thumbs}
        />
      ) : (
        <input
          type={type}
          value={value?.toString() || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errClassName} `}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          autoComplete={autoComplete}
        />
      )}
      <small className='text-red-500 block h-4'>{error}</small>
    </div>
  );
};

const interestOptions = [
  'Art',
  'Cooking',
  'Dancing',
  'Fashion',
  'Fitness',
  'Food',
  'Gaming',
  'Hiking',
  'Movies',
  'Music',
  'Pets',
  'Photography',
  'Reading',
  'Sports',
  'Technology',
  'Travel',
  'Writing',
  'Yoga',
];

const UserInfo: React.FC = () => {
  const { userInfo, setUserInfo } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const initialData = {
    age: userInfo?.profile?.age ?? 0,
    bio: userInfo?.profile?.bio ?? '',
    city: userInfo?.profile?.city ?? '',
    country: userInfo?.profile?.country ?? '',
    // email: userInfo?.email ?? '',
    firstName: userInfo?.profile?.firstName ?? '',
    lastName: userInfo?.profile?.lastName ?? '',
    gender: userInfo?.profile?.gender || GENDER[0],
    genderPreference:
      userInfo?.profile?.genderPreference || GENDER_PREFERENCES.MALE,
    interests: userInfo?.profile?.interests || [],
    maxAge: userInfo?.profile?.maxAge ?? 30,
    minAge: userInfo?.profile?.minAge ?? 20,
    maxDistance: userInfo?.profile?.maxDistance ?? 80,
    sexualOrientation:
      userInfo?.profile?.sexualOrientation || SEXUAL_ORIENTATION[0],
  };
  const [formData, setFormData] = useState<IForm>(initialData);
  const [errors, setErrors] = useState<{ [key in keyof IForm]?: string }>({});

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(initialData!);
  };

  const handleFieldChange = (
    field: keyof IForm,
    value: string | number | string[] | [number, number]
  ) => {
    const fieldSchema = userUpdateSchema.pick({ [field]: true } as {
      [K in keyof UserUpdateSchemaType]: true;
    });
    const fieldValidationResult = fieldSchema.safeParse({ [field]: value });

    if (!fieldValidationResult.success) {
      setErrors((p) => ({
        ...p,
        [field]: fieldValidationResult.error.issues?.[0]?.message,
      }));
    } else {
      setErrors((p) => {
        const updatedErr = { ...p };
        delete updatedErr[field];

        return updatedErr;
      });
    }

    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSave = async () => {
    if (!userInfo) return;

    const validationResult = userUpdateSchema.safeParse(formData);

    if (!validationResult.success) {
      const err = validationResult.error.issues.reduce<{
        [key in keyof IForm]?: string;
      }>((acc, val) => {
        const key = val.path[0] as keyof IForm;
        if (typeof key === 'string') {
          acc[key] = val.message;
        }
        return acc;
      }, {});

      setErrors(err);
      return;
    }

    setLoading(true);
    updateUserInfo(formData)
      .then((res) => {
        if (res?.status === 'success') {
          setUserInfo(res.data!);
          toast.success('Profile updated successfully!');
        } else {
          toast.error(
            res?.message ?? 'Failed to update profile. Please try again.'
          );
        }
      })
      .catch((err) => {
        console.log('Error updating profile:', err);
        toast.error('Failed to update profile. Please try again.');
      })
      .finally(() => {
        setIsEditing(false);
        setLoading(false);
      });
  };

  if (!userInfo) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader />
        <span className='ml-4 text-white'>Loading user information...</span>
      </div>
    );
  }

  const fieldsArray: Partial<
    EditableFieldProps & { value: string; content: ReactNode }
  >[] = [
    {
      label: 'First Name',
      value: 'firstName',
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Last Name',
      value: 'lastName',
      className: 'col-span-2 md:col-span-1',
    },
    // {
    //   label: 'Email',
    //   value: 'email',
    //   className: 'col-span-2',
    //   type: 'email',
    //   autoComplete: 'email',
    // },
    {
      label: 'Age',
      value: 'age',
      type: 'number',
      min: 18,
      max: 99,
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Gender',
      value: 'gender',
      type: 'select',
      options: genderOptions,
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Sexual Orientation',
      value: 'sexualOrientation',
      type: 'select',
      options: sexualOrientationOptions,
      className: 'col-span-2',
    },
    {
      label: 'Bio',
      value: 'bio',
      type: 'textarea',
      placeholder: 'Tell us about yourself...',
      className: 'col-span-2',
    },
    {
      label: 'Interests',
      value: 'interests',
      placeholder: 'No interests set',
      options: interestOptions.map((el) => ({ label: el, value: el })),
      type: 'multi-select',
      className: 'col-span-2',
    },
    {
      label: '',
      content: (
        <div
          key='location-header'
          className='flex items-center justify-between col-span-2'
        >
          <div className='flex items-center'>
            <label className='text-xl font-semibold'>Location</label>
            <MapPin className='h-4 w-4 scale-125 ml-1' />
          </div>
        </div>
      ),
      value: 'header',
    },
    {
      label: 'City',
      value: 'city',
    },
    {
      label: 'Country',
      value: 'country',
    },
    {
      label: '',
      content: (
        <h3
          key='preference-header'
          className='text-xl font-semibold col-span-2'
        >
          Matching Preferences
        </h3>
      ),
      value: 'header',
    },
    {
      label: 'Maximum Distance',
      value: 'maxDistance',
      step: 5,
      min: 0,
      max: 1000,
      unit: ' km',
      type: 'slider',
    },
    {
      label: 'Gender Preference',
      value: 'genderPreference',
      type: 'select',
      options: [
        { value: GENDER_PREFERENCES.ALL, label: 'Everyone' },
        { value: GENDER_PREFERENCES.MALE, label: 'Men' },
        { value: GENDER_PREFERENCES.FEMALE, label: 'Women' },
      ],
    },
    {
      label: 'Age Range',
      value: 'ageRange',
      step: 1,
      min: 18,
      max: 50,
      type: 'slider',
      thumbs: 2,
      className: 'col-span-2',
    },
  ];

  return (
    <div className='bg-gray-900 p-8 rounded-lg shadow-xl w-full mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-white'>Profile Settings</h2>
        <div className='flex space-x-2'>
          <Button
            isLoading={loading}
            disabled={loading}
            onClick={isEditing ? handleSave : handleEdit}
            className='flex items-center justify-center'
          >
            {!isEditing ? (
              <>
                <Pencil size={16} />
                <span>Edit Profile</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </Button>
          {isEditing && (
            <Button
              disabled={loading}
              onClick={handleCancel}
              buttonType='secondary'
              className='flex items-center justify-center'
            >
              <X size={16} />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {fieldsArray.map((el) =>
          el.value === 'header' ? (
            el.content
          ) : (
            <EditableField
              key={el.value}
              label={el.label!}
              value={
                isEditing
                  ? el.value === 'maxDistance'
                    ? [0, +formData.maxDistance]
                    : el.value === 'ageRange'
                    ? [formData.minAge, +formData.maxAge]
                    : formData[el.value as keyof IForm]
                  : typeof formData[el.value as keyof IForm] === 'string' &&
                    el.value !== 'email'
                  ? capitalizeEveryFirstChar(
                      formData[el.value as keyof IForm] as string
                    )
                  : el.value === 'maxDistance'
                  ? `${formData[el.value as keyof IForm]} km`
                  : el.value === 'ageRange'
                  ? `${formData.minAge} - ${+formData.maxAge}`
                  : el.value === 'interests'
                  ? (formData[el.value as keyof IForm] as string[]).join(', ')
                  : formData[el.value as keyof IForm]
              }
              isEditing={isEditing}
              onChange={(value) => {
                if (el.value === 'ageRange') {
                  const [min, max] = value as [number, number];
                  handleFieldChange('minAge', min);
                  handleFieldChange('maxAge', max);
                  return;
                }
                if (el.value === 'maxDistance') {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const [min, max] = value as [number, number];
                  handleFieldChange('maxDistance', max);
                  return;
                }
                if (el.type === 'number') {
                  handleFieldChange(el.value! as keyof IForm, +value);
                  return;
                }
                handleFieldChange(el.value! as keyof IForm, value);
              }}
              max={el.max}
              min={el.min}
              className={el.className}
              options={el.options}
              placeholder={el.placeholder}
              step={el.step}
              thumbs={el.thumbs}
              type={el.type}
              unit={el.unit}
              error={errors[el.value as keyof IForm]}
              autoComplete={el.autoComplete}
            />
          )
        )}
      </div>
    </div>
  );
};

export default UserInfo;
