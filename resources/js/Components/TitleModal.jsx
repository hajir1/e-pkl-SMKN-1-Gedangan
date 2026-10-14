import { DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";

/** Header modal: judul, deskripsi opsional, dan tombol tutup. */
const TitleModal = ({ title, description, icon, ...props }) => {
    return (
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
            <div className="min-w-0">
                <DialogTitle className="text-base font-semibold text-slate-900">
                    {title}
                </DialogTitle>
                {description && (
                    <p className="mt-0.5 text-sm text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            <button
                {...props}
                type="button"
                aria-label="Tutup"
                className="-me-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&_svg]:h-5 [&_svg]:w-5"
            >
                {icon ?? <X />}
            </button>
        </div>
    );
};

export default TitleModal;

export const ModalBody = ({ className = "", children }) => (
    <div className={`px-5 py-5 sm:px-6 ${className}`}>{children}</div>
);

export const ModalFooter = ({ className = "", children }) => (
    <div
        className={`flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 ${className}`}
    >
        {children}
    </div>
);
