import { searchAddresses } from './mapbox';

const MOCK_W_SEARCH_REPLY = {
    features: [
        {
            place_name: 'Waterview Downs, Waterview, Auckland 1026, New Zealand',
            center: [174.702373668, -36.883759295],
        },
        {
            place_name: 'Waterways, Red Beach, Whangaparaoa 0932, New Zealand',
            center: [174.704515976, -36.602608684],
        },
        {
            place_name: 'West Fairway, Golflands, Auckland 2013, New Zealand',
            center: [174.903863779, -36.919242722],
        },
        {
            place_name: 'Whakawhiti, Avondale, Auckland 1026, New Zealand',
            center: [174.686430204, -36.890345451],
        },
    ],
};

const unmockedFetch = global.fetch;

afterEach(() => {
    global.fetch = unmockedFetch;
});

describe('searchAddresses', () => {
    it('should return 4 formatted results for w', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 200,
            ok: true,
            json: () => Promise.resolve(MOCK_W_SEARCH_REPLY),
        }));
        const result = await searchAddresses('w');
        expect(result).toEqual(
            [
                { address: 'Waterview Downs, Waterview', lng: 174.702373668, lat: -36.883759295 },
                { address: 'Waterways, Red Beach', lng: 174.704515976, lat: -36.602608684 },
                { address: 'West Fairway, Golflands', lng: 174.903863779, lat: -36.919242722 },
                { address: 'Whakawhiti, Avondale', lng: 174.686430204, lat: -36.890345451 },
            ],
        );
    });

    it('should throw error if 401', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 401,
            ok: false,
            json: () => Promise.resolve({ message: 'Unauthorized' }),
        }));

        let exceptionThrown = false;
        try {
            await searchAddresses('w');
        } catch (e) {
            expect(e.code).toBe(401);
            expect(e.message).toBe('Unauthorized');
            exceptionThrown = true;
        }
        expect(exceptionThrown).toBe(true);
    });

    it('should throw error if body is not json', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 500,
            statusText: 'InternalServerError',
            ok: false,
            json: () => Promise.reject(Error('Not JSON')),
        }));

        let exceptionThrown = false;
        try {
            await searchAddresses('w');
        } catch (e) {
            expect(e.code).toBe(500);
            expect(e.message).toBe('InternalServerError');
            exceptionThrown = true;
        }
        expect(exceptionThrown).toBe(true);
    });
});
