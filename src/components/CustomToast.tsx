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
          closeButton: "bg-zinc-950 hover:text-zinc-950",
        },
      }}
      closeButton={true}
      icons={{}}
    />
  )
}

export default CustomToast;