import { GraphQLClient } from "graphql-request"

export const ponderClient = new GraphQLClient(
    process.env.NEXT_PUBLIC_PONDER_URL ?? "http://localhost:42069/graphql"
)