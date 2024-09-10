import { useParams } from "@solidjs/router"

export const PlaylistPage = () => {
  const params = useParams();
  return(
    <div>
      Playlist with id of <code>{params.id}</code>
    </div>
  )
}