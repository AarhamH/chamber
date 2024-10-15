import { Toaster } from "solid-sonner"

const CustomToast = () => {
  return (
    <Toaster
      toastOptions={{
        classes: {
          error: "text-red-500",
          success: "text-green-500",
          toast: "bg-zinc-950",
          description: "text-white",
        },
      }}
      position="top-center"
      duration={1500}
    />
  )
}

export default CustomToast;