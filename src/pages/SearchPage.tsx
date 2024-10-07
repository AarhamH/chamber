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

interface SearchSuggestion {
  label: string
  value: string
}

export const SearchPage = () => {
  const [searchInput, setSearchInput] = createSignal<string>("")
  const [searchSuggestions, setSearchSuggestions] = createSignal<SearchSuggestion[]>([])
  const [youtubeQuery, setYoutubeQuery] = createSignal<YoutubeQuery[]>([])

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

  return (
    <div>
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
          class="w-1/2 mx-auto p-2"
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
              onKeyDown={(e) => e.key === "Enter" && search(searchInput())}
            />
          </ComboboxControl>
          <ComboboxContent />
        </Combobox>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="ml-5 w-16 text-right"></TableHead>
            <TableHead class="w-2 truncate">ID</TableHead>
            <TableHead class="w-1/12 truncate"></TableHead>
            <TableHead class="w-1/3 truncate">Title</TableHead>
            <TableHead class="w-2/12 truncate">Artist</TableHead>
            <TableHead class="w-1/12 truncate">Views</TableHead>
            <TableHead class="w-10 truncate">Duration</TableHead>
            <TableHead class="w-16 text-right truncate"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {youtubeQuery().map((query, index) => (
            <TableRow>
              <TableCell class="flex justify-end mt-3">
                <IoSearchOutline size={24} />
              </TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{index + 1}</TableCell>  
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">
                <img src={query.thumbnail} />
              </TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.title}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.channel}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.views}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{query.duration}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">
                <IoSearchOutline size={24}/>  
              </TableCell>  
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
