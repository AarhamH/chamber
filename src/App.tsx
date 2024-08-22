import "./App.css"
import {ColorModeProvider} from "@kobalte/core"
import { SideNavigation } from "./components/SideNavigation";
import { Route, Router } from "@solidjs/router";
import { HomePage } from "./pages/HomePage";

export default function App() {
  return (
    <ColorModeProvider initialColorMode="dark">
      <div class="flex flex-row">
        <div class="flex-shrink-0">
          <SideNavigation/>
        </div>
        <div class="flex-1">
          <Router>
            <Route path="/" component={HomePage} />
          </Router>
        </div>
      </div>
    </ColorModeProvider>
  );
}