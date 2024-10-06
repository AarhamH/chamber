import { Table, TableBody, TableHead, TableHeader, TableRow } from "~/components/Table"
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

interface SearchSuggestion {
  label: string
  value: string
}

export const SearchPage = () => {
  const [searchInput, setSearchInput] = createSignal<string>("")
  const [searchSuggestions, setSearchSuggestions] = createSignal<SearchSuggestion[]>([])

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
        >
          <ComboboxControl aria-label="SearchSuggestions">
            <IoSearchOutline class="mr-2 opacity-50 hover:cursor-pointer" size={24} />
            <ComboboxInput onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setSearchInput(value);
              autoComplete(value);
            }} />
          </ComboboxControl>
          <ComboboxContent />
        
        </Combobox>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="ml-5 w-16 text-left"></TableHead>
            <TableHead class="w-2 truncate">ID</TableHead>
            <TableHead class="w-1/4 truncate">Title</TableHead>
            <TableHead class="w-2/12 truncate">Artist</TableHead>
            <TableHead class="w-1/4 truncate">Path</TableHead>
            <TableHead class="w-10 truncate">Duration</TableHead>
            <TableHead class="w-16 text-right truncate"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        </TableBody>
      </Table>
    </div>
  )
}
