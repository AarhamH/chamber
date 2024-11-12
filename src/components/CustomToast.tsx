import { Toaster } from "solid-sonner"

export const CustomToast = () => {
  return (
    <Toaster
      toastOptions={{
        classes: {
          error: "text-error",
          success: "text-success",
          toast: "bg-background",
        },
      }}
      position="top-center"
    />
  )
}