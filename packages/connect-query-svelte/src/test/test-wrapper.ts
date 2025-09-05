// Copyright 2021-2023 The Connect Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { Transport } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import type { QueryClientConfig } from "@tanstack/svelte-query";
import { QueryClient } from "@tanstack/svelte-query";
import { setContext } from "svelte";

/**
 * A test utility that sets up TanStack Query's QueryClient and Connect-Query's transport context.
 */
export const createTestWrapper = (
  config?: QueryClientConfig,
  transport = createConnectTransport({
    baseUrl: "https://demo.connectrpc.com",
  }),
) => {
  const queryClient = new QueryClient(config);

  /**
   * Sets up both query client and transport contexts for testing.
   * Call this from within a Svelte component context (like in a test setup).
   */
  const setupContexts = () => {
    // Set up QueryClient context (using the same key as @tanstack/svelte-query)
    setContext("queryClient", queryClient);

    // Set up Transport context
    setContext(Symbol.for("connect-query-transport"), transport);
  };

  /**
   * Sets up only the query client context for testing.
   * Call this from within a Svelte component context.
   */
  const setupQueryClientContext = () => {
    setContext("queryClient", queryClient);
  };

  return {
    queryClient,
    transport,
    setupContexts,
    setupQueryClientContext,
  };
};
