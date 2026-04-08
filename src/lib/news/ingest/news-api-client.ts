export type NewsApiClientConfig = {
  apiKey: string;
  baseUrl: string;
};

// Placeholder for the real HTTP client once the live news provider is wired in.
export function createNewsApiClient(_config: NewsApiClientConfig) {
  return {
    async fetchLatest() {
      throw new Error(
        "Connect createNewsApiClient() to your chosen news provider before using live ingestion.",
      );
    },
  };
}
