import {CartForm} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 * }}
 */
export function AddNote({analytics, cart, disabled, line}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditting, setIsEditting] = useState(false);
  const [noteString, setNoteString] = useState('none');
  const dialogRef = useRef(null);
  const [note, setNote] = useState('none');

  useEffect(() => {
    setNoteString(cart.note);
    setIsLoading(false);
    setNote(cart.note);
  }, [cart.note]);

  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.NoteUpdate}>
      {(fetcher) => (
        <div className="flex flex-row gap-4">
          <div className="flex flex-row flex-wrap gap-4 p-4 pb-3 grow bg-white text-red  border border-red">
            <h3 className="text-button leading-none">NOTE:</h3>
            <p className="h-max font-courier text-button leading-8 [text-transform:none]">
              {noteString == '' ? 'None' : noteString}
            </p>
          </div>
          <button
            className="button min-w-32"
            onClick={() => dialogRef.current?.showModal()}
            type="button"
          >
            {isLoading ? 'Updating...' : 'Edit note'}
          </button>

          <dialog className="z-[999]" ref={dialogRef}>
            <div className="fixed inset-0 flex flex-col gap-4 items-center justify-center h-full w-full bg-black/40 backdrop-blur-sm p-gutter">
              <label className="sr-only">NOTE:</label>
              <textarea
                autofocus
                placeholder="Add a note"
                className="p-2 max-w-lg w-full min-h-28 font-courier border-red border focus:outline-none focus:ring-green focus:ring-2"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                }}
                name="note"
              />
              <button
                className="button"
                type="submit"
                onClick={() => {
                  if (note !== cart.note) {
                    setIsLoading(true);
                  }
                  dialogRef.current?.close();
                }}
                value="Submit details"
              >
                Update note
              </button>
            </div>
          </dialog>
        </div>
      )}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
