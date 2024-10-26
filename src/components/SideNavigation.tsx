import { createSignal, onMount } from "solid-js"
import { Button } from "./Button"
import { invoke } from "@tauri-apps/api/tauri"
import { Playlist } from "~/utils/types"
import { useNavigate } from "@solidjs/router"
import { playlists, setPlaylists } from "~/store/store"
import { BiRegularHomeAlt2 } from "solid-icons/bi"
import { FaRegularFolderOpen } from "solid-icons/fa"
import { IoSearchOutline } from "solid-icons/io"
import chamberWhite from "~/assets/chamber_logo_white.svg"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog"
import { TextField, TextFieldInput } from "./TextField"
import { toast } from "solid-sonner"
import { TbRotate2 } from "solid-icons/tb"

export const SideNavigation = () => {
  const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = createSignal(false);
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
    try {
      const playlistArg = {
        title: title,
        created_on: new Date().toISOString(),
      };
      await invoke("create_playlist", { playlistArg });
      fetchPlaylists();
      scrollToBottom();
      setPlaylistTitle("");
    } catch (error) {
      return new Error(String(error));
    }
  }

  function scrollToBottom() {
    playlistRef.scrollTop = playlistRef.scrollHeight; 
  }

  function triggerModal() {
    setIsAddPlaylistModalOpen(!isAddPlaylistModalOpen());
  }
  return (
    <div class="bg-zinc-900 h-full w-full flex flex-col">
      <div class="flex items-center justify-center mt-10 mb-4 text-3xl font-thin">
        <img src={chamberWhite} class="w-7 h-7 m-1" />
        <span>chamber</span>
      </div>
      <div>
        <Button class="flex gap-3 px-10" onClick={() => navigate("/")}>
          <BiRegularHomeAlt2 size={"1.4em"} />
          <p>Home</p>
        </Button>
        <Button class="flex items-center gap-3 px-10" onClick={() => navigate("/search")}>
          <IoSearchOutline size={"1.4em"}/>
          <p>Search</p>
        </Button>
        <Button class="flex items-center gap-3 px-10" onClick={() => navigate("/transcoding")}>
          <TbRotate2 size={"1.4em"}/>
          <p>Transcoding</p>
        </Button>
        <div class="mt-10">
          <Dialog open={isAddPlaylistModalOpen()} onOpenChange={setIsAddPlaylistModalOpen}>
            <DialogTrigger class="w-full" as={Button} variant={"filled"}>(+) Add Playlist</DialogTrigger>
            <DialogContent class="w-96 h-48">
              <DialogHeader class="flex items-center justify-center gap-2">
                <DialogTitle>Enter Group Title</DialogTitle>
                <TextField>
                  <TextFieldInput 
                    class="w-full" 
                    type="text"
                    onInput={handleInput}   
                    placeholder="Group name"
                    onKeyPress={(e: KeyboardEvent) => {
                      if (e.key == "Enter" &&playlistTitle().trim() !== "") {
                        addPlaylist(playlistTitle()).then((result) => {
                          const isError = result instanceof Error;
                          (() => isError ? toast.error(result.message) : toast.success("Successfully created playlist"))();
                          triggerModal();
                        });
                      }
                    }}
                  />
                </TextField>
                <Button 
                  class="w-20 mt-5" size={"sm"} 
                  disabled={playlistTitle().trim() === ""}
                  variant={"filled"} 
                  onClick={() => {
                    if (playlistTitle().trim() !== "") {
                      addPlaylist(playlistTitle()).then((result) => {
                        const isError = result instanceof Error;
                        (() => isError ? toast.error(result.message) : toast.success("Successfully created playlist"))();
                        triggerModal();
                      });
                    }
                  }}
                >
                  Insert
                </Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div class="border-t border-white-500 max-h-screen overflow-y-auto mt-5 flex-1" ref={playlistRef}>
        {playlists.length > 0 ? (
          playlists.map((playlist, index) => (
            <Button class="flex justify-between w-full" onClick={() => navigate(`/playlist/${playlist.id}`)}>
              <span class="p-2">{index + 1}.</span>
              <span class="flex-grow text-left truncate">{playlist.title}</span>
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