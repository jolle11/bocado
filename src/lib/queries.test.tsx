import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { useMealsOfDay } from "./queries";

const getFullList = vi.fn().mockResolvedValue([]);

vi.mock("./pocketbase", () => ({
	pb: {
		collection: () => ({ getFullList }),
		filter: vi.fn().mockReturnValue("day-filter"),
	},
}));

describe("useMealsOfDay", () => {
	it("solicita primero las entradas más recientes", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const wrapper = ({ children }: PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(
			() => useMealsOfDay(new Date("2026-07-29T12:00:00")),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getFullList).toHaveBeenCalledWith(
			expect.objectContaining({ sort: "-eaten_at" }),
		);
	});
});
