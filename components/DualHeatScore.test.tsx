import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DualHeatScore from './DualHeatScore';

describe('DualHeatScore', () => {
    it('renders the correct total score', () => {
        render(<DualHeatScore engagement={30} fit={20} />);
        expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('applies the correct color based on total score', () => {
        const { rerender } = render(<DualHeatScore engagement={45} fit={45} />);
        expect(screen.getByText('90')).toHaveClass('text-emerald-500');

        rerender(<DualHeatScore engagement={25} fit={30} />);
        expect(screen.getByText('55')).toHaveClass('text-amber-500');

        rerender(<DualHeatScore engagement={10} fit={10} />);
        expect(screen.getByText('20')).toHaveClass('text-red-500');
    });

    it('renders with the default size if not provided', () => {
        const { container } = render(<DualHeatScore engagement={10} fit={10} />);
        const div = container.firstChild as HTMLElement;
        expect(div).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('renders with the custom size if provided', () => {
        const { container } = render(<DualHeatScore engagement={10} fit={10} size={200} />);
        const div = container.firstChild as HTMLElement;
        expect(div).toHaveStyle({ width: '200px', height: '200px' });
    });
});
