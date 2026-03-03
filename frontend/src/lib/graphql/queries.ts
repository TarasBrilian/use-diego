import { gql } from "graphql-request";

export const GET_ACTIVITY_LOGS = gql`
  query GetActivityLogs($limit: Int!, $user: String) {
    depositEvents(limit: $limit, orderBy: "timestamp", orderDirection: "desc", where: { user: $user }) {
      items {
        id
        chain
        user
        amount
        txHash
        timestamp
      }
    }
    withdrawEvents(limit: $limit, orderBy: "timestamp", orderDirection: "desc", where: { user: $user }) {
      items {
        id
        chain
        user
        amount
        txHash
        timestamp
      }
    }
    rebalanceTriggereds(limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
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
    yieldSnapshots(limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
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
    rebalanceTriggereds(limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
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
    depositEvents(where: { user: $user }) {
      items {
        chain
        amount
      }
    }
    withdrawEvents(where: { user: $user }) {
      items {
        chain
        amount
      }
    }
  }
`;

export const GET_YIELD_HISTORY = gql`
  query GetYieldHistory($chain: String!, $limit: Int!) {
    yieldSnapshots(where: { chain: $chain }, limit: $limit, orderBy: "timestamp", orderDirection: "desc") {
      items {
        supplyRate
        timestamp
      }
    }
  }
`;

export const GET_VAULT_STATE = gql`
  query GetVaultState {
    vaultStates {
      items {
        chain
        totalAssets
        updatedAt
      }
    }
  }
`;
