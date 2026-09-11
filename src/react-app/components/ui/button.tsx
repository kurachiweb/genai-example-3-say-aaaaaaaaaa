import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-[20px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:opacity-90",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, ...props }, ref) => (
		<button
			ref={ref}
			className={cn(buttonVariants({ variant }), "h-12 px-6", className)}
			{...props}
		/>
	),
);
Button.displayName = "Button";

export { Button, buttonVariants };
