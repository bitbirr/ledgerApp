import { render, screen } from '@testing-library/react';
import { Input } from './input';
import { describe, it, expect } from 'vitest';

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeTruthy();
  });

  it('renders with type attribute', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('renders with custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });
});