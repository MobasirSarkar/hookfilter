"use client"

import { Pipe } from "@/lib/types"
import { useDeletePipe } from "@/hooks/use-pipe"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function DeletePipeDialog({
    open,
    pipe,
    onCloseAction,
}: {
    open: boolean
    pipe: Pipe | null
    onCloseAction: () => void
}) {
    const { mutate, isPending } = useDeletePipe()

    if (!pipe) return null

    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Pipe</DialogTitle>
                    <DialogDescription>
                        This will permanently delete{" "}
                        <strong>{pipe.name}</strong>.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onCloseAction}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => {
                            mutate(pipe.id, {
                                onSuccess: onCloseAction,
                            })
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
