import type { JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import * as ButtonPrimitive from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "items-center w-full text-sm font-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        filled: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-9 rounded-md",
        lg: "h-12 px-4",
        icon: "size-10"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
);

export type ButtonProps<T extends ValidComponent = "button"> = ButtonPrimitive.ButtonRootProps<T> &
  VariantProps<typeof buttonVariants> & { class?: string | undefined; children?: JSX.Element };

export const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>
) => {
  const [local, others] = splitProps(props as ButtonProps, ["variant", "size", "class"]);
  const buttonClass = cn(buttonVariants({ variant: local.variant, size: local.size }), local.class);
  
  return (
    <ButtonPrimitive.Root class={buttonClass} {...others} />
  );
};
