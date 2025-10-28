import { OpenAIIcon } from '@/services/modules/chatgpt-service/components/OpenAIIcon';
import { render, screen } from '@testing-library/react';

describe('OpenAIIcon', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('renders without crashing', () => {
        render(<OpenAIIcon />);
        const svgElement = screen.getByLabelText('OpenAI Logo');
        expect(svgElement).toBeInTheDocument();
    });

    it('applies custom size', () => {
        render(<OpenAIIcon size={32} />);
        const svgElement = screen.getByLabelText('OpenAI Logo');
        expect(svgElement).toHaveAttribute('width', '32');
        expect(svgElement).toHaveAttribute('height', '32');
    });

    it('applies custom className', () => {
        render(<OpenAIIcon className="custom-class" />);
        const svgElement = screen.getByLabelText('OpenAI Logo');
        expect(svgElement).toHaveClass('custom-class');
    });

    it('applies custom color', () => {
        render(<OpenAIIcon color="#ff0000" />);
        const svgElement = screen.getByLabelText('OpenAI Logo');
        const circles = svgElement.querySelectorAll('circle');
        expect(circles[0]).toHaveAttribute('stroke', '#ff0000');
    });

    it('has correct viewBox', () => {
        render(<OpenAIIcon />);
        const svgElement = screen.getByLabelText('OpenAI Logo');
        expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('contains circles and path elements for logo structure', () => {
        render(<OpenAIIcon />);
        const svgElement = screen.getByLabelText('OpenAI Logo');
        const circles = svgElement.querySelectorAll('circle');
        const paths = svgElement.querySelectorAll('path');
        expect(circles.length).toBe(3); // Три круга для круглого логотипа
        expect(paths.length).toBe(1); // Один путь для внутреннего элемента
    });
});
