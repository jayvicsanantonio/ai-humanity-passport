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
			className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2 transition-all duration-200 text-xs h-7 sm:h-8 ${className}`}
		>
			{copied ? (
				<>
					<Check className="w-3 h-3 sm:w-4 sm:h-4" />
					<span className="ml-1 hidden sm:inline">Copied!</span>
				</>
			) : (
				<>
					<Copy className="w-3 h-3 sm:w-4 sm:h-4" />
					<span className="ml-1 hidden sm:inline">Copy</span>
				</>
			)}
		</Button>
	);
}
