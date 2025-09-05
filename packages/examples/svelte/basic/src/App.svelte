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
    import { createConnectTransport } from "@connectrpc/connect-web";
    import {
        setTransport,
        useQuery,
    } from "../../../connect-query-svelte/src/index.js";
    import { QueryClient, setQueryClientContext } from "@tanstack/svelte-query";
    import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
    import { say } from "./gen/eliza-ElizaService_connectquery.js";

    // Create query client
    const queryClient = new QueryClient();

    // Create transport (allow override via props for testing)
    export let transport = createConnectTransport({
        baseUrl: "https://demo.connectrpc.com",
    });

    // Set up contexts
    setQueryClientContext(queryClient);
    setTransport(transport);

    // Use the query
    const result = useQuery(say, {
        sentence: "Hello",
    });
</script>

<main>
    <div class="container">
        <h1>Connect Query Svelte Example</h1>

        <div class="status-section">
            <h2>Status: {$result.status}</h2>

            <div class="indicators">
                <div class="indicator-group">
                    <h3>Query Status</h3>
                    <div
                        class="indicator"
                        class:active={$result.status === "pending"}
                    >
                        pending
                    </div>
                    <div
                        class="indicator"
                        class:active={$result.status === "success"}
                    >
                        success
                    </div>
                    <div
                        class="indicator"
                        class:active={$result.status === "error"}
                    >
                        error
                    </div>
                </div>

                <div class="indicator-group">
                    <h3>Fetch Status</h3>
                    <div
                        class="indicator"
                        class:active={$result.fetchStatus === "fetching"}
                    >
                        fetching
                    </div>
                    <div
                        class="indicator"
                        class:active={$result.fetchStatus === "idle"}
                    >
                        idle
                    </div>
                    <div
                        class="indicator"
                        class:active={$result.fetchStatus === "paused"}
                    >
                        paused
                    </div>
                </div>
            </div>
        </div>

        <div class="data-section">
            <div class="datum">
                <div class="datum-label">Data</div>
                <div class="datum-value">{JSON.stringify($result.data)}</div>
            </div>

            <div class="datum">
                <div class="datum-label">Error</div>
                <div class="datum-value">{JSON.stringify($result.error)}</div>
            </div>
        </div>
    </div>

    <SvelteQueryDevtools initialIsOpen />
</main>

<style>
    :global(body) {
        margin: 0;
        display: flex;
        font-family: Inter, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;
        background-color: #f5f7fa;
    }

    main {
        flex: 1;
        padding: 18px;
        max-width: 800px;
        display: flex;
        flex-direction: column;
    }

    .container {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    h1 {
        margin: 0 0 20px 0;
        color: #333;
    }

    h2 {
        margin: 0 0 12px 0;
        color: #333;
    }

    h3 {
        margin: 0 0 6px 0;
        text-align: center;
        font-size: 14px;
        color: #666;
    }

    .status-section {
        margin-bottom: 24px;
    }

    .indicators {
        display: flex;
        gap: 24px;
    }

    .indicator-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }

    .indicator {
        width: 100px;
        height: 50px;
        border: 1px solid #e4e9ef;
        border-radius: 6px;
        background-color: #ffffff;
        box-shadow: 0px 1px 2px rgba(15, 16, 77, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
    }

    .indicator.active {
        background-color: #c4e8fc;
    }

    .data-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .datum {
        border-radius: 6px;
        border: 1px solid #e4e9ef;
        overflow: hidden;
        box-shadow: 0px 1px 2px rgba(15, 16, 77, 0.05);
    }

    .datum-label {
        padding: 12px;
        background-color: #c4e8fc;
        font-weight: 500;
    }

    .datum-value {
        padding: 12px;
        background-color: #ffffff;
        font-family: monospace;
        font-size: 14px;
        word-break: break-all;
        min-height: 20px;
    }
</style>
