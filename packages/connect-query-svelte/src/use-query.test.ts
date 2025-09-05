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

import { create } from "@bufbuild/protobuf";
import {
  createConnectQueryKey,
  skipToken,
} from "@connectrpc/connect-query-core";
import { render, waitFor } from "@testing-library/svelte";
import { mockBigInt, mockEliza } from "test-utils";
import { BigIntService } from "test-utils/gen/bigint_pb.js";
import { ElizaService } from "test-utils/gen/eliza_pb.js";
import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";

import TestQueryComponent from "./test/TestQueryComponent.svelte";

// TODO: maybe create a helper to take a service and method and generate this.
const sayMethodDescriptor = ElizaService.method.say;

const mockedElizaTransport = mockEliza();

const bigintTransport = mockBigInt();

const elizaWithDelayTransport = mockEliza(undefined, true);

describe("useQuery", () => {
  it("can query data", async () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: { sentence: "hello" },
        transport: mockedElizaTransport,
      },
    });

    await waitFor(() => {
      expect(getByTestId("query-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(typeof data?.sentence).toBe("string");
  });

  it("can be disabled", () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: skipToken,
        transport: mockedElizaTransport,
      },
    });

    expect(getByTestId("query-is-pending")).toHaveTextContent("true");
    expect(getByTestId("query-is-fetching")).toHaveTextContent("false");
  });

  it("can be provided a custom transport", async () => {
    const transport = mockEliza({
      sentence: "Intercepted!",
    });

    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: {},
        options: { transport },
        transport: mockedElizaTransport, // This should be overridden by options.transport
      },
    });

    await waitFor(() => {
      expect(getByTestId("query-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.sentence).toBe("Intercepted!");
  });

  it("can be provided other props for svelte-query", () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: {},
        options: {
          transport: elizaWithDelayTransport,
          placeholderData: create(sayMethodDescriptor.output, {
            sentence: "placeholder!",
          }),
        },
      },
    });

    const dataElement = getByTestId("query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.sentence).toBe("placeholder!");
  });

  it("can be used along with the select", async () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: {},
        options: {
          select: (data) => data.sentence.length,
        },
        transport: mockedElizaTransport,
      },
    });

    await waitFor(() => {
      expect(getByTestId("query-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("query-data");
    expect(JSON.parse(dataElement.textContent || "0")).toBe(6);
  });

  it("can be disabled with enabled: false", () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: { sentence: "hello" },
        options: { enabled: false },
        transport: mockedElizaTransport,
      },
    });

    expect(getByTestId("query-data")).toHaveTextContent("null");
    expect(getByTestId("query-is-pending")).toHaveTextContent("true");
    expect(getByTestId("query-is-fetching")).toHaveTextContent("false");
  });

  it("can be disabled with enabled: false in QueryClient default options", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          enabled: false,
        },
      },
    });

    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: { sentence: "hello" },
        transport: mockedElizaTransport,
        queryClient,
      },
    });

    expect(getByTestId("query-data")).toHaveTextContent("null");
    expect(getByTestId("query-is-pending")).toHaveTextContent("true");
    expect(getByTestId("query-is-fetching")).toHaveTextContent("false");
  });

  it("can be disabled with skipToken", () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: sayMethodDescriptor,
        input: skipToken,
        transport: mockedElizaTransport,
      },
    });

    expect(getByTestId("query-data")).toHaveTextContent("null");
    expect(getByTestId("query-is-pending")).toHaveTextContent("true");
    expect(getByTestId("query-is-fetching")).toHaveTextContent("false");
  });

  it("supports schemas with bigint keys", async () => {
    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: BigIntService.method.count,
        input: { add: 2n },
        transport: bigintTransport,
      },
    });

    await waitFor(() => {
      expect(getByTestId("query-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.count).toBe("1"); // BigInt serializes to string in JSON
  });

  it("data can be fetched from cache", async () => {
    const queryClient = new QueryClient();

    const { getByTestId } = render(TestQueryComponent, {
      props: {
        schema: BigIntService.method.count,
        input: {},
        transport: bigintTransport,
        queryClient,
      },
    });

    await waitFor(() => {
      expect(getByTestId("query-is-success")).toHaveTextContent("true");
    });

    const cachedData = queryClient.getQueryData(
      createConnectQueryKey({
        schema: BigIntService.method.count,
        input: {},
        transport: bigintTransport,
        cardinality: "finite",
      }),
    );

    expect(cachedData).toEqual(expect.objectContaining({
      count: expect.any(BigInt),
    }));
  });
});
