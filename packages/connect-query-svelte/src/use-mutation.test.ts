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
import { render, waitFor } from "@testing-library/svelte";
import { mockPaginatedTransport } from "test-utils";
import { ListResponseSchema, ListService } from "test-utils/gen/list_pb.js";
import { describe, expect, it, vi } from "vitest";

import TestMutationComponent from "./test/TestMutationComponent.svelte";

// TODO: maybe create a helper to take a service and method and generate this.
const methodDescriptor = ListService.method.list;

const mockedPaginatedTransport = mockPaginatedTransport();

describe("useMutation", () => {
  it("performs a mutation", async () => {
    const onSuccess = vi.fn();

    const { getByTestId, component } = render(TestMutationComponent, {
      props: {
        schema: methodDescriptor,
        options: {
          onSuccess,
        },
        transport: mockedPaginatedTransport,
      },
    });

    // Trigger the mutation
    component.triggerMutation({
      page: 0n,
    });

    await waitFor(() => {
      expect(getByTestId("mutation-is-success")).toHaveTextContent("true");
    });

    expect(onSuccess).toHaveBeenCalledWith(
      create(ListResponseSchema, {
        items: ["-2 Item", "-1 Item", "0 Item"],
        page: 0n,
      }),
      {
        page: 0n,
      },
      undefined,
    );
  });

  it("can be provided a custom transport", async () => {
    const { getByTestId, component } = render(TestMutationComponent, {
      props: {
        schema: methodDescriptor,
        options: {
          transport: mockPaginatedTransport({
            page: 1n,
            items: ["Intercepted!"],
          }),
        },
        transport: mockedPaginatedTransport,
      },
    });

    // Trigger the mutation
    component.triggerMutation({
      page: 0n,
    });

    await waitFor(() => {
      expect(getByTestId("mutation-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("mutation-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.items[0]).toBe("Intercepted!");
  });

  it("can forward onMutate params", async () => {
    const onSuccess = vi.fn();

    const { getByTestId, component } = render(TestMutationComponent, {
      props: {
        schema: methodDescriptor,
        options: {
          onMutate: (variables) => {
            return {
              somethingElse: `Some additional context: ${(variables.page ?? 0n) + 2n}`,
            };
          },
          onSuccess: (data, variables, context) => {
            onSuccess(data, variables, context);
            // Customizing on success so we can test the types
            expect(context.somethingElse).toBe("Some additional context: 2");
          },
        },
        transport: mockedPaginatedTransport,
      },
    });

    // Trigger the mutation
    component.triggerMutation({
      page: 0n,
    });

    await waitFor(() => {
      expect(getByTestId("mutation-is-success")).toHaveTextContent("true");
    });

    expect(onSuccess).toHaveBeenCalledWith(
      create(ListResponseSchema, {
        items: ["-2 Item", "-1 Item", "0 Item"],
        page: 0n,
      }),
      {
        page: 0n,
      },
      { somethingElse: "Some additional context: 2" },
    );
  });

  it("handles mutation status correctly", async () => {
    const { getByTestId, component } = render(TestMutationComponent, {
      props: {
        schema: methodDescriptor,
        transport: mockedPaginatedTransport,
      },
    });

    // Initially should be idle
    expect(getByTestId("mutation-status")).toHaveTextContent("idle");
    expect(getByTestId("mutation-is-pending")).toHaveTextContent("false");
    expect(getByTestId("mutation-is-success")).toHaveTextContent("false");

    // Trigger the mutation
    component.triggerMutation({
      page: 0n,
    });

    // Should show pending status
    expect(getByTestId("mutation-is-pending")).toHaveTextContent("true");

    await waitFor(() => {
      expect(getByTestId("mutation-is-success")).toHaveTextContent("true");
    });

    expect(getByTestId("mutation-status")).toHaveTextContent("success");
    expect(getByTestId("mutation-is-pending")).toHaveTextContent("false");
  });
});
