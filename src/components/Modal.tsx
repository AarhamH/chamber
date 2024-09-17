import type { Component, JSX } from "solid-js";
import { createEffect, onCleanup, onMount, createUniqueId} from "solid-js";

type ModalProps = {
  isShown: boolean;
  closeModal: () => void;
  title: string;
  children: JSX.Element;
  isAudioModal?: boolean;
  headerButtons?: JSX.Element[];  
};

const Modal: Component<ModalProps> = (props) => {
  const dialogId = createUniqueId();

  let modalRef: HTMLDialogElement | undefined;

  function onCancel() {
    props.closeModal();
  } 

  function onBackdropClick(e: MouseEvent) {
    const rect = modalRef?.getBoundingClientRect();
    if (rect && (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom
    )) {
      props.closeModal();
    }
  }

  onMount(() => {
    modalRef?.addEventListener("cancel", onCancel);
    modalRef?.addEventListener("click", onBackdropClick);
  });

  createEffect(() => {
    if (props.isShown) {
      modalRef?.showModal();
    } else {
      modalRef?.close();
    } 
  });

  onCleanup(() => {
    modalRef?.removeEventListener("cancel", onCancel);
    modalRef?.removeEventListener("click", onBackdropClick);
  });

  return (
    <div class="absolute inset-0 z-50 flex items-center justify-center transition duration-700 bg-black bg-opacity-50">
      <dialog
        ref={modalRef}
        id={`modal-${dialogId}`}
        class="p-4 bg-zinc-900 w-5/6 h-5/6 rounded-md overflow-hidden"
      >
        <div>
          <button onClick={props.closeModal} class="absolute top-4 right-4 cursor-pointer">
            X
          </button>
          <div class="flex flex-col items-center justify-center font-medium text-4xl">
            {props.title}
            <div class="flex space-x-2">
              {props.headerButtons?.map((button) => (
                <div>{button}</div>
              ))}
            </div>
          </div>

        </div>
        <div class="flex justify-center h-5/6">
          {props.children}
        </div>
      </dialog>
    </div>
  );
};


export default Modal;
