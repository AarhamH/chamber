import { onMount } from "solid-js"
import { Button } from "./Button"
import { invoke } from "@tauri-apps/api/tauri"
import { Playlist } from "~/utils/types"
import { useNavigate } from "@solidjs/router"
import { playlists, setPlaylists } from "~/store/store"

const icons = {
  palmTree: "https://img.icons8.com/?size=100&id=10718&format=png&color=FFFFFF",
  emptyFolder: "https://img.icons8.com/?size=100&id=43325&format=png&color=737373",
  homeIcon: "https://img.icons8.com/?size=100&id=z6m63h25vYs2&format=png&color=FFFFFF",
  searchIcon: "https://img.icons8.com/?size=100&id=elSdeHsB03U3&format=png&color=FFFFFF",
};

export const SideNavigation = () => {
  let playlistRef!: HTMLDivElement;

  const navigate = useNavigate();

  const fetchPlaylists = async () => {
    try {
      const result = await invoke<Playlist[]>("get_all_playlists");
      setPlaylists(result);
    } catch (error) {
      return error;
    }
  };
  
  onMount(fetchPlaylists);

  async function addPlaylist() {
    const playlistArg = {
      title: "New Playlist232323",
      created_on: "2021-09-01",
    };
    await invoke("create_playlist", { playlistArg });
    fetchPlaylists();
    scrollToBottom();
  }

  function scrollToBottom() {
    playlistRef.scrollTop = playlistRef.scrollHeight; 
  }

  return (
    <div class="bg-neutral-900 min-w-48 h-screen flex flex-col">
      <div class="font-title flex items-center justify-center mt-10 mb-4 text-4xl font-bold">
        <img class="w-8 mr-2" src={icons.palmTree} alt="Palm Icon" />
        <span>Palm</span>
      </div>
      <div>
        <Button class="flex space-x-2 px-10" onClick={() => navigate("/")}>
          <img class="w-5" src={icons.homeIcon} alt="Home" />
          <span>Home</span>
        </Button>
        <Button class="flex space-x-2 px-10" onClick={() => navigate("/search")}>
          <img class="w-5" src={icons.searchIcon} alt="Search" />
          <span>Search</span>
        </Button>
        <div class="mt-10">
          <Button class="w-full" variant={"filled"} onClick={addPlaylist}>(+) Add Playlist</Button>
        </div>
      </div>
      <div class="border-t border-white-500 max-h-screen overflow-y-auto mt-5 flex-1" ref={playlistRef}>
        {playlists.length > 0 ? (
          playlists.map((playlist, index) => (
            <Button class="flex justify-between w-full" onClick={() => navigate(`/playlist/${playlist.id}`)}>
              <span class="p-2">{index + 1}.</span>
              <span class="flex-grow text-left">{playlist.title}</span>
              <i class="fas fa-icon-class p-2">(i)</i>
            </Button>
          ))
        ) : (
          <div class="flex flex-col items-center justify-center mt-12">
            <img class="w-16" src={icons.emptyFolder} alt="Empty Folder" />
            <span class="text-neutral-400 text-lg m-4">No Playlist</span>
          </div>
        )}
      </div>
    </div>
  );
}