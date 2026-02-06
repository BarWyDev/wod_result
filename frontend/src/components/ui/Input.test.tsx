import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('should render input field', () => {
    render(<Input name="test" />);
    const input = screen.getByRole('textbox');

    expect(input).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input name="test" label="Test Label" />);

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('should render error message', () => {
    render(<Input name="test" error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error styling when error is present', () => {
    render(<Input name="test" error="Error message" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('border-red-500');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(<Input name="test" />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should apply custom className', () => {
    render(<Input name="test" className="custom-input" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('custom-input');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input name="test" disabled />);
    const input = screen.getByRole('textbox');

    expect(input).toBeDisabled();
  });

  it('should use provided id', () => {
    render(<Input id="custom-id" name="test" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('should use name as id if id is not provided', () => {
    render(<Input name="test-name" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('id', 'test-name');
  });

  it('should have aria-invalid when error is present', () => {
    render(<Input name="test" error="Error message" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
