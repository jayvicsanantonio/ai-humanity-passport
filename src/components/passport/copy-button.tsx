"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
			toast.success("Badge markdown copied to clipboard!");
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy text:", error);
			toast.error("Failed to copy to clipboard");
		}
	};

	return (
		<Button
			onClick={handleCopy}
			variant="outline"
			size="sm"
			className={`absolute top-2 right-2 transition-all duration-200 ${className}`}
		>
			{copied ? (
				<>
					<Check className="w-4 h-4" />
					Copied!
				</>
			) : (
				<>
					<Copy className="w-4 h-4" />
					Copy
				</>
			)}
		</Button>
	);
}
