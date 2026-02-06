import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toBeDisabled();
  });

  it('should be disabled when loading prop is true', () => {
    render(<Button loading>Click me</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
  });

  it('should not trigger onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply primary variant by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('bg-primary-600');
  });

  it('should apply secondary variant', () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('bg-gray-200');
  });

  it('should apply danger variant', () => {
    render(<Button variant="danger">Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('bg-red-600');
  });

  it('should apply medium size by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('px-4', 'py-2');
  });

  it('should apply small size', () => {
    render(<Button size="sm">Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('px-3', 'py-1.5');
  });

  it('should apply large size', () => {
    render(<Button size="lg">Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('px-6', 'py-3');
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('custom-class');
  });
});
