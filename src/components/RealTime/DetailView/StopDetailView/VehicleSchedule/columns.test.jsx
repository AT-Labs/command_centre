import { expect } from 'chai';
import { formatDestination, calculateDue } from './columns';

describe('Vehicle schedule columns', () => {
    context('formatDestination()', () => {
        it('should NOT format bus stop destination', () => {
            const isTrainStop = false;
            const destinationDisplay = 'Bus stop destination';
            const formattedDestination = formatDestination(isTrainStop, destinationDisplay);
            expect(formattedDestination).is.equal(destinationDisplay);
        });

        it('should format train stop destination', () => {
            const isTrainStop = true;
            const destinationDisplay = 'Britomart/N';
            const formattedDestination = formatDestination(isTrainStop, destinationDisplay);
            expect(formattedDestination.type).to.equal('div');
            expect(formattedDestination.props.children[0].props.children).to.equal('Britomart');
            expect(formattedDestination.props.children[1].props.children).to.equal(' via Newmarket');
        });
    });

    context('calculateDue()', () => {
        it('should display C if cancelled', () => {
            const arrivalStatus = 'cancelled';
            const formattedDueValue = calculateDue(arrivalStatus);
            expect(formattedDueValue).is.equal('C');
        });

        it('should display * if less than 2 mins', () => {
            const formattedDueValue = calculateDue('', '2020-09-17T01:18:54.000Z', '2020-09-17T01:20:00.000Z');
            expect(formattedDueValue).is.equal('*');
        });

        it('should display due value if more or equals to 2 mins', () => {
            const formattedDueValue = calculateDue('', '2020-09-17T01:18:54.000Z', '2020-09-17T01:29:00.000Z');
            expect(formattedDueValue).is.equal(10);
        });

        it('should display empty string no due time', () => {
            const formattedDueValue = calculateDue('', '', '');
            expect(formattedDueValue).is.equal('');
        });
    });
});
