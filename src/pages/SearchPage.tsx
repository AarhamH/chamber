import { createSignal, createEffect } from "solid-js"
import { invoke } from "@tauri-apps/api/tauri"
import { YoutubeQuery } from "~/utils/types"
import { youtubeQueue, setYoutubeQueue, isSearchDownloading, setIsSearchDownloading } from "~/store/store"
import { IoRemoveCircleOutline, IoSearchOutline } from "solid-icons/io"
import { BiRegularLoaderCircle, BiRegularLink, BiRegularAddToQueue } from "solid-icons/bi"
import { toast } from "solid-sonner"
import { Button } from "~/components/solidui/Button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/components/solidui/Sheet"
import { Switch, SwitchControl, SwitchThumb, SwitchLabel} from "~/components/solidui/Switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/solidui/Table"
import { Combobox, ComboboxContent, ComboboxControl, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxItemLabel, } from "~/components/solidui/Combobox"
interface SearchSuggestion {
  label: string
  value: string
}

export const SearchPage = () => {
  /* States and references */
  const [searchInput, setSearchInput] = createSignal<string>("")
  const [searchSuggestions, setSearchSuggestions] = createSignal<SearchSuggestion[]>([])
  const [youtubeQuery, setYoutubeQuery] = createSignal<YoutubeQuery[]>([])
  const [isSearchableByUrl, setIsSearchableByUrl] = createSignal<boolean>(false)
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
      if (!input || isSearchableByUrl()){
        setSearchSuggestions([]);
        return;
      };
      const suggestions = await invoke<string[]>("youtube_suggestion", { input })
        .then((result) =>
          result.map((suggestion) => ({
            label: suggestion.replace(/"/g, ""),
            value: suggestion.replace(/"/g, "")
          }))
        );
      
      setSearchSuggestions(suggestions);
    } catch (error) {
      return error;
    }
  }

  async function search(input: string) {
    try {
      if(isSearchableByUrl()) {
        const result = await invoke<YoutubeQuery>("youtube_search_by_url", { url: input });
        setYoutubeQuery([result]);
      } else {
        const result = await invoke<YoutubeQuery[]>("youtube_search", { input });
        setYoutubeQuery(result);
      }
    } catch (error) {
      return error;
    }
  }

  async function download(audioList: YoutubeQuery[]) {
    try {
      setIsSearchDownloading(true);
      await invoke("download_audio", { audioList });
    } catch (error) {
      return new Error(String(error));
    } finally {
      setIsSearchDownloading(false);
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
      <div class="flex flex-row items-center justify-center">
        <Combobox
          options={searchSuggestions()}
          optionValue="value"
          optionTextValue="label"
          optionLabel="label"
          placeholder={isSearchableByUrl() ? "Enter YouTube URL" : "Search for YouTube video"}
          itemComponent={(props) => (
            <ComboboxItem item={props.item}>
              <ComboboxItemLabel>{props.item.rawValue.label}</ComboboxItemLabel>
              <ComboboxItemIndicator />
            </ComboboxItem>
          )}
          class="w-1/3 p-5"
          onChange={(selectedItem) => {
            if (selectedItem) {
              setSearchInput(selectedItem.value);
              search(selectedItem.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              setSearchInput(setSearchInput(value));
              search(searchInput());
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
            />  
            <Sheet>
              <SheetTrigger class="opacity-50 text-sm p-3">Queue</SheetTrigger>
              <SheetContent class="flex flex-col h-full overflow-y-hidden">
                <SheetHeader>
                  <SheetTitle class="sticky top-0 bg-background pt-10">
                    {isSearchDownloading() ? 
                      (
                        <div class="flex flex-row gap-2 items-center">
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
                        {!isSearchDownloading() && (
                          <Button variant="link" size="icon" class="flex items-center justify-center ml-auto" 
                            onClick={() => {removeFromQueue(query)}}>
                            <IoRemoveCircleOutline size={"1.5em"} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </SheetDescription>
                </SheetHeader>
                <div class="sticky bottom-0 left-0 right-0 mt-auto flex items-center justify-center p-5 bg-background">
                  <Button 
                    class="w-32 flex items-center justify-center" 
                    variant="filled" 
                    disabled={youtubeQueue.length === 0 || isSearchDownloading()} 
                    onClick={() => {
                      download(youtubeQueue).then((result) => {
                        const isError = result instanceof Error;
                        (() => isError ? toast.error(result.message) : toast.success("Download was successful"))();
                      })
                    }} 
                    size="sm">
                    {isSearchDownloading() ? <BiRegularLoaderCircle class="animate-spin" size={"1.5em"} /> : "Download"}
                  </Button>
                </div>
              </SheetContent>      
            </Sheet>
          </ComboboxControl>
          <ComboboxContent />
        </Combobox>
        <Switch checked={isSearchableByUrl()} onChange={setIsSearchableByUrl} class="flex items-center space-x-2">
          <SwitchControl onChange={() => setIsSearchableByUrl(!isSearchableByUrl)}>
            <SwitchThumb />
          </SwitchControl>
          <SwitchLabel class="font-normal text-xs opacity-50">Search By URL</SwitchLabel>
        </Switch>
      </div>
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
        {
          youtubeQuery().length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} class="text-center font-thin">No items found</TableCell>
              </TableRow>
            </TableBody>
          ) : (
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
                        <BiRegularLink size={"1.5em"} />
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
                        <BiRegularAddToQueue size={"1.5em"}/>  
                      </Button>
                    </div>
                  </TableCell>    
                </TableRow>
              ))}
            </TableBody>
          )
        }
      </Table>
    </div>
  )
}
