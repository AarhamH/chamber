import chamberLight from "~/assets/chamber-light.svg"
import chamberDark from "~/assets/chamber-dark.svg"
import { useColorMode } from "@kobalte/core";
import { Table, TableCell, TableRow } from "~/components/solidui/Table";
import { onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { audio, setAudio } from "~/store/store";
import { toast } from "solid-sonner";
export const HomePage = () => {
  const {colorMode} = useColorMode();

  const fetchAllAudio = async () => { 
    const result = await invoke<typeof Audio[]>("get_all_audio").catch((error) => error);
    if (result instanceof Error) return toast.error(result.message);
    setAudio(result);
  }

  onMount(fetchAllAudio);

  return(
    <div class="h-full flex flex-col items-center justify-center">
      <img src={colorMode() === "dark" ? chamberLight : chamberDark} alt="Chamber Logo" class="w-1/12" />
      <span class="text-6xl font-extralight">Welcome to chamber</span>
      { audio.length === 0 ? (
        <a class="mt-10" href="/search">Get Started!</a>
      ) : (
        <div class="flex flex-row gap-5 mt-10 border-2 border-secondary p-4 rounded-lg w-3/4">
          <Table>
            <a href="/audios" class="text-lg underline">Recently Added</a>
            {
              audio.slice(-5).reverse().map((audio_item) => (
                <TableRow>
                  <TableCell>{audio_item.title}</TableCell>
                  <TableCell>{audio_item.author}</TableCell>
                  <TableCell>{audio_item.duration}</TableCell>
                </TableRow>
              ))
            }
          </Table>
          {audio.filter(audio_item => audio_item.path.includes("-converted_to-")).length > 0 && (
            <Table>
              <a href="/transcoding" class="text-lg underline">Recently Transcoded</a>
              {
                audio.filter(audio_item => audio_item.path.includes("-converted_to-")).slice(-5).reverse().map((audio_item) => (
                  <TableRow>
                    <TableCell>{audio_item.title}</TableCell>
                    <TableCell>{audio_item.audio_type}</TableCell>
                    <TableCell>{audio_item.duration}</TableCell>
                  </TableRow>
                ))
              }
            </Table>
          )}
          {audio.filter(audio_item => audio_item.path.includes("-trimmed-to-")).length > 0 && (
            <Table>
              <a href="/wave/trimmer" class="text-lg underline">Recently Trimmed</a>
              {
                audio.filter(audio_item => audio_item.path.includes("-trimmed-to-")).slice(-5).reverse().map((audio_item) => (
                  <TableRow>
                    <TableCell>{audio_item.title}</TableCell>
                    <TableCell>{audio_item.duration}</TableCell>
                  </TableRow>
                ))
              }
            </Table>
          )}
        </div>
      )}
    </div>
  )
}