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

        it('should format train with new crl destination', () => {
            const isTrainStop = true;
            const destinationDisplay = 'Baldwin Ave Limited Stops via Waitemata';
            const formattedDestination = formatDestination(isTrainStop, destinationDisplay);
            expect(formattedDestination.type).to.equal('div');
            expect(formattedDestination.props.children[0].props.children).to.equal('Baldwin Ave');
            expect(formattedDestination.props.children[1].props.children).to.equal(' Limited Stops via Waitemata');
        });

        it('should format train with new crl destination that not in config', () => {
            const isTrainStop = true;
            const destinationDisplay = 'City Centre Limited Stops via Waitemata';
            const formattedDestination = formatDestination(isTrainStop, destinationDisplay);
            expect(formattedDestination.type).to.equal('div');
            expect(formattedDestination.props.children[0].props.children).to.equal('City Centre');
            expect(formattedDestination.props.children[1].props.children).to.equal(' Limited Stops via Waitemata');
        });

        it('should format train with new crl destination only via', () => {
            const isTrainStop = true;
            const destinationDisplay = 'Baldwin Ave via Waitemata';
            const formattedDestination = formatDestination(isTrainStop, destinationDisplay);
            expect(formattedDestination.type).to.equal('div');
            expect(formattedDestination.props.children[0].props.children).to.equal('Baldwin Ave');
            expect(formattedDestination.props.children[1].props.children).to.equal(' via Waitemata');
        });

        it('should format train with new crl destination only ls', () => {
            const isTrainStop = true;
            const destinationDisplay = 'Baldwin Ave Limited Stops';
            const formattedDestination = formatDestination(isTrainStop, destinationDisplay);
            expect(formattedDestination.type).to.equal('div');
            expect(formattedDestination.props.children[0].props.children).to.equal('Baldwin Ave');
            expect(formattedDestination.props.children[1].props.children).to.equal(' Limited Stops');
        });

        it('should format train with random destinationDisplay', () => {
            const isTrainStop = true;
            const destinationDisplay = 'test test test';
            const formattedDestination = formatDestination(isTrainStop, destinationDisplay);
            expect(formattedDestination.type).to.equal('strong');
            expect(formattedDestination.props.children).to.equal('test test test');
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
