import { BiRegularPlay } from "solid-icons/bi";
import { AiFillStepForward } from "solid-icons/ai"
import { AiFillStepBackward } from "solid-icons/ai"
import { BiRegularVolumeFull } from "solid-icons/bi"

const PlayBack = () => {
  return (
    <div class="h-20 bg-zinc-800 flex items-center">
      <div class="w-1/5 ml-16 h-full p-2 flex flex-col items-center justify-center text-center">
        <div class="truncate w-full mb-1">
          <span class="block whitespace-nowrap overflow-hidden text-ellipsis text-center">
            Gojira - The Way of All Flesh
          </span>
        </div>
        <div class="truncate w-full">
          <span class="block whitespace-nowrap overflow-hidden text-ellipsis text-center text-sm font-thin">
            /home/path/to/mp3.mp3
          </span>
        </div>
      </div>

      <div class="w-3/5 p-2 flex flex-col items-center justify-center">
        <div class="flex flex-row items-center justify-center space-x-4 pb-2">
          <AiFillStepBackward size={36} />
          <BiRegularPlay size={50} />
          <AiFillStepForward size={36} />
        </div>
        <input type="range" min={0} max={100} class="w-4/5" />
      </div>
      <div class="w-1/5 p-2 flex flex-row justify-start">
        <BiRegularVolumeFull size={28} class="mr-2"/>
        <input type="range" min={0} max={100} class="w-1/2" />
      </div>
    </div>
  );
}

export default PlayBack;