import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
    it('renders all navigation items', () => {
        render(
            <MemoryRouter>
                <BottomNav />
            </MemoryRouter>
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Leads')).toBeInTheDocument();
        expect(screen.getByText('Catalog')).toBeInTheDocument();
        expect(screen.getByText('Tasks')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('links have correct hrefs', () => {
        render(
            <MemoryRouter>
                <BottomNav />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/dashboard');
        expect(screen.getByRole('link', { name: /leads/i })).toHaveAttribute('href', '/leads');
        expect(screen.getByRole('link', { name: /catalog/i })).toHaveAttribute('href', '/products');
        expect(screen.getByRole('link', { name: /tasks/i })).toHaveAttribute('href', '/tasks');
        expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile');
    });
});
