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
import type { ConnectQueryKey } from "@connectrpc/connect-query-core";
import {
  callUnaryMethod,
  createConnectQueryKey,
} from "@connectrpc/connect-query-core";
import type { QueryFunctionContext } from "@tanstack/svelte-query";
import { createQueries } from "@tanstack/svelte-query";
import { render, waitFor } from "@testing-library/svelte";
import { mockEliza } from "test-utils";
import type { SayRequest } from "test-utils/gen/eliza_pb.js";
import { ElizaService, SayRequestSchema } from "test-utils/gen/eliza_pb.js";
import { describe, expect, it } from "vitest";

import TestCallUnaryMethodComponent from "./test/TestCallUnaryMethodComponent.svelte";

describe("callUnaryMethod", () => {
  it("can be used with createQueries", async () => {
    const transport = mockEliza({
      sentence: "Response 1",
    });

    const { getByTestId } = render(TestCallUnaryMethodComponent, {
      props: {
        transport,
        input: create(SayRequestSchema, {
          sentence: "query 1",
        }),
        schema: ElizaService.method.say,
      },
    });

    await waitFor(() => {
      expect(getByTestId("query1-is-success")).toHaveTextContent("true");
    });

    const dataElement = getByTestId("query1-data");
    const data = JSON.parse(dataElement.textContent || "null");
    expect(data?.sentence).toEqual("Response 1");
  });
});
