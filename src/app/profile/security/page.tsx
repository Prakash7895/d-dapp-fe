'use client';
import React, { useState } from 'react';
import { passwordSchema } from '@/apiSchemas';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { updateUserInfo } from '@/apiCalls';
import { toast } from 'react-toastify';

const Security = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    updateUserInfo(formData)
      .then((res) => {
        if (res) {
          toast.success('Password updated successfully!');
          setFormData({ confirmPassword: '', password: '' });
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

  return (
    <div className='bg-gray-900 p-8 rounded-lg shadow-xl w-full mx-auto max-w-md'>
      <h2 className='text-2xl font-bold mb-6 text-white'>Update Password</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Input
            label='New Password'
            name='password'
            value={formData.password}
            onChange={(e) => {
              setFormData((p) => ({ ...p, password: e.target.value }));
            }}
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
          />

          {errors.confirmPassword && (
            <p className='h-4 text-sm text-red-500'>{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          isLoading={loading}
          label='Update Password'
          loadingLabel='Updating...'
          disabled={
            !(
              passwordValidation.hasLowerCase &&
              passwordValidation.hasMinLength &&
              passwordValidation.hasNumber &&
              passwordValidation.hasSpecialChar &&
              passwordValidation.hasUpperCase
            ) || loading
          }
          type='submit'
        />
      </form>
    </div>
  );
};

export default Security;
