export const getTitle = (items) => {
    const infos = items.find(element => element.name === 'title');
    if (infos) return infos.content;
    return '';
};

export const getDescription = (items) => {
    const infos = items.find(element => element.name === 'description');
    if (infos) return infos.content;
    return '';
};

export const getAndParseInformedEntities = (items) => {
    const infos = items.find(element => element.name === 'title');
    if (infos) {
        return infos.informedEntities.map((element) => {
            if (element.stopCode) {
                return { ...element, text: element.stopCode };
            }
            return element;
        });
    }
    return [];
};
