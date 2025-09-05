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
import { createConnectQueryKey } from "@connectrpc/connect-query-core";
import { QueryCache, skipToken } from "@tanstack/svelte-query";
import { render, waitFor } from "@testing-library/svelte";
import { mockPaginatedTransport } from "test-utils";
import { ListResponseSchema, ListService } from "test-utils/gen/list_pb.js";
import { describe, expect, it, vi } from "vitest";

import TestInfiniteQueryComponent from "./test/TestInfiniteQueryComponent.svelte";
import { useQuery } from "./use-query.js";

// TODO: maybe create a helper to take a service and method and generate this.
const methodDescriptor = ListService.method.list;

const mockedPaginatedTransport = mockPaginatedTransport();

describe("useInfiniteQuery", () => {
  it("can query paginated data", async () => {
    const { getByTestId, component } = render(TestInfiniteQueryComponent, {
      props: {
        schema: methodDescriptor,
        input: {
          page: 0n,
        },
        options: {
          getNextPageParam: (lastPage) => lastPage.page + 1n,
          pageParamKey: "page",
        },
        transport: mockedPaginatedTransport,
      },
    });

    await waitFor(() => {
      expect(getByTestId("infinite-query-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("infinite-query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data).toEqual({
      pageParams: ["0"], // BigInt serializes to string in JSON
      pages: [
        {
          $typeName: "ListResponse",
          items: ["-2 Item", "-1 Item", "0 Item"],
          page: "0",
        },
      ],
    });

    await component.fetchNextPage();

    await waitFor(() => {
      expect(getByTestId("infinite-query-is-fetching")).toHaveTextContent("false");
    });

    const updatedDataElement = getByTestId("infinite-query-data");
    const updatedData = JSON.parse(updatedDataElement.textContent || "null");
    expect(updatedData).toEqual({
      pageParams: ["0", "1"],
      pages: [
        {
          $typeName: "ListResponse",
          items: ["-2 Item", "-1 Item", "0 Item"],
          page: "0",
        },
        {
          $typeName: "ListResponse",
          items: ["1 Item", "2 Item", "3 Item"],
          page: "1",
        },
      ],
    });
  });

  it("can be disabled with skipToken", () => {
    const { getByTestId } = render(TestInfiniteQueryComponent, {
      props: {
        schema: methodDescriptor,
        input: skipToken,
        options: {
          getNextPageParam: (lastPage) => lastPage.page + 1n,
          pageParamKey: "page",
        },
        transport: mockedPaginatedTransport,
      },
    });

    expect(getByTestId("infinite-query-is-pending")).toHaveTextContent("true");
    expect(getByTestId("infinite-query-is-fetching")).toHaveTextContent("false");
  });

  it("can be provided a custom transport", async () => {
    const customTransport = mockPaginatedTransport({
      items: ["Intercepted!"],
      page: 0n,
    });

    const { getByTestId } = render(TestInfiniteQueryComponent, {
      props: {
        schema: methodDescriptor,
        input: {
          page: 0n,
        },
        options: {
          getNextPageParam: (lastPage) => lastPage.page + 1n,
          pageParamKey: "page",
          transport: customTransport,
        },
        transport: mockedPaginatedTransport,
      },
    });

    await waitFor(() => {
      expect(getByTestId("infinite-query-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("infinite-query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.pages[0].items).toEqual(["Intercepted!"]);
  });

  it("can be provided other props for svelte-query", () => {
    const { getByTestId } = render(TestInfiniteQueryComponent, {
      props: {
        schema: methodDescriptor,
        input: {
          page: 0n,
        },
        options: {
          getNextPageParam: (lastPage) => lastPage.page + 1n,
          pageParamKey: "page",
          transport: mockPaginatedTransport(undefined, true),
          placeholderData: {
            pageParams: [-1n],
            pages: [
              create(methodDescriptor.output, {
                page: -1n,
                items: [],
              }),
            ],
          },
        },
        transport: mockedPaginatedTransport,
      },
    });

    const dataElement = getByTestId("infinite-query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.pages[0].page).toEqual("-1"); // BigInt serializes to string
  });

  it("page param doesn't persist to the query cache", async () => {
    const { getByTestId, component } = render(TestInfiniteQueryComponent, {
      props: {
        schema: methodDescriptor,
        input: {
          page: 0n,
        },
        options: {
          getNextPageParam: (lastPage) => lastPage.page + 1n,
          pageParamKey: "page",
        },
        transport: mockedPaginatedTransport,
        queryClient: component.queryClient,
      },
    });

    const cache = component.queryClient.getQueryCache().getAll();

    expect(cache).toHaveLength(1);
    expect(cache[0].queryKey).toEqual(
      createConnectQueryKey({
        schema: methodDescriptor,
        transport: mockedPaginatedTransport,
        cardinality: "infinite",
        pageParamKey: "page",
        input: {},
      }),
    );

    await waitFor(() => {
      expect(getByTestId("infinite-query-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("infinite-query-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.pageParams[0]).toEqual("0"); // BigInt serializes to string
  });

  it("cache can be invalidated with the shared, non-infinite key", async () => {
    const onSuccessSpy = vi.fn();
    const spiedQueryCache = new QueryCache({
      onSuccess: onSuccessSpy,
    });

    const { getByTestId, component } = render(TestInfiniteQueryComponent, {
      props: {
        schema: methodDescriptor,
        input: {
          page: 0n,
        },
        options: {
          getNextPageParam: (lastPage) => lastPage.page + 1n,
          pageParamKey: "page",
        },
        transport: mockedPaginatedTransport,
        queryClientConfig: { queryCache: spiedQueryCache },
      },
    });

    await waitFor(() => {
      expect(getByTestId("infinite-query-is-success")).toHaveTextContent("true");
    });

    expect(onSuccessSpy).toHaveBeenCalledTimes(1);

    await component.queryClient.invalidateQueries({
      queryKey: createConnectQueryKey({
        schema: methodDescriptor,
        transport: mockedPaginatedTransport,
        cardinality: undefined,
        pageParamKey: "page",
        input: {
          page: 0n,
        },
      }),
    });

    expect(onSuccessSpy).toHaveBeenCalledTimes(2);
  });

  it("cache can be invalidated with a non-exact key", async () => {
    const onSuccessSpy = vi.fn();
    const spiedQueryCache = new QueryCache({
      onSuccess: onSuccessSpy,
    });

    const { getByTestId, component } = render(TestInfiniteQueryComponent, {
      props: {
        schema: methodDescriptor,
        input: {
          page: 0n,
        },
        options: {
          getNextPageParam: (lastPage) => lastPage.page + 1n,
          pageParamKey: "page",
        },
        transport: mockedPaginatedTransport,
        queryClientConfig: { queryCache: spiedQueryCache },
      },
    });

    await waitFor(() => {
      expect(getByTestId("infinite-query-is-success")).toHaveTextContent("true");
    });

    expect(onSuccessSpy).toHaveBeenCalledTimes(1);

    await component.queryClient.invalidateQueries({
      exact: false,
      queryKey: createConnectQueryKey({
        schema: methodDescriptor,
        cardinality: "infinite",
      }),
    });

    expect(onSuccessSpy).toHaveBeenCalledTimes(2);
  });
});
