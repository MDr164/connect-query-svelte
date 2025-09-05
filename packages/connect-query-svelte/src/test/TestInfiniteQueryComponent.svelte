<!--
Copyright 2021-2023 The Connect Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<script>
  import { QueryClient, setQueryClientContext } from "@tanstack/svelte-query";
  import { setTransport } from "../use-transport.js";
  import { useInfiniteQuery } from "../use-infinite-query.js";

  export let schema;
  export let input;
  export let options = {};
  export let transport;
  export let queryClient = new QueryClient();
  export let queryClientConfig = {};

  // Create query client with config if provided
  if (Object.keys(queryClientConfig).length > 0) {
    queryClient = new QueryClient(queryClientConfig);
  }

  // Set up contexts
  setQueryClientContext(queryClient);
  if (transport) {
    setTransport(transport);
  }

  // Use the infinite query hook
  const result = useInfiniteQuery(schema, input, options);

  // Export methods for testing access
  export async function fetchNextPage() {
    return await $result.fetchNextPage();
  }

  export function fetchPreviousPage() {
    return $result.fetchPreviousPage();
  }

  // Export queryClient for testing access
  export { queryClient };
</script>

<div data-testid="infinite-query-status">{$result.status}</div>
<div data-testid="infinite-query-fetch-status">{$result.fetchStatus}</div>
<div data-testid="infinite-query-data">{JSON.stringify($result.data)}</div>
<div data-testid="infinite-query-error">{JSON.stringify($result.error)}</div>
<div data-testid="infinite-query-is-success">{$result.isSuccess}</div>
<div data-testid="infinite-query-is-pending">{$result.isPending}</div>
<div data-testid="infinite-query-is-fetching">{$result.isFetching}</div>
<div data-testid="infinite-query-is-error">{$result.isError}</div>
<div data-testid="infinite-query-has-next-page">{$result.hasNextPage}</div>
<div data-testid="infinite-query-is-fetching-next-page">{$result.isFetchingNextPage}</div>
