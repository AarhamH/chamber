import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/Table"

export const SearchPage = () => {

  return(
    <div>
      <div class="pt-10 pb-3 flex items-end justify-start">
        <div class="flex flex-col w-1/2 m-2">
          <input
            type="text"
            class="font-medium bg-zinc-900 p-2 text-lg rounded-3xl w-full"
          />
        </div>
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