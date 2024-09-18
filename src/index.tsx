/* @refresh reload */
import "./App.css"
import { render } from "solid-js/web";
import { Route, Router, useParams } from "@solidjs/router"
import { SideNavigation } from "./components/SideNavigation";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import {ColorModeProvider} from "@kobalte/core"
import { createEffect, createSignal, JSX } from "solid-js";
import { PlaylistPage } from "./pages/PlaylistPage";

type AppProps = {
  children?: JSX.Element;
};

const App = (props: AppProps) => {
  const params = useParams();
  let scrollContainerRef!: HTMLDivElement;
  const [id, setId] = createSignal("");
  
  createEffect(() => {
    if(`${params.id}` !== id()) {
      setId(`${params.id}`);
      scrollContainerRef.scrollTop = 0;
    }
  }, params.id);
  
  return (
    <>
      <ColorModeProvider initialColorMode="dark">
        <div class="flex flex-row">
          <div class="flex-shrink-0">
            <SideNavigation />
          </div>
          <div class="flex-1 max-h-screen overflow-auto" ref={scrollContainerRef}>
            {props.children}
          </div>
        </div>
      </ColorModeProvider>
    </>
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/playlist/:id" component={PlaylistPage} />
    </Router>), 
  document.getElementById("root") as HTMLElement);
