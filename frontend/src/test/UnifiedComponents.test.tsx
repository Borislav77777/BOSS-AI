/**
 * Тесты для унифицированных компонентов
 * Проверяет работу UnifiedButton и UnifiedSlider
 */

import { UnifiedButton, UnifiedSlider } from '@/components/common';
import { fireEvent, render, screen } from '@testing-library/react';

describe('UnifiedButton', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('renders basic button correctly', () => {
        render(<UnifiedButton>Test Button</UnifiedButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
        const { rerender } = render(<UnifiedButton variant="primary">Primary</UnifiedButton>);
        expect(screen.getByRole('button')).toHaveClass('platform-button-primary');

        rerender(<UnifiedButton variant="secondary">Secondary</UnifiedButton>);
        expect(screen.getByRole('button')).toHaveClass('platform-button-secondary');

        rerender(<UnifiedButton variant="glass">Glass</UnifiedButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<UnifiedButton size="sm">Small</UnifiedButton>);
        expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

        rerender(<UnifiedButton size="lg">Large</UnifiedButton>);
        expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('shows loading state', () => {
        render(<UnifiedButton loading>Loading</UnifiedButton>);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByRole('button')).toHaveClass('platform-button-loading');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<UnifiedButton onClick={handleClick}>Click me</UnifiedButton>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<UnifiedButton disabled>Disabled</UnifiedButton>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});

describe('UnifiedSlider', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('renders basic slider correctly', () => {
        const mockOnChange = jest.fn();
        render(<UnifiedSlider value={50} onChange={mockOnChange} />);
        expect(screen.getAllByRole('slider')[0]).toBeInTheDocument();
        expect(screen.getByRole('slider')).toHaveValue('50');
    });

    it('renders with different variants', () => {
        const mockOnChange = jest.fn();
        const { rerender } = render(
            <UnifiedSlider variant="default" value={50} onChange={mockOnChange} />
        );
        expect(screen.getAllByRole('slider')[0]).toHaveClass('platform-slider');

        rerender(<UnifiedSlider variant="rainbow" value={50} onChange={mockOnChange} />);
        expect(screen.getAllByRole('slider')[0]).toHaveClass('rainbow-slider');

        rerender(<UnifiedSlider variant="fontSize" value={2} onChange={mockOnChange} />);
        expect(screen.getAllByRole('slider')[0]).toHaveClass('font-size-slider');
    });

    it('renders with different sizes', () => {
        const mockOnChange = jest.fn();
        const { rerender } = render(
            <UnifiedSlider size="sm" value={50} onChange={mockOnChange} />
        );
        expect(screen.getAllByRole('slider')[0]).toHaveClass('h-1');

        rerender(<UnifiedSlider size="lg" value={50} onChange={mockOnChange} />);
        expect(screen.getAllByRole('slider')[0]).toHaveClass('h-3');
    });

    it('shows value when showValue is true', () => {
        const mockOnChange = jest.fn();
        render(<UnifiedSlider value={75} onChange={mockOnChange} showValue />);
        expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('shows labels when provided', () => {
        const mockOnChange = jest.fn();
        const labels = ['Min', 'Max'];
        render(
            <UnifiedSlider
                value={50}
                onChange={mockOnChange}
                showLabels
                labels={labels}
            />
        );
        expect(screen.getByText('Min')).toBeInTheDocument();
        expect(screen.getByText('Max')).toBeInTheDocument();
    });

    it('handles value changes', () => {
        const handleChange = vi.fn();
        render(<UnifiedSlider value={50} onChange={handleChange} />);

        const slider = screen.getAllByRole('slider')[0];
        fireEvent.change(slider, { target: { value: '75' } });
        expect(handleChange).toHaveBeenCalledWith(75);
    });

    it('respects min and max values', () => {
        render(
            <UnifiedSlider
                value={50}
                onChange={() => { }}
                min={10}
                max={90}
            />
        );
        const slider = screen.getAllByRole('slider')[0];
        expect(slider).toHaveAttribute('min', '10');
        expect(slider).toHaveAttribute('max', '90');
    });

    it('shows font size preview for fontSize variant', () => {
        render(
            <UnifiedSlider
                variant="fontSize"
                value={2}
                onChange={() => { }}
            />
        );
        const preview = screen.getByText('Предварительный просмотр:').closest('.font-size-preview');
        expect(preview).toBeInTheDocument();
        expect(preview!.textContent).toContain('Размер шрифта:');
        expect(preview!.textContent).toMatch(/Средний|Большой|Малый/);
    });
});

describe('Component Integration', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('works together in a form', () => {
        const handleSubmit = vi.fn();
        const handleSliderChange = vi.fn();

        render(
            <form onSubmit={handleSubmit}>
                <UnifiedSlider
                    value={50}
                    onChange={handleSliderChange}
                    showValue
                />
                <UnifiedButton type="submit">Submit</UnifiedButton>
            </form>
        );

        expect(screen.getAllByRole('slider')[0]).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
    });
});
