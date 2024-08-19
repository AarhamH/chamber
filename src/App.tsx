import "./App.css"
import {ColorModeProvider} from "@kobalte/core"
import { SideNavigation } from "./components/SideNavigation";

export default function App() {
  return (
    <ColorModeProvider initialColorMode="dark">
      <SideNavigation/>
    </ColorModeProvider>
  );
}