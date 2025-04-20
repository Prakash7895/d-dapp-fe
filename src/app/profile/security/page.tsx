'use client';
import React, { useState } from 'react';
import { passwordSchema } from '@/apiSchemas';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Eye, EyeOff, Check, X, Mail } from 'lucide-react';
import { addEmail, updateUserPassword } from '@/apiCalls';
import { toast } from 'react-toastify';
import { useStateContext } from '@/components/StateProvider';

const Security = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { userInfo, setUserInfo } = useStateContext();

  const validatePassword = (pass: string) =>
    passwordSchema.safeParse(pass).success;

  const getPasswordValidation = (pass: string) => {
    return {
      hasMinLength: pass.length >= 8,
      hasUpperCase: /[A-Z]/.test(pass),
      hasLowerCase: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecialChar: /[^A-Za-z0-9]/.test(pass),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!validatePassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    updateUserPassword({
      pasword: formData.password,
      confirmPassword: formData.confirmPassword,
    })
      .then((res) => {
        if (res?.status === 'success') {
          toast.success('Password updated successfully!');
          setFormData({ confirmPassword: '', password: '', email: '' });
        } else {
          toast.error(res?.message ?? 'Failed to update user.');
        }
      })
      .catch((err) => {
        console.error('Error updating password:', err);
        toast.error('Failed to update password. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const passwordValidation = getPasswordValidation(formData.password);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await addEmail(formData);
      if (res?.status === 'success') {
        toast.success('Email added successfully!');
        setUserInfo((prev) => ({ ...prev!, email: formData.email }));
        setFormData({ confirmPassword: '', password: '', email: '' });
      }
    } catch (error) {
      console.error('Error adding email:', error);
      toast.error('Failed to add email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-gray-900 p-8 rounded-lg shadow-xl w-full mx-auto max-w-md'>
      {userInfo?.email ? (
        <h2 className='text-2xl font-bold mb-6 text-white'>Update Password</h2>
      ) : (
        <div className='flex items-center gap-3 mb-6'>
          <Mail className='text-primary-500 w-6 h-6' />
          <h2 className='text-2xl font-bold text-white'>Add Email Address</h2>
        </div>
      )}
      <form
        onSubmit={!userInfo?.email ? handleEmailSubmit : handleSubmit}
        className='space-y-4'
      >
        {!userInfo?.email && (
          <>
            <div className='mb-4 p-3 bg-gray-800 rounded-lg'>
              <p className='text-sm text-gray-300'>
                Adding an email address allows you to:
              </p>
              <ul className='mt-2 space-y-1 text-sm text-gray-400'>
                <li className='flex items-center gap-2'>
                  <Check size={14} />
                  Sign in without a wallet
                </li>
                <li className='flex items-center gap-2'>
                  <Check size={14} />
                  Recover your account if needed
                </li>
                <li className='flex items-center gap-2'>
                  <Check size={14} />
                  Receive important notifications
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <Input
                label='Email Address'
                type='email'
                name='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder='Enter your email address'
              />
            </div>
          </>
        )}

        <div>
          <Input
            label='New Password'
            name='password'
            value={formData.password}
            onChange={(e) => {
              setFormData((p) => ({ ...p, password: e.target.value }));
            }}
            placeholder='Enter password here'
            type={showPassword ? 'text' : 'password'}
            rightContent={
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-gray-400 hover:text-white'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          <div className='mt-2 space-y-1 text-sm'>
            <div className='flex items-center gap-2'>
              {passwordValidation.hasMinLength ? (
                <Check className='text-green-500' size={16} />
              ) : (
                <X className='text-red-500' size={16} />
              )}
              <span
                className={
                  passwordValidation.hasMinLength
                    ? 'text-green-500'
                    : 'text-gray-400'
                }
              >
                At least 8 characters
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {passwordValidation.hasUpperCase ? (
                <Check className='text-green-500' size={16} />
              ) : (
                <X className='text-red-500' size={16} />
              )}
              <span
                className={
                  passwordValidation.hasUpperCase
                    ? 'text-green-500'
                    : 'text-gray-400'
                }
              >
                At least one uppercase letter
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {passwordValidation.hasLowerCase ? (
                <Check className='text-green-500' size={16} />
              ) : (
                <X className='text-red-500' size={16} />
              )}
              <span
                className={
                  passwordValidation.hasLowerCase
                    ? 'text-green-500'
                    : 'text-gray-400'
                }
              >
                At least one lowercase letter
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {passwordValidation.hasNumber ? (
                <Check className='text-green-500' size={16} />
              ) : (
                <X className='text-red-500' size={16} />
              )}
              <span
                className={
                  passwordValidation.hasNumber
                    ? 'text-green-500'
                    : 'text-gray-400'
                }
              >
                At least one number
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {passwordValidation.hasSpecialChar ? (
                <Check className='text-green-500' size={16} />
              ) : (
                <X className='text-red-500' size={16} />
              )}
              <span
                className={
                  passwordValidation.hasSpecialChar
                    ? 'text-green-500'
                    : 'text-gray-400'
                }
              >
                At least one special character
              </span>
            </div>
          </div>
        </div>

        <div>
          <Input
            label='Confirm New Password'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData((p) => ({ ...p, confirmPassword: e.target.value }));
            }}
            type={showConfirmPassword ? 'text' : 'password'}
            rightContent={
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='text-gray-400 hover:text-white'
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            placeholder='Confirm password'
          />

          {errors.confirmPassword && (
            <p className='h-4 text-sm text-red-500'>{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          isLoading={loading}
          label={userInfo?.email ? 'Update Password' : 'Add Email'}
          loadingLabel={userInfo?.email ? 'Updating...' : 'Adding...'}
          disabled={
            (userInfo?.email
              ? false
              : !formData.email || !validateEmail(formData.email)) ||
            !(
              passwordValidation.hasLowerCase &&
              passwordValidation.hasMinLength &&
              passwordValidation.hasNumber &&
              passwordValidation.hasSpecialChar &&
              passwordValidation.hasUpperCase
            ) ||
            formData.password !== formData.confirmPassword ||
            loading
          }
          type='submit'
        />
      </form>
    </div>
  );
};

export default Security;
