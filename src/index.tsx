/* @refresh reload */
import "./App.css"
import { render } from "solid-js/web";
import { Route, Router, useParams } from "@solidjs/router"
import { SideNavigation } from "./components/SideNavigation";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { ColorModeProvider, ColorModeScript, createLocalStorageManager } from "@kobalte/core"
import { createEffect, createSignal, JSX } from "solid-js";
import { PlaylistPage } from "./pages/PlaylistPage";
import { PlayBack} from "./components/Playback";
import { AudioProvider } from "./components/AudioContext";
import { Transcoding } from "./pages/Transcoding";
import { CustomToast } from "./components/CustomToast";
import { WaveRecorder } from "./pages/waveform/WaveRecorder";
import { WaveTrimmer } from "./pages/waveform/WaveTrimmer";
import { AllAudiosPage } from "./pages/AllAudiosPage";

type AppProps = {
  children?: JSX.Element;
};

const App = (props: AppProps) => {
  const params = useParams();
  let scrollContainerRef!: HTMLDivElement;
  const [id, setId] = createSignal("");
  const storageManager = createLocalStorageManager("vite-ui-theme")
 
  createEffect(() => {
    if(`${params.id}` !== id()) {
      setId(`${params.id}`);
      scrollContainerRef.scrollTop = 0;
    }
  }, params.id);
  
  return (
    <>
      <AudioProvider>
        <ColorModeScript storageType={storageManager.type} />
        <ColorModeProvider initialColorMode="dark" storageManager={storageManager}>
          <div class="flex flex-col h-screen">
            <div class="flex flex-row flex-1 overflow-hidden">
              <div class="flex-shrink-0 w-48">
                <SideNavigation />
              </div>
              <div class="flex-1 max-h-full overflow-x-hidden overflow-y-auto" ref={scrollContainerRef}>
                {props.children}
              </div>
            </div>
            <div class="flex-shrink-0">
              <PlayBack />
            </div>
          </div>
          <CustomToast />
      
        </ColorModeProvider>
      </AudioProvider>
    </>
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={HomePage} />
      <Route path="/audios" component={AllAudiosPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/transcoding" component={Transcoding} />
      <Route path="/playlist/:id" component={PlaylistPage} />
      <Route path="/wave/effect" component={WaveRecorder} />
      <Route path="/wave/trimmer" component={WaveTrimmer} />
    </Router>), 
  document.getElementById("root") as HTMLElement);
