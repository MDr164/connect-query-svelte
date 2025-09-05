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

import { ConnectError } from "@connectrpc/connect";
import { render, waitFor } from "@testing-library/svelte";
import { mockBigInt } from "test-utils";
import { ElizaService } from "test-utils/gen/eliza_pb.js";
import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";

import TestQueryComponent from "./test/TestQueryComponent.svelte";
import TestTransportComponent from "./test/TestTransportComponent.svelte";

const sayMethodDescriptor = ElizaService.method.say;

const error = new ConnectError(
  "To use Connect, you must provide a `Transport`: a simple object that handles `unary` and `stream` requests. `Transport` objects can easily be created by using `@connectrpc/connect-web`'s exports `createConnectTransport` and `createGrpcWebTransport`. see: https://connectrpc.com/docs/web/getting-started for more info.",
);

describe("useTransport", () => {
  it("throws the fallback error", async () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: undefined,
        options: { retry: false },
        queryClient: new QueryClient(),
        // No transport provided - should use fallback
      },
    });

    expect(getByTestId("query-error")).toHaveTextContent("null");
    expect(getByTestId("query-is-error")).toHaveTextContent("false");

    await waitFor(() => {
      expect(getByTestId("query-is-error")).toHaveTextContent("true");
    });

    const errorElement = getByTestId("query-error");
    const errorData = JSON.parse(errorElement.textContent || "null");
    expect(errorData?.message).toEqual(error.message);
  });
});

describe("setTransport", () => {
  it("provides a custom transport to the useTransport hook", () => {
    const transport = mockBigInt();
    const { getByTestId } = render(TestTransportComponent, {
      props: {
        transport,
      },
    });

    // The test component should receive the transport we set
    expect(getByTestId("transport-received")).toHaveTextContent("true");
  });

  it("uses fallback transport when none is provided", () => {
    const { getByTestId } = render(TestTransportComponent, {
      props: {
        // No transport provided
      },
    });

    // The test component should receive the fallback transport
    expect(getByTestId("transport-received")).toHaveTextContent("true");
    expect(getByTestId("is-fallback")).toHaveTextContent("true");
  });
});
