import request, { gql } from 'graphql-request';
import { apiUrl, graphqlUrl } from '../lib/config';
import { isNullOrUndefined } from '../lib/func';
import { Connection, RequestQueryParams } from './common';
import { webappUrl } from '../lib/constants';
import { Post } from './posts';
import { labels } from '../lib';

export enum SearchProviderEnum {
  Posts = 'posts',
  Chat = 'chat',
}

const searchPageUrl = `${webappUrl}search`;

export enum SearchChunkErrorCode {
  StoppedGenerating = '-2',
  Unexpected = '-1',
  Common = '0',
  Bragi = '1',
  Search = '2',
  RateLimit = '3',
}

export const searchErrorCodeToMessage: Partial<
  Record<SearchChunkErrorCode, string>
> = {
  [SearchChunkErrorCode.RateLimit]: labels.search.rateLimitExceeded,
  [SearchChunkErrorCode.Unexpected]: labels.search.unexpectedError,
  [SearchChunkErrorCode.StoppedGenerating]: labels.search.stoppedGenerating,
};

export interface SearchChunkError {
  message: string;
  code: SearchChunkErrorCode;
}

export interface SearchChunkSource {
  id: string;
  name: string;
  snippet: string;
  url: string;
}

export interface SearchChunk {
  id: string;
  prompt: string;
  response: string; // markdown
  error: SearchChunkError;
  createdAt: Date;
  completedAt: Date;
  feedback: number;
  sources: SearchChunkSource[];
  steps?: number;
  progress?: number;
  status?: string;
}

export interface Search {
  id: string;
  createdAt: Date;
  chunks: SearchChunk[];
}

export interface SearchSession {
  sessionId: string;
  prompt: string;
  createdAt: Date;
}

export interface SearchHistoryData {
  history: Connection<SearchSession>;
}

// Search control version suggestions
export const SEARCH_POST_SUGGESTIONS = gql`
  query SearchPostSuggestions($query: String!) {
    searchPostSuggestions(query: $query) {
      hits {
        id
        title
      }
    }
  }
`;

// AI question recommendations
export const SEARCH_POST_RECOMMENDATION = gql`
  query SearchQuestionRecommendations {
    searchQuestionRecommendations {
      id
      question
    }
  }
`;

export const SEARCH_SESSION_QUERY = gql`
  query SearchSession($id: String!) {
    searchSession(id: $id) {
      id
      createdAt
      chunks {
        id
        prompt
        response
        error {
          message
          code
        }
        createdAt
        completedAt
        feedback
        sources {
          id
          name
          snippet
          url
        }
      }
    }
  }
`;

export const SEARCH_HISTORY_QUERY = gql`
  query SearchSessionHistory($after: String, $first: Int) {
    history: searchSessionHistory(after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          sessionId: id
          prompt
          createdAt
        }
      }
    }
  }
`;

export const SEARCH_FEEDBACK_MUTATION = gql`
  mutation SearchResultFeedback($chunkId: String!, $value: Int!) {
    searchResultFeedback(chunkId: $chunkId, value: $value) {
      _
    }
  }
`;

export interface SearchQuestion {
  id: string;
  question: string;
  post: Post;
}

interface SearchFeedbackProps {
  chunkId: string;
  value: number;
}

export const sendSearchFeedback = (
  params: SearchFeedbackProps,
): Promise<void> => request(graphqlUrl, SEARCH_FEEDBACK_MUTATION, params);

export const getSearchSession = async (id: string): Promise<Search> => {
  const res = await request(graphqlUrl, SEARCH_SESSION_QUERY, { id });

  return res.searchSession;
};

export const getSearchHistory = async (
  params: RequestQueryParams,
): Promise<SearchHistoryData> =>
  request(graphqlUrl, SEARCH_HISTORY_QUERY, params);

export const getSearchSuggestions = async (): Promise<SearchQuestion[]> => {
  const res = await request(graphqlUrl, SEARCH_POST_RECOMMENDATION);

  return res.searchQuestionRecommendations;
};

type DeepPartial<T> = T extends unknown
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

interface InitializePayload extends Pick<Search, 'id' | 'createdAt'> {
  chunk_id: string;
  steps: number;
  status: string;
  prompt: string;
}

export const initializeSearchSession = ({
  prompt,
  ...param
}: InitializePayload): DeepPartial<Search> => {
  const { status, steps } = param;

  return {
    ...param,
    chunks: [
      {
        id: param.chunk_id,
        prompt,
        response: '',
        createdAt: param.createdAt,
        sources: [],
        status,
        steps,
        progress: 0,
      },
    ],
  };
};

export const updateSearchData = (
  previous: Search,
  chunk: Partial<SearchChunk>,
): Search => {
  if (!chunk) {
    return null;
  }

  const updated = {
    ...previous,
    chunks: [{ ...previous?.chunks?.[0], ...chunk }],
  };

  if (chunk.error) {
    return updated;
  }

  if (chunk.status) {
    updated.chunks[0].progress += 1;
  }

  if (chunk.completedAt) {
    updated.chunks[0].progress = updated.chunks[0].steps;
  }

  if (isNullOrUndefined(chunk.response)) {
    return updated;
  }

  updated.chunks[0].response = previous.chunks[0].response + chunk.response;

  return updated;
};

interface SearchUrlParams {
  id?: string;
  query?: string;
  provider: SearchProviderEnum;
}

export const getSearchUrl = (params: SearchUrlParams): string => {
  const { id, query, provider = SearchProviderEnum.Posts } = params;
  const searchParams = new URLSearchParams();

  if (!provider) {
    throw new Error('provider is required');
  }

  if (provider !== SearchProviderEnum.Posts) {
    searchParams.append('provider', provider);
  }

  if (id) {
    searchParams.append('id', id);
  } else if (query) {
    searchParams.append('q', query);
  }

  const searchParamsString = searchParams.toString();

  return `${searchPageUrl}${
    searchParamsString ? `?${searchParamsString}` : ''
  }`;
};

export const searchQueryUrl = `${apiUrl}/search/query`;

export const sendSearchQuery = async (
  query: string,
  token: string,
): Promise<EventSource> => {
  const params = new URLSearchParams({
    prompt: query,
    token,
  });

  return new EventSource(`${searchQueryUrl}?${params}`);
};

export type SearchSuggestion = {
  id?: string;
  title: string;
};

export type SearchSuggestionResult = {
  hits: SearchSuggestion[];
};

export const minSearchQueryLength = 3;

export const sanitizeSearchTitleMatch = /<(\/?)strong>/g;
