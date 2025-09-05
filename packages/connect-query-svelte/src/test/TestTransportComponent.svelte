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
  import { setTransport, useTransport, fallbackTransport } from "../use-transport.js";

  export let transport;

  // Set transport if provided
  if (transport) {
    setTransport(transport);
  }

  // Get the transport from context
  const receivedTransport = useTransport();

  // Check if we received a transport
  const transportReceived = receivedTransport !== undefined && receivedTransport !== null;

  // Check if it's the fallback transport
  const isFallback = receivedTransport === fallbackTransport;
</script>

<div data-testid="transport-received">{transportReceived}</div>
<div data-testid="is-fallback">{isFallback}</div>
<div data-testid="transport-type">{typeof receivedTransport}</div>
