import React from 'react';
import { mount } from 'enzyme';
import { SelectedEntitiesRenderer } from './SelectedEntitiesRenderer';

describe('<SelectedEntitiesRenderer />', () => {
    const mockDisruptionKey = 'DISR123';

    describe('getStopsUnderRoute - stopsFromStops filter', () => {
        it('should filter stopsFromStops when affectedStops has items with routeId and stopCode', () => {
            const affectedEntities = {
                affectedRoutes: [
                    {
                        routeId: '101-202',
                        routeShortName: '101',
                    },
                ],
                affectedStops: [
                    {
                        routeId: '101-202',
                        stopCode: '8000',
                        directionId: 0,
                        stopId: 'stop1',
                    },
                    {
                        routeId: '101-202',
                        stopCode: '8001',
                        directionId: 1,
                        stopId: 'stop2',
                    },
                    {
                        routeId: '202-303',
                        stopCode: '8002',
                        directionId: 0,
                        stopId: 'stop3',
                    },
                ],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            const routeElement = wrapper.find('.disruption-effect-item-route');
            expect(routeElement.exists()).toBe(true);
            expect(routeElement.text()).toContain('Route - 101');
        });
    });

    describe('getStopsUnderRoute - uniqBy with directionId', () => {
        it('should handle directionId when present', () => {
            const affectedEntities = {
                affectedRoutes: [],
                affectedStops: [
                    {
                        routeId: '101-202',
                        stopCode: '8000',
                        directionId: 0,
                        stopId: 'stop1',
                    },
                ],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.exists()).toBe(true);
        });

        it('should handle directionId when undefined (empty string fallback)', () => {
            const affectedEntities = {
                affectedRoutes: [],
                affectedStops: [
                    {
                        routeId: '101-202',
                        stopCode: '8000',
                        stopId: 'stop1',
                    },
                ],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.exists()).toBe(true);
        });
    });

    describe('getRoutesUnderStop - routesFromRoutes filter', () => {
        it('should filter routesFromRoutes when affectedRoutes has items with stopCode and routeId', () => {
            const affectedEntities = {
                affectedRoutes: [
                    {
                        routeId: '101-202',
                        routeShortName: '101',
                        stopCode: '8000',
                    },
                    {
                        routeId: '202-303',
                        routeShortName: '202',
                        stopCode: '8000',
                    },
                    {
                        routeId: '303-404',
                        routeShortName: '303',
                        stopCode: '8001',
                    },
                ],
                affectedStops: [
                    {
                        stopId: 'stop1',
                        stopCode: '8000',
                        text: 'Test Stop',
                    },
                ],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            const stopElement = wrapper.find('.disruption-effect-item-stop').first();
            expect(stopElement.exists()).toBe(true);
            expect(stopElement.text()).toContain('Stop - Test Stop');
        });
    });

    describe('getDirectionContent callback', () => {
        it('should render direction content when directionIds exist', () => {
            const affectedEntities = {
                affectedRoutes: [
                    {
                        routeId: '101-202',
                        routeShortName: '101',
                    },
                ],
                affectedStops: [
                    {
                        routeId: '101-202',
                        stopCode: '8000',
                        directionId: 0,
                        stopId: 'stop1',
                    },
                    {
                        routeId: '101-202',
                        stopCode: '8001',
                        directionId: 1,
                        stopId: 'stop2',
                    },
                ],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            const directionContent = wrapper.find('.disruption-effect-item-stop.pl-4');
            expect(directionContent.length).toBeGreaterThan(0);
        });

        it('should map directionIds and call getDirectionContent', () => {
            const affectedEntities = {
                affectedRoutes: [
                    {
                        routeId: '101-202',
                        routeShortName: '101',
                    },
                ],
                affectedStops: [
                    {
                        routeId: '101-202',
                        stopCode: '8000',
                        directionId: 0,
                        stopId: 'stop1',
                    },
                    {
                        routeId: '101-202',
                        stopCode: '8001',
                        directionId: 1,
                        stopId: 'stop2',
                    },
                ],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            const directionElements = wrapper.find('.disruption-effect-item-stop.pl-4');
            expect(directionElements.length).toBe(2);
        });
    });

    describe('SelectedEntitiesRenderer - affectedRoutes check', () => {
        it('should return empty array when affectedRoutes is undefined', () => {
            const affectedEntities = {
                affectedRoutes: undefined,
                affectedStops: [],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.find('.disruption-effect-item-route').length).toBe(0);
        });

        it('should return empty array when affectedRoutes is null', () => {
            const affectedEntities = {
                affectedRoutes: null,
                affectedStops: [],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.find('.disruption-effect-item-route').length).toBe(0);
        });
    });

    describe('SelectedEntitiesRenderer - affectedStops check', () => {
        it('should return empty array when affectedStops is undefined', () => {
            const affectedEntities = {
                affectedRoutes: [],
                affectedStops: undefined,
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.find('.disruption-effect-item-stop').length).toBe(0);
        });

        it('should return empty array when affectedStops is null', () => {
            const affectedEntities = {
                affectedRoutes: [],
                affectedStops: null,
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.find('.disruption-effect-item-stop').length).toBe(0);
        });
    });

    describe('SelectedEntitiesRenderer - early return conditions', () => {
        it('should return null when affectedEntities is null', () => {
            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ null }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.html()).toBe(null);
        });

        it('should return null when affectedEntities is undefined', () => {
            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ undefined }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.html()).toBe(null);
        });

        it('should return null when both uniqueRoutes and uniqueStops are empty', () => {
            const affectedEntities = {
                affectedRoutes: [],
                affectedStops: [],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.html()).toBe(null);
        });

        it('should render when uniqueRoutes has items even if uniqueStops is empty', () => {
            const affectedEntities = {
                affectedRoutes: [
                    {
                        routeId: '101-202',
                        routeShortName: '101',
                    },
                ],
                affectedStops: [],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.find('.disruption-effect-item-route').length).toBeGreaterThan(0);
        });

        it('should render when uniqueStops has items even if uniqueRoutes is empty', () => {
            const affectedEntities = {
                affectedRoutes: [],
                affectedStops: [
                    {
                        stopId: 'stop1',
                        stopCode: '8000',
                        text: 'Test Stop',
                    },
                ],
            };

            const wrapper = mount(
                <SelectedEntitiesRenderer
                    affectedEntities={ affectedEntities }
                    disruptionKey={ mockDisruptionKey }
                />,
            );

            expect(wrapper.find('.disruption-effect-item-stop').length).toBeGreaterThan(0);
        });
    });
});

