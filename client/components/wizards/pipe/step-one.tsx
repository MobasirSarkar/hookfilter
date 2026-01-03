import { PipeConfigSchema } from "@/lib/schema/pipe";
import { useForm } from "react-hook-form";
import { usePipeWizard } from "@/store/pipe-wizard";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const StepOneSchema = PipeConfigSchema.pick({ name: true, slug: true })
type StepOneData = z.infer<typeof StepOneSchema>

export default function StepOne() {
    const { data, updateData, setStep } = usePipeWizard();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<StepOneData>({
        resolver: zodResolver(StepOneSchema),
        defaultValues: {
            name: data.name || "",
            slug: data.slug || "",
        }
    })

    function onSubmit(values: StepOneData) {
        updateData(values);
        setStep(2)
    }
    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend>Pipe Configuration</FieldLegend>
                        <FieldDescription>
                            Set up the identity for your new webhook gateway.
                        </FieldDescription>

                        {/* --- FIELD 1: NAME --- */}
                        {/* We pass 'data-invalid' to style the field in red on error */}
                        <Field data-invalid={!!errors.name}>
                            <FieldLabel htmlFor="name">Pipe Name</FieldLabel>
                            <Input
                                id="name"
                                placeholder="e.g. Stripe Production"
                                {...register("name")}
                            />
                            {errors.name ? (
                                <FieldError>{errors.name.message}</FieldError>
                            ) : (
                                // Optional: Helper text when no error
                                null
                            )}
                        </Field>

                        {/* --- FIELD 2: SLUG --- */}
                        <Field data-invalid={!!errors.slug}>
                            <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
                            <Input
                                id="slug"
                                placeholder="stripe-payments"
                                {...register("slug")}
                            />
                            {/* Show Description if no error, otherwise show Error */}
                            {errors.slug ? (
                                <FieldError>{errors.slug.message}</FieldError>
                            ) : (
                                <FieldDescription>
                                    Your webhook URL will be: <span className="font-mono text-xs">/u/stripe-payments</span>
                                </FieldDescription>
                            )}
                        </Field>

                    </FieldSet>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Next Step</Button>
                    </div>
                </FieldGroup>
            </form>
        </div>
    );
}
