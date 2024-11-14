import { createSignal, onMount } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/tauri"
import { Playlist } from "~/utils/types"
import { playlists, setPlaylists } from "~/store/store"
import { BiRegularHomeAlt2 } from "solid-icons/bi"
import { FaRegularFolderOpen, FaSolidMicrophone } from "solid-icons/fa"
import { IoSearchOutline } from "solid-icons/io"
import { TbRotate2, TbWaveSine, TbCut } from "solid-icons/tb"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~/components/solidui/Dropdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/solidui/Dialog"
import { TextField, TextFieldInput } from "./solidui/TextField"
import { Button } from "~/components/solidui/Button"
import { toast } from "solid-sonner"
import chamberLight from "~/assets/chamber-light.svg"
import chamberDark from "~/assets/chamber-dark.svg"
import { useColorMode } from "@kobalte/core"
import { CgMusicNote } from "solid-icons/cg"

export const SideNavigation = () => {
  /* States and references */
  const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = createSignal(false);
  const [playlistTitleInput, setPlaylistTitleInput] = createSignal("");
  const navigate = useNavigate();
  const {colorMode} = useColorMode();
  let playlistRef!: HTMLDivElement;

  /* Functions */
  // retreieve playlists from database
  const fetchPlaylists = async () => {
    const result = await invoke<Playlist[]>("get_all_playlists").catch((error) => error);
    if (result instanceof Error) return toast.error(result.message);
    setPlaylists(result);
  };
  
  const retrievePlaylistTitleInput = (e: InputEvent) => {
    const newInput = e.target as HTMLInputElement;
    setPlaylistTitleInput(newInput.value);
  };

  const isPlaylistTitleInputEmpty = () => playlistTitleInput().trim() === "";

  const addPlaylist = async (title: string) => {
    if(isPlaylistTitleInputEmpty()) {
      return toast.error("Playlist title cannot be empty");
    } 

    const playlistArg = {
      title: title,
      created_on: new Date().toISOString(),
    };

    const result = await invoke("create_playlist", { playlistArg }).catch((error) => error);
    if(result instanceof Error) return toast.error(result.message);

    // refetch the playlist to update newly added playlist
    fetchPlaylists();

    // scroll to bottom and reset input state
    playlistRef.scrollTop = playlistRef.scrollHeight;
    setPlaylistTitleInput("");
    toggleModal();

    return toast.success("Successfully created playlist");
  }

  const toggleModal = () => {
    setIsAddPlaylistModalOpen(!isAddPlaylistModalOpen());
  }

  /* Effects and Mounts/Cleanups */
  onMount(fetchPlaylists);

  return (
    <div class="bg-sidenavigation h-full w-full flex flex-col shadow-lg">
      <div class="flex items-center justify-center mt-10 mb-4 text-3xl font-thin">
        <img src={colorMode() === "dark" ? chamberLight : chamberDark} class="w-12 h-12" />
        <span>chamber</span>
      </div>
      <div>
        <Button class="flex gap-3 px-10" onClick={() => navigate("/")}>
          <BiRegularHomeAlt2 size={"1.4em"} />
          <p>Home</p>
        </Button>
        <Button class="flex items-center gap-3 px-10" onClick={() => navigate("/audios")}>
          <CgMusicNote size={"1.4em"}/>
          <p>Audios</p>
        </Button>
        <Button class="flex items-center gap-3 px-10" onClick={() => navigate("/search")}>
          <IoSearchOutline size={"1.4em"}/>
          <p>Search</p>
        </Button>
        <Button class="flex items-center gap-3 px-10" onClick={() => navigate("/transcoding")}>
          <TbRotate2 size={"1.4em"}/>
          <p>Transcoding</p>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} class="flex items-center gap-3 px-10">
            <TbWaveSine size={"1.4em"}/>
            <p>Waveform</p>
          </DropdownMenuTrigger>
          <DropdownMenuContent >
            <DropdownMenuItem class="flex items-center gap-3" onClick={() => navigate("/wave/effect")}>
              <FaSolidMicrophone size={"1.4em"}/>
              <p>Recorder</p>
            </DropdownMenuItem>
            <DropdownMenuItem class="flex items-center gap-3" onClick={() => navigate("/wave/trimmer")}>
              <TbCut size={"1.4em"}/>
              <p>Trimmer</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>                    
        <div class="mt-10">
          <Dialog open={isAddPlaylistModalOpen()} onOpenChange={setIsAddPlaylistModalOpen}>
            <DialogTrigger class="w-full" as={Button} variant={"filled"}>(+) Add Playlist</DialogTrigger>
            <DialogContent class="w-96 h-48">
              <DialogHeader class="flex items-center justify-center gap-2">
                <DialogTitle>Enter Group Title</DialogTitle>
                <TextField>
                  <TextFieldInput 
                    class="w-full" 
                    maxLength={40}
                    type="text"
                    onInput={retrievePlaylistTitleInput}   
                    placeholder="Group name"
                    onKeyPress={(e: KeyboardEvent) => {
                      if (e.key == "Enter") {
                        addPlaylist(playlistTitleInput())
                      }
                    }}
                  />
                </TextField>
                <Button 
                  class="w-20 mt-5" size={"sm"} 
                  disabled={isPlaylistTitleInputEmpty()}
                  variant={"filled"} 
                  onClick={() => addPlaylist(playlistTitleInput())}>
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