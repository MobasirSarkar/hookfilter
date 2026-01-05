"use client"

import { Pipe } from "@/lib/types"
import { PipeConfigSchema } from "@/lib/schema/pipe"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUpdatePipe } from "@/hooks/use-pipe"

type FormValues = z.infer<typeof PipeConfigSchema>

export function UpdatePipeDialog({
    open,
    pipe,
    onCloseAction,
}: {
    open: boolean
    pipe: Pipe | null
    onCloseAction: () => void
}) {
    const { mutate, isPending } = useUpdatePipe()

    const form = useForm<FormValues>({
        resolver: zodResolver(PipeConfigSchema),
        values: pipe ?? undefined,
    })

    if (!pipe) return null

    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Pipe</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit((values) => {
                        mutate(
                            { id: pipe?.id, ...values },
                            { onSuccess: onCloseAction }
                        )
                    })}
                    className="space-y-4"
                >
                    <Input {...form.register("name")} />
                    <Input {...form.register("slug")} />
                    <Input {...form.register("target_url")} />
                    <Textarea {...form.register("jq_filter")} />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onCloseAction}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
