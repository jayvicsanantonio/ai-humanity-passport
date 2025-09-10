"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
	text: string;
	className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy text:", error);
		}
	};

	return (
		<Button
			onClick={handleCopy}
			variant="outline"
			size="sm"
			className={`absolute top-2 right-2 ${className}`}
		>
			{copied ? "Copied!" : "Copy"}
		</Button>
	);
}
