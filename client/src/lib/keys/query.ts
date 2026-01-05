export const pipeKeys = {
    all: ["pipes"] as const,
    lists: () => [...pipeKeys.all, "list"] as const,
    detail: (id: string) => [...pipeKeys.all, "detail", id] as const,
};
