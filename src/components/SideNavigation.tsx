import { NavigationMenu } from "~/components/ui/navigation-menu"
import { Button } from "~/components/ui/button";

export const SideNavigation = () => {
  return (
    <NavigationMenu class="bg-neutral-900" orientation="vertical">
      <Button variant="ghost" size="lg">Home</Button>
      <Button variant="ghost" size="lg">Search</Button>
    </NavigationMenu>
  );
}