import { Toaster } from "solid-sonner"

const CustomToast = () => {
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

export default CustomToast;