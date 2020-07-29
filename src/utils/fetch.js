export const jsonResponseHandling = async (response) => {
    if (response.ok) {
        if (response.status === 204) {
            return response;
        }
        return response.json();
    }
    const errorResponse = await response.json().catch(() => {
        throw Object.create({ code: response.status, message: response.statusText });
    });
    throw Object.create({ code: errorResponse.code, message: errorResponse.error });
};
