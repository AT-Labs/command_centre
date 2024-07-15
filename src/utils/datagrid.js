import { isArray, isEmpty, find } from 'lodash-es';

export const mergeDatagridColumns = (oldDatagridColumns, newDatagridColumns) => {
    if (isArray(newDatagridColumns) && !isEmpty(newDatagridColumns) && isArray(oldDatagridColumns) && !isEmpty(oldDatagridColumns)) {
        return newDatagridColumns
            .map((column) => {
                const foundColumn = find(oldDatagridColumns, {
                    field: column.field,
                });
                if (foundColumn) {
                    return {
                        ...foundColumn,
                        ...column,
                    };
                }
                return null;
            })
            .filter(column => column !== null);
    }
    return undefined;
};
