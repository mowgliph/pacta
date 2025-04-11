import React from 'react';
import { Label } from './label';
import { Input } from './input';

export const FormField = ({ 
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
        className={error ? 'border-red-500' : ''}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error.message}</p>
      )}
    </div>
  );
};