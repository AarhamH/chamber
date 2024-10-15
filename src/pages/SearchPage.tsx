import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/Table"
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
} from "~/components/Combobox"
import { invoke } from "@tauri-apps/api/tauri"
import { createSignal, createEffect } from "solid-js"
import { IoSearchOutline } from "solid-icons/io"
import { YoutubeQuery } from "~/utils/types"
import { BiRegularAddToQueue } from "solid-icons/bi"
import { BiRegularLink } from "solid-icons/bi"
import { Button } from "~/components/Button"
import { youtubeQueue, setYoutubeQueue } from "~/store/store"
import { IoRemoveCircleOutline } from "solid-icons/io"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/components/Sheet"
import { BiRegularLoaderCircle } from "solid-icons/bi"
import { toast } from "solid-sonner"
import CustomToast from "~/components/CustomToast"

interface SearchSuggestion {
  label: string
  value: string
}

export const SearchPage = () => {
  const [searchInput, setSearchInput] = createSignal<string>("")
  const [searchSuggestions, setSearchSuggestions] = createSignal<SearchSuggestion[]>([])
  const [youtubeQuery, setYoutubeQuery] = createSignal<YoutubeQuery[]>([])
  const [isDownloading, setIsDownloading] = createSignal<boolean>(false)

  const cache = new Map();

  createEffect(() => {
    const input = searchInput();
    if (cache.has(input)) {
      setSearchSuggestions(cache.get(input));
    } else {
      autoComplete(input);
    }
  });
  
  async function autoComplete(input: string) {
    try {
      if (!input) return;
      const suggestions = await invoke<string[]>("youtube_suggestion", { input })
        .then((result) =>
          result.map((suggestion) => ({
            label: suggestion.replace(/"/g, ""),
            value: suggestion.replace(/"/g, "")
          }))
        );
  
      cache.set(input, suggestions);
      setSearchSuggestions(suggestions);
    } catch (error) {
      return error;
    }
  }

  async function search(input: string) {
    try {
      const result = await invoke<YoutubeQuery[]>("youtube_search", { input });
      setYoutubeQuery(result);
    } catch (error) {
      return error;
    }
  }

  async function download(audioList: YoutubeQuery[]) {
    try {
      setIsDownloading(true);
      await invoke("download_audio", { audioList });
    } catch (error) {
      return error;
    } finally {
      setIsDownloading(false);
      setYoutubeQueue([]);
    }
  }

  const addToQueue = (query: YoutubeQuery) => {
    if (youtubeQueue.some((queueItem) => queueItem.url === query.url)) return false;
    setYoutubeQueue((prevQueue) => [...prevQueue, query]);
    return true;
  };

  const removeFromQueue = (itemToRemove: YoutubeQuery) => {
    setYoutubeQueue((prevQueue) => 
      prevQueue.filter((queueItem) => queueItem.url !== itemToRemove.url)
    );
  };

  return (
    <div>
      <Combobox
        options={searchSuggestions()}
        optionValue="value"
        optionTextValue="label"
        optionLabel="label"
        placeholder="Search for an audio..."
        itemComponent={(props) => (
          <ComboboxItem item={props.item}>
            <ComboboxItemLabel>{props.item.rawValue.label}</ComboboxItemLabel>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
        class="w-1/3 mx-auto p-5"
        onChange={(selectedItem) => {
          if (selectedItem) {
            setSearchInput(selectedItem.value);
            search(selectedItem.value);
          }
        }}
      >
        <ComboboxControl aria-label="SearchSuggestions">
          <IoSearchOutline
            class="mr-2 opacity-50 hover:cursor-pointer"
            size={24}
            onClick={() => search(searchInput())}
          />
          <ComboboxInput
            value={searchInput()}
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setSearchInput(value);
              autoComplete(value);
            }}
            onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)} 
          />  
          <Sheet>
            <SheetTrigger class="opacity-50 text-sm">Queue</SheetTrigger>
            <SheetContent class="flex flex-col h-full overflow-y-hidden">
              <SheetHeader>
                <SheetTitle class="sticky top-0 bg-zinc-950 z-10 pt-10">
                  {isDownloading() ? 
                    (
                      <div class="flex flex-row gap-2 items-center">
                        <BiRegularLoaderCircle class="animate-spin" size={32} />
                        Downloading...
                      </div>
                    ): "Download Queue"
                  }
                </SheetTitle>
                <SheetDescription class="flex-grow overflow-auto">
                  {youtubeQueue.map((query) => (
                    <div class="flex items-center p-4">
                      <img src={query.thumbnail} class="rounded-md" width={120} height={90} />
                      <div class="flex flex-col ml-2">
                        <span class="text-sm">{query.title}</span>
                        <span class="text-xs">{query.channel}</span>
                      </div>
                      <Button variant="link" size="icon" class="flex items-center justify-center ml-auto" 
                        onClick={() => {removeFromQueue(query)}}>
                        <IoRemoveCircleOutline size={24} />
                      </Button>
                    </div>
                  ))}
                </SheetDescription>
              </SheetHeader>
              <div class="sticky bottom-0 left-0 right-0 mt-auto flex items-center justify-center p-5 bg-zinc-950">
                <Button 
                  class="w-32" 
                  variant="filled" 
                  disabled={youtubeQueue.length === 0} 
                  onClick={() => {
                    download(youtubeQueue).then((result) => {
                      const isError = result instanceof Error;
                      (() => isError ? toast.error(result.message) : toast.success("Download was successful"))();
                    })
                  }} 
                  size="sm">
                  Download
                </Button>
              </div>
            </SheetContent>      
          </Sheet>
        </ComboboxControl>
        <ComboboxContent />
      </Combobox>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-2 pl-20 truncate">ID</TableHead>
            <TableHead class="ml-auto w-1/12 truncate"></TableHead>
            <TableHead class="w-1/3 truncate">Title</TableHead>
            <TableHead class="w-2/12 truncate">Artist</TableHead>
            <TableHead class="w-1/12 truncate">Views</TableHead>
            <TableHead class="w-10 truncate">Duration</TableHead>
            <TableHead class="w-8 text-right truncate"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {youtubeQuery().map((query, index) => (
            <TableRow>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap pl-20">{index + 1}</TableCell>  
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">
                <img src={query.thumbnail} class="rounded-md" />
              </TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.title}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.channel}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.views}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.duration}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">
                <div class="flex items-center justify-center gap-5">
                  <a href={query.url} target="_blank">
                    <BiRegularLink size={24}/>
                  </a> 
                  <Button 
                    variant="link" 
                    size="icon" 
                    class="flex items-center justify-center" 
                    onClick={() => {
                      const success = addToQueue(query);
                      (() => !success ? toast.error("Already in queue") : toast.success("Successfully added to queue", { description: query.title }))();
                    }}
                  >
                    <BiRegularAddToQueue size={24}/>  
                  </Button>
                </div>
              </TableCell>    
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CustomToast />
    </div>
  )
}
