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
  import { QueryClient, setQueryClientContext, createQueries } from "@tanstack/svelte-query";
  import { setTransport } from "../use-transport.js";
  import { callUnaryMethod, createConnectQueryKey } from "@connectrpc/connect-query-core";

  export let schema;
  export let input;
  export let transport;
  export let queryClient = new QueryClient();

  // Set up contexts
  setQueryClientContext(queryClient);
  if (transport) {
    setTransport(transport);
  }

  // Use createQueries with callUnaryMethod
  const queries = createQueries({
    queries: [
      {
        queryKey: createConnectQueryKey({
          schema,
          input,
          transport,
          cardinality: "finite",
        }),
        queryFn: async ({ signal }) => {
          const res = await callUnaryMethod(
            transport,
            schema,
            input,
            {
              signal,
            },
          );
          return res;
        },
      },
    ],
  });

  // Extract the first query for testing
  $: query1 = $queries[0];
</script>

<div data-testid="query1-status">{query1.status}</div>
<div data-testid="query1-data">{JSON.stringify(query1.data)}</div>
<div data-testid="query1-error">{JSON.stringify(query1.error)}</div>
<div data-testid="query1-is-success">{query1.isSuccess}</div>
<div data-testid="query1-is-pending">{query1.isPending}</div>
<div data-testid="query1-is-fetching">{query1.isFetching}</div>
