import Modal from "./Modal";
import TitleModal from "./TitleModal";
import { ImageOff } from "lucide-react";
import { useState } from "react";

/** Thumbnail yang bisa diklik untuk melihat foto ukuran penuh. */
export default function ImageViewer({ src, alt = "Foto", title = "Detail Foto", className = "h-12 w-12" }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <span
                className={`inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 ${className}`}
                title="Tidak ada foto"
            >
                <ImageOff className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Tidak ada foto</span>
            </span>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:ring-2 hover:ring-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`}
                aria-label={`Lihat ${alt}`}
            >
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onError={() => setError(true)}
                    className="h-full w-full object-cover"
                />
            </button>
            <Modal show={open} onClose={() => setOpen(false)} maxWidth="2xl">
                <TitleModal title={title} onClick={() => setOpen(false)} />
                <div className="flex justify-center bg-slate-50 p-4">
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-[75vh] w-auto rounded-lg object-contain"
                    />
                </div>
            </Modal>
        </>
    );
}
