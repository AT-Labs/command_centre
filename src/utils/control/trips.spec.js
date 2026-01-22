import { buildHeadSignWithCustomization } from './trips';

describe('buildHeadSignWithCustomization', () => {
    it.each([
        ['Britomart', 'None', false, 'Britomart'],
        ['Britomart', 'None', true, 'Britomart Limited Stops'],
        ['Britomart', '/N', false, 'Britomart/N'],
        ['Britomart', '/N', true, 'Britomart Limited Stops/N'],
        ['Britomart', 'via Newmarket', false, 'Britomart via Newmarket'],
        ['Britomart', 'via Newmarket', true, 'Britomart Limited Stops via Newmarket'],
        ['Britomart', '/PAN', true, 'Britomart Limited Stops/PAN'],
        ['Britomart', 'via Parnell', true, 'Britomart Limited Stops via Parnell'],
        ['Britomart', 'None', true, 'Britomart Limited Stops'],
        ['Britomart', 'None', false, 'Britomart'],
    ])(
        'returns "%s" when newDestination="%s", selectedPidCustomization="%s", isLimitedStops=%s',
        (newDestination, selectedPidCustomization, isLimitedStops, expected) => {
            expect(buildHeadSignWithCustomization(newDestination, selectedPidCustomization, isLimitedStops)).toBe(expected);
        },
    );
});
