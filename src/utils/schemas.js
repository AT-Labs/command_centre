const schemas = [
    {
        version: 1,
        schema: {
            stops: '&stop_code, stop_name',
            routes: '&route_id, route_short_name',
            published_version: 'version_name',
        },
    },
    {
        version: 2,
        schema: {},
    },
    {
        version: 3,
        schema: {},
    },
];

export default schemas;
