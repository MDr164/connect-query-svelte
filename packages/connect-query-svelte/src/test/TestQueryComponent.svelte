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
  import { useQuery } from "../use-query.js";

  export let schema;
  export let input;
  export let options = {};
  export let transport;
  export let queryClient = new QueryClient();

  // Set up contexts
  setQueryClientContext(queryClient);
  if (transport) {
    setTransport(transport);
  }

  // Use the query hook
  const result = useQuery(schema, input, options);

  // Export the result for testing access
  export { result };
</script>

<div data-testid="query-status">{$result.status}</div>
<div data-testid="query-fetch-status">{$result.fetchStatus}</div>
<div data-testid="query-data">{JSON.stringify($result.data)}</div>
<div data-testid="query-error">{JSON.stringify($result.error)}</div>
<div data-testid="query-is-success">{$result.isSuccess}</div>
<div data-testid="query-is-pending">{$result.isPending}</div>
<div data-testid="query-is-fetching">{$result.isFetching}</div>
