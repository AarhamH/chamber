import type { JSX, ValidComponent } from "solid-js"
import { createSignal, onMount, splitProps } from "solid-js"
import type { PolymorphicProps } from "@kobalte/core"
import * as NavigationMenuPrimitive from "@kobalte/core/navigation-menu"
import { cn } from "~/lib/utils"
import { Button } from "./Button"
import { invoke } from "@tauri-apps/api/tauri"
import { Playlist } from "~/interfaces/interfaces"

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
        "group/menu flex flex-1 list-none data-[orientation=vertical]:flex-col [&>li]:w-full",
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

type SideNavigationProps = {
  setActiveComponent: (_component: string) => void;
}

export const SideNavigation = (props:SideNavigationProps) => {
  const palmTree = "https://img.icons8.com/?size=100&id=10718&format=png&color=FFFFFF"
  const emptyFolder = "https://img.icons8.com/?size=100&id=43325&format=png&color=737373"
  const homeIcon = "https://img.icons8.com/?size=100&id=z6m63h25vYs2&format=png&color=FFFFFF"
  const searchIcon = "https://img.icons8.com/?size=100&id=elSdeHsB03U3&format=png&color=FFFFFF"
  
  const [playlists, setPlaylists] = createSignal<Playlist[]>([]);

  onMount(async () => {
    try {
      const result = await invoke<Playlist[]>("get_all_playlists");
      setPlaylists(result);
    } catch (error) {
      return error;
    }
  });

  return (
    <div>
      <NavigationMenu class="bg-neutral-900 min-w-48 h-screen overflow-hidden " orientation="vertical">
        <div class="font-title flex items-center justify-center mt-10 mb-4 text-4xl font-bold">
          <img class="w-8 mr-2" src={palmTree}/>
          <span>Palm</span>
        </div>
        <div>
          <Button onClick={() => {props.setActiveComponent("home")}} variant="default" class="flex space-x-2 px-10">
            <img class="w-5" src={homeIcon} />
            <span>Home</span>
          </Button> 
          <Button onClick={() => {props.setActiveComponent("search")}} variant="default" class="flex space-x-2 px-10">
            <img class="w-5" src={searchIcon} />
            <span>Search</span>
          </Button> 
          <div class="mt-10">
            <Button variant="filled" size="lg">(+) Add Playlist</Button>
          </div>
        </div>

        <div class="border-white-500 border-t max-h-screen overflow-y-auto mt-5">
          <div class="flex flex-col items-center justify-center">
            {playlists().length > 0 ? (
              playlists().map((playlist,index) => (
                <Button variant="default" class="flex justify-between items-center text-left">
                  <div class="p-2">
                    {index + 1 + "."}
                  </div>
                  <span class="flex-grow">{playlist.title}</span>
                  <i class="fas fa-icon-class p-2">(i)</i>
                </Button>
              ))
            ) : (
              <div class="flex flex-col items-center justify-center mt-12">
                <img class="w-16" src={emptyFolder} alt="Empty Folder" />
                <span class="text-neutral-400 text-lg m-4">No Playlist</span>
              </div>
            )}
          </div> 
        </div>
      </NavigationMenu>
    </div>
  );
}