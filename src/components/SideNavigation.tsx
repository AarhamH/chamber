import { createSignal, onMount } from "solid-js"
import { Button } from "./Button"
import { invoke } from "@tauri-apps/api/tauri"
import { Playlist } from "~/utils/types"
import { useNavigate } from "@solidjs/router"
import { playlists, setPlaylists } from "~/store/store"
import { BiRegularHomeAlt2 } from "solid-icons/bi"
import { FaRegularFolderOpen } from "solid-icons/fa"
import { IoSearchOutline } from "solid-icons/io"
import Modal from "./Modal"

export const SideNavigation = () => {
  const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = createSignal(false);
  const closePlaylistModal = () => setIsAddPlaylistModalOpen(false);
  const [playlistTitle, setPlaylistTitle] = createSignal("");
  
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

  const handleInput = (e: InputEvent) => {
    const newInput = e.target as HTMLInputElement;
    setPlaylistTitle(newInput.value); // Just set the local state without invoking update
  };

  async function addPlaylist(title: string) {
    const playlistArg = {
      title: title,
      created_on: new Date().toISOString(),
    };
    await invoke("create_playlist", { playlistArg });
    fetchPlaylists();
    scrollToBottom();
    closePlaylistModal();
  }

  function scrollToBottom() {
    playlistRef.scrollTop = playlistRef.scrollHeight; 
  }

  return (
    <div class="bg-zinc-900 h-full w-full flex flex-col">
      <div class="flex items-center justify-center mt-10 mb-4 text-4xl">
        <span>chamber</span>
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
          <Button class="w-full" variant={"filled"} onClick={() => setIsAddPlaylistModalOpen(true)}>(+) Add Playlist</Button>
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
      {isAddPlaylistModalOpen() && (
        <Modal size="sm" isShown={isAddPlaylistModalOpen()} closeModal={closePlaylistModal}>
          <div class="flex flex-col items-center justify-center mt-5">
            <div class="mb-2 text-center">Enter Playlist Title</div>
            <input
              type="text"
              onInput={handleInput}  
              onKeyPress={(e) => e.key === "Enter" && playlistTitle().trim() !== "" ? addPlaylist(playlistTitle()) : null}
              class="font-medium text-2xl rounded-sm border border-white-500"
            />
            <Button class="w-20 mt-5" size={"sm"} onClick={() => playlistTitle().trim() !== "" ? addPlaylist(playlistTitle()) : null} variant={"filled"}>Insert</Button>
          </div>  
        </Modal>
      )}
    </div>
  );
}