import { onMount } from "solid-js"
import { Button } from "./Button"
import { invoke } from "@tauri-apps/api/tauri"
import { Playlist } from "~/utils/types"
import { useNavigate } from "@solidjs/router"
import { playlists, setPlaylists } from "~/store/store"
import { BiRegularHomeAlt2 } from "solid-icons/bi"
import { FaRegularFolderOpen } from "solid-icons/fa"
import { IoSearchOutline } from "solid-icons/io"

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
    <div class="bg-neutral-900 w-64 h-screen flex flex-col">
      <div class="font-title flex items-center justify-center mt-10 mb-4 text-4xl font-bold">
        <span>Palm</span>
      </div>
      <div>
        <Button class="flex space-x-2 px-10" onClick={() => navigate("/")}>
          <BiRegularHomeAlt2 size={24} />
          <p>Home</p>
        </Button>
        <Button class="flex space-x-2 px-10" onClick={() => navigate("/search")}>
          <IoSearchOutline size={24} />
          <p>Search</p>
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
              <span class="flex-grow text-left truncate"  >{playlist.title}</span>
              <i class="fas fa-icon-class p-2">(i)</i>
            </Button>
          ))
        ) : (
          <div class="flex flex-col items-center justify-center mt-12">
            <FaRegularFolderOpen size={64} />
            <span class="text-neutral-400 text-lg m-4">No Playlist</span>
          </div>
        )}
      </div>
    </div>
  );
}