import React from 'react';
import { Label } from './label';
import { Input } from './input';
import { UseFormRegister } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  error?: { message?: string };
  register: UseFormRegister<any>;
  type?: string;
  placeholder?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  register,
  type = 'text',
  ...props
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        {...register(name)}
        error={error?.message}
        {...props}
      />
    </div>
  );
};