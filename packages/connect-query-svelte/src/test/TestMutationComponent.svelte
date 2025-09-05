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
  import { useMutation } from "../use-mutation.js";

  export let schema;
  export let options = {};
  export let transport;
  export let queryClient = new QueryClient();

  // Set up contexts
  setQueryClientContext(queryClient);
  if (transport) {
    setTransport(transport);
  }

  // Use the mutation hook
  const mutation = useMutation(schema, options);

  // Export method to trigger mutation for testing
  export function triggerMutation(variables) {
    $mutation.mutate(variables);
  }
</script>

<div data-testid="mutation-status">{$mutation.status}</div>
<div data-testid="mutation-data">{JSON.stringify($mutation.data)}</div>
<div data-testid="mutation-error">{JSON.stringify($mutation.error)}</div>
<div data-testid="mutation-is-success">{$mutation.isSuccess}</div>
<div data-testid="mutation-is-pending">{$mutation.isPending}</div>
<div data-testid="mutation-is-error">{$mutation.isError}</div>
<div data-testid="mutation-is-idle">{$mutation.isIdle}</div>
