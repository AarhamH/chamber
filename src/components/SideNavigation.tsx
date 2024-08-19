import { NavigationMenu } from "~/components/ui/navigation-menu"
import { Button } from "~/components/ui/button";

export const SideNavigation = () => {
  const palmTree = "https://img.icons8.com/?size=100&id=10718&format=png&color=FFFFFF"
  const emptyFolder = "https://img.icons8.com/?size=100&id=43325&format=png&color=737373"
  const homeIcon = "https://img.icons8.com/?size=100&id=z6m63h25vYs2&format=png&color=FFFFFF"
  const searchIcon = "https://img.icons8.com/?size=100&id=elSdeHsB03U3&format=png&color=FFFFFF"
  return (
    <div>
      <NavigationMenu class="bg-neutral-900 w-[12%] min-w-48" orientation="vertical">
        <div class="font-title flex items-center justify-center mt-10 mb-4 text-4xl font-bold">
          <img class="w-8 mr-2" src={palmTree}/>
          <span>Palm</span>
        </div>
        <div>
          <Button variant="ghost" size="lg" class="flex space-x-2">
            <img class="w-5" src={homeIcon} />
            <span>Home</span>
          </Button> 
          <Button variant="ghost" size="lg" class="flex space-x-2">
            <img class="w-5" src={searchIcon} />
            <span>Search</span>
          </Button> 
          <div class="mt-10">
            <Button variant="secondary" size="lg">(+) Add Playlist</Button>
            <div>
              <div class="flex flex-col items-center justify-center mt-12">
                <img class="w-16" src={emptyFolder} />
                <span class="text-neutral-400 text-lg m-4">No Playlist</span>
              </div> 
            </div>
          </div>
        </div>
      </NavigationMenu>
    </div>
  );
}