import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

const staticQueryClient = (url, params, authToken) => {
    const httpLink = new HttpLink({
        uri: `${url}/graphql${params ? `?${params}` : ''}`,
    });

    const authLink = setContext((_, { headers }) => {
        const authorization = authToken ? { authorization: `Bearer ${authToken}` } : {};
        return {
            headers: {
                ...headers,
                ...authorization,
            },
        };
    });

    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
    });
};

export const mutateStatic = ({
    url, mutation, variables, params, authToken,
}) => staticQueryClient(url, params, authToken).mutate({
    mutation,
    variables: {
        ...variables,
    },
});
