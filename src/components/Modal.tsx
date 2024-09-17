import type { Component, JSX } from "solid-js";
import { createEffect, onCleanup, onMount, createUniqueId} from "solid-js";

type ModalProps = {
  isShown: boolean;
  closeModal: () => void;
  children: JSX.Element;
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
    <div class="fixed inset-0 z-50 flex items-center justify-center transition duration-700 bg-black bg-opacity-50">
      <dialog
        ref={modalRef}
        id={`modal-${dialogId}`}
        class="p-4 bg-black w-3/4 h-3/4 rounded-md transition-transform duration-300 transform scale-95"
      >
        <div>
          <button onClick={props.closeModal} class="absolute top-4 right-4 cursor-pointer">
            X
          </button>
        </div>
        <div class="flex items-center justify-center h-full">
          {props.children}
        </div>
      </dialog>
    </div>
  );
};


export default Modal;
