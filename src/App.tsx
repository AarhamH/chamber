import "./App.css"
import {ColorModeProvider} from "@kobalte/core"
import { SideNavigation } from "./components/SideNavigation";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { createSignal } from "solid-js";

export default function App() {
  const [activeComponent, setActiveComponent] = createSignal("home");

  return (
    <ColorModeProvider initialColorMode="dark">
      <div class="flex flex-row">
        <div class="flex-shrink-0">
          <SideNavigation 
            setActiveComponent={setActiveComponent} 
          />
        </div>
        <div class="flex-1">
          {activeComponent() === "home" && <HomePage />}
          {activeComponent() === "search" && <SearchPage />}
        </div>
      </div>
    </ColorModeProvider>
  );
}