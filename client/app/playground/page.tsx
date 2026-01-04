"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { JQEditor } from "../(dashboard)/pipes/jq-editor";
import { PayloadViewer } from "../(dashboard)/events/payload-viewer";
import { usePlayground } from "@/hooks/use-playground";

export default function PlaygroundPage() {
    const [jsonInput, setJsonInput] = useState(
        '{\n  "message": "Hello World",\n  "user": {\n    "id": 1,\n    "role": "admin"\n  }\n}'
    );
    const [filter, setFilter] = useState(".");
    const [output, setOutput] = useState<any>(null);

    const playground = usePlayground();

    const handleRun = async () => {
        let parsedJson: any;

        try {
            parsedJson = JSON.parse(jsonInput);
        } catch {
            toast.error("Invalid JSON input");
            return;
        }

        playground.mutate(
            {
                payload: parsedJson,
                filter,
            },
            {
                onSuccess: (res) => {
                    setOutput(res.data?.result);
                    toast.success("Filter applied");
                },
            }
        );
    };

    return (
        <div className="container mx-auto py-6 h-[calc(100vh-80px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">JQ Playground</h1>
                    <p className="text-muted-foreground">
                        Test your filters safely before deploying them.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFilter(".");
                            setOutput(null);
                        }}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>

                    <Button onClick={handleRun} disabled={playground.isPending}>
                        <Play className="w-4 h-4 mr-2" />
                        {playground.isPending ? "Running..." : "Run Filter"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Input */}
                <div className="flex flex-col gap-6 h-full">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium">
                                Input JSON
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <Textarea
                                className="h-full border-0 resize-none font-mono text-sm p-4 focus-visible:ring-0"
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card className="h-50 shrink-0">
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium">
                                JQ Filter
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 border-t">
                            <JQEditor value={filter} onChange={setFilter} />
                        </CardContent>
                    </Card>
                </div>

                {/* Output */}
                <Card className="h-full flex flex-col bg-muted/30">
                    <CardHeader className="py-3 bg-background border-b">
                        <CardTitle className="text-sm font-medium">
                            Output
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 overflow-auto">
                        {output ? (
                            <PayloadViewer data={output} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                Run a filter to see results
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
