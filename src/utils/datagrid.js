import { isArray, isEmpty, find, merge } from 'lodash-es';

export const mergeDatagridColumns = (oldDatagridColumns, newDatagridColumns) => {
    if (isArray(newDatagridColumns) && !isEmpty(newDatagridColumns) && isArray(oldDatagridColumns) && !isEmpty(oldDatagridColumns)) {
        const datagridColumns = newDatagridColumns
            .map((column) => {
                const foundColumn = find(oldDatagridColumns, {
                    field: column.field,
                });
                if (foundColumn) {
                    return merge({}, foundColumn, column);
                }
                return null;
            })
            .filter(column => column !== null);
        // adds the elements of the existing array that don't have the new configuration.
        oldDatagridColumns
            .map((element, index) => ({ element, index }))
            .filter(({ element }) => !datagridColumns.find(i => i.field === element.field))
            .forEach(({ element, index }) => { datagridColumns.splice(index, 0, element); });
        return datagridColumns;
    }
    return undefined;
};
