/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import SingleLineTextWithTooltip from './SingleLineTextWithTooltip';

const emotionCache = createCache({
    key: 'css',
    prepend: true,
});

const theme = createTheme();

const render = (ui, options) => rtlRender(
    <CacheProvider value={ emotionCache }>
        <ThemeProvider theme={ theme }>{ui}</ThemeProvider>
    </CacheProvider>,
    options,
);

describe('SingleLineTextWithTooltip', () => {
    const tooltipText = 'Tooltip text';

    test('renders the text on screen', () => {
        render(<SingleLineTextWithTooltip text={ tooltipText } />);
        expect(screen.getByText(tooltipText)).toBeInTheDocument();
    });

    test('shows the tooltip on hover', async () => {
        render(<SingleLineTextWithTooltip text={ tooltipText } />);
        const textElement = screen.getByText(tooltipText);

        fireEvent.mouseOver(textElement);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(tooltipText);

        fireEvent.mouseOut(textElement);
    });
});
