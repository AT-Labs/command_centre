import { expect } from 'chai';
import moment from 'moment';
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
            const formattedDueValue = calculateDue(arrivalStatus, moment());
            expect(formattedDueValue).is.equal('C');
        });

        it('should display * if less than 2 mins', () => {
            const formattedDueValue = calculateDue('', moment().subtract(5, 'minutes'));
            expect(formattedDueValue).is.equal('*');
        });

        it('should display due value if more or equals to 2 mins', () => {
            const formattedDueValue = calculateDue('', moment().add({
                minutes: 5,
                seconds: 1, // Execution might take a few milliseconds thus failing this test so we add 1 extra second
            }));
            expect(formattedDueValue).is.equal(5);
        });

        it('should display empty string if no due time', () => {
            const formattedDueValue = calculateDue('', '', '');
            expect(formattedDueValue).is.equal('');
        });
    });
});
