"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Wand2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import { usePipeWizard } from "@/store/pipe-wizard";
import { PipeConfigSchema } from "@/lib/schema/pipe";
import { useCreatePipe } from "@/hooks/use-pipe";

// --- Step Schemas ---
const Step1Schema = PipeConfigSchema.pick({ name: true, slug: true, target_url: true });
const Step2Schema = PipeConfigSchema.pick({ jq_filter: true });

type Step1Values = z.infer<typeof Step1Schema>;
type Step2Values = z.infer<typeof Step2Schema>;

export function AddPipeDialog() {
    const [open, setOpen] = useState(false)

    const { data, reset, setStep, currentStep } = usePipeWizard()

    const {
        mutate: createPipe,
        isPending,
        isSuccess,
        reset: resetMutation,
    } = useCreatePipe()

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)

        if (isOpen) {
            resetMutation()
            setStep(1)
        }
    }

    const submitFinal = () => {
        const parsed = PipeConfigSchema.safeParse(data)
        if (!parsed.success) return

        createPipe(parsed.data)
    }

    useEffect(() => {
        if (isSuccess) {
            setOpen(false)
            reset()
        }
    }, [isSuccess, reset])

    useEffect(() => {
        if (isSuccess) {
            setOpen(false)
            reset()
        }
    }, [isSuccess, reset])

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Create New Pipe
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125 overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Create Pipe</DialogTitle>
                    <DialogDescription>
                        Step {currentStep} of 2: {currentStep === 1 ? "Basic Details" : "Processing Rules"}
                    </DialogDescription>
                </DialogHeader>

                {/* Animated Progress Bar */}
                <div className="h-1 w-full bg-slate-100 mt-2 overflow-hidden rounded-full">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "50%" }}
                        animate={{ width: currentStep === 1 ? "50%" : "100%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                <div className="py-4">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Step1Form />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Step2Form
                                    onComplete={submitFinal}
                                    isLoading={isPending}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- Step 1: Essentials ---
function Step1Form() {
    const { setStep, updateData, data } = usePipeWizard();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Step1Values>({
        resolver: zodResolver(Step1Schema),
        defaultValues: {
            name: data.name || "",
            slug: data.slug || "",
            target_url: data.target_url || "",
        },
    });

    const onSubmit = (values: Step1Values) => {
        updateData(values);
        setStep(2);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-4">
                <Field>
                    <FieldLabel>Pipe Name</FieldLabel>
                    <FieldContent>
                        <Input
                            placeholder="My Webhook Pipe"
                            {...register("name")}
                        />
                    </FieldContent>
                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>Slug</FieldLabel>
                        <FieldContent>
                            <Input
                                placeholder="my-pipe"
                                {...register("slug")}
                            />
                        </FieldContent>
                        {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>Target URL</FieldLabel>
                        <FieldContent>
                            <Input
                                placeholder="https://api.site.com/hook"
                                {...register("target_url")}
                            />
                        </FieldContent>
                        {errors.target_url && <FieldError>{errors.target_url.message}</FieldError>}
                    </Field>
                </div>
            </FieldGroup>

            <DialogFooter className="mt-6">
                <Button type="submit">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogFooter>
        </form>
    );
}

// --- Step 2: Advanced / Filter ---
function Step2Form({ onComplete, isLoading }: { onComplete: () => void, isLoading: boolean }) {
    const { setStep, updateData, data } = usePipeWizard();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Step2Values>({
        resolver: zodResolver(Step2Schema),
        defaultValues: {
            jq_filter: data.jq_filter || ".",
        },
    });

    const onSubmit = (values: Step2Values) => {
        updateData(values);
        onComplete();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-4">
                <Field>
                    <div className="flex justify-between items-baseline mb-2">
                        <FieldLabel>JQ Filter (Optional)</FieldLabel>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Advanced</span>
                    </div>
                    <FieldContent>
                        <Textarea
                            placeholder="e.g. .data | { id: .id }"
                            className="font-mono text-sm min-h-30 resize-none"
                            {...register("jq_filter")}
                        />
                    </FieldContent>
                    <p className="text-xs text-muted-foreground mt-2">
                        Apply jq transformation rules to the incoming payload.
                    </p>
                    {errors.jq_filter && <FieldError>{errors.jq_filter.message}</FieldError>}
                </Field>
            </FieldGroup>

            <DialogFooter className="mt-6 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                        </>
                    ) : (
                        <>
                            Create Pipe <Check className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}
