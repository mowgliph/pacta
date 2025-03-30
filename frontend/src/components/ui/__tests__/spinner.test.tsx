import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner, FullPageSpinner } from '../spinner';

describe('Spinner Component', () => {
  it('renders the spinner with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('applies custom size class when size prop is provided', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });

  it('applies custom variant class when variant prop is provided', () => {
    render(<Spinner variant="secondary" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-secondary');
  });
});

describe('FullPageSpinner Component', () => {
  it('renders the fullpage spinner with default message', () => {
    render(<FullPageSpinner />);
    const spinner = screen.getByRole('status');
    const message = screen.getByText('Cargando...');
    
    expect(spinner).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it('renders the fullpage spinner with custom message', () => {
    render(<FullPageSpinner message="Procesando datos..." />);
    const message = screen.getByText('Procesando datos...');
    
    expect(message).toBeInTheDocument();
  });

  it('applies large size by default', () => {
    render(<FullPageSpinner />);
    const spinner = screen.getByRole('status');
    
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });
}); 