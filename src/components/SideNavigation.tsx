import { NavigationMenu } from "~/components/ui/navigation-menu"
import { Button } from "~/components/ui/button";

export const SideNavigation = () => {
  const palmTree = "https://img.icons8.com/?size=100&id=10718&format=png&color=FFFFFF"
  return (
    <NavigationMenu class="bg-neutral-900" orientation="vertical">
      <div class="font-title flex items-center justify-center mt-10 mb-4 text-4xl font-bold">
        <img class="w-8 mr-2" src={palmTree}/>
        Palm
      </div>
      <Button variant="ghost" size="lg">Home</Button>
      <Button variant="ghost" size="lg">Search</Button>
    </NavigationMenu>
  );
}