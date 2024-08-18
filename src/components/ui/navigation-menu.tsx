import type { JSX, ValidComponent } from "solid-js"
import { splitProps } from "solid-js"

import type { PolymorphicProps } from "@kobalte/core"
import * as NavigationMenuPrimitive from "@kobalte/core/navigation-menu"

import { cn } from "~/lib/utils"

type NavigationMenuProps<T extends ValidComponent = "ul"> =
  NavigationMenuPrimitive.NavigationMenuRootProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const NavigationMenu = <T extends ValidComponent = "ul">(
  props: PolymorphicProps<T, NavigationMenuProps<T>>
) => {
  const [local, others] = splitProps(props as NavigationMenuProps, ["class", "children"])
  return (
    <NavigationMenuPrimitive.Root
      gutter={6}
      class={cn(
        "group/menu flex h-screen w-max flex-1 list-none data-[orientation=vertical]:flex-col [&>li]:w-full",
        local.class
      )}
      {...others}
    >
      {local.children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
}

type NavigationMenuViewportProps<T extends ValidComponent = "li"> =
  NavigationMenuPrimitive.NavigationMenuViewportProps<T> & { class?: string | undefined }

const NavigationMenuViewport = <T extends ValidComponent = "li">(
  props: PolymorphicProps<T, NavigationMenuViewportProps<T>>
) => {
  const [local, others] = splitProps(props as NavigationMenuViewportProps, ["class"])
  return (
    <NavigationMenuPrimitive.Viewport
      class={cn(
        "pointer-events-none z-[1000] flex h-[var(--kb-navigation-menu-viewport-height)] w-[var(--kb-navigation-menu-viewport-width)] origin-[var(--kb-menu-content-transform-origin)] items-center justify-center overflow-x-clip overflow-y-visible rounded-md border bg-popover opacity-0 shadow-lg transition-[width,height] duration-200 ease-in data-[expanded]:pointer-events-auto data-[orientation=vertical]:overflow-y-clip data-[orientation=vertical]:overflow-x-visible data-[expanded]:rounded-md data-[expanded]:opacity-100 data-[expanded]:ease-out",
        local.class
      )}
      {...others}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuViewport,
}
