import { gql } from "graphql-request";

export const GET_ACTIVITY_LOGS = gql`
  query GetActivityLogs($limit: Int!, $user: String) {
    deposit_events(limit: $limit, orderBy: "timestamp", orderDirection: "desc", where: { user: $user }) {
      items {
        id
        chain
        user
        amount
        txHash
        timestamp
      }
    }
    withdraw_events(limit: $limit, orderBy: "timestamp", orderDirection: "desc", where: { user: $user }) {
      items {
        id
        chain
        user
        amount
        txHash
        timestamp
      }
    }
    rebalance_triggereds(limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
      items {
        id
        chain
        targetChain
        amount
        txHash
        timestamp
        messageId
      }
    }
    yield_snapshots(limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
      items {
        id
        chain
        supplyRate
        timestamp
      }
    }
  }
`;

export const GET_CCIP_LOGS = gql`
  query GetCCIPLogs($limit: Int!) {
    rebalance_triggereds(limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
      items {
        id
        chain
        targetChain
        targetSelector
        amount
        messageId
        txHash
        timestamp
        ccipUrl
      }
    }
  }
`;

export const GET_USER_PORTFOLIO = gql`
  query GetUserPortfolio($user: String!) {
    deposit_events(where: { user: $user }) {
      items {
        chain
        amount
      }
    }
    withdraw_events(where: { user: $user }) {
      items {
        chain
        amount
      }
    }
  }
`;

export const GET_YIELD_HISTORY = gql`
  query GetYieldHistory($chain: String!, $limit: Int!) {
    yield_snapshots(where: { chain: $chain }, limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
      items {
        supplyRate
        timestamp
      }
    }
  }
`;

export const GET_VAULT_STATE = gql`
  query GetVaultState {
    vault_states {
      items {
        chain
        totalAssets
        updatedAt
      }
    }
  }
`;
