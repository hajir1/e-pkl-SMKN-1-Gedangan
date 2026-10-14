import Swal from "sweetalert2";

// Gaya dialog konfirmasi disamakan dengan design system (warna tombol,
// sudut, tipografi). Fungsi & parameternya tetap sama seperti sebelumnya.
const baseOptions = {
    buttonsStyling: false,
    reverseButtons: true,
    customClass: {
        popup: "!rounded-2xl !p-6",
        title: "!text-lg !font-semibold !text-slate-900",
        htmlContainer: "!text-sm !text-slate-600",
        actions: "!gap-2 !mt-6",
        confirmButton:
            "inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        denyButton:
            "inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2",
        cancelButton:
            "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
    },
};

const dangerConfirm =
    "inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2";

export const AlertConfirm = (text, icon, cb, confirmBtn) => {
    Swal.fire({
        ...baseOptions,
        customClass: {
            ...baseOptions.customClass,
            ...(icon === "warning" ? { confirmButton: dangerConfirm } : {}),
        },
        title: "Apakah Anda yakin?",
        text: text,
        icon: icon || "question",
        showCancelButton: true,
        cancelButtonText: "Batal",
        confirmButtonText: confirmBtn ?? "Ya, Hapus",
        focusCancel: icon === "warning",
    }).then((result) => {
        if (result.isConfirmed) {
            cb();
        }
    });
};

export const AlertConfirmTwoOption = (text, icon, cb, confirmBtn, denyBtn) => {
    Swal.fire({
        ...baseOptions,
        title: "Konfirmasi",
        text: text,
        icon: icon || "question",
        showCancelButton: true,
        showDenyButton: true,
        cancelButtonText: "Batal",
        confirmButtonText: confirmBtn ?? "Ya",
        denyButtonText: denyBtn ?? "Tolak",
    }).then((result) => {
        cb(result);
    });
};

export const Alert = (text, icon, timer) => {
    Swal.fire({
        ...baseOptions,
        toast: true,
        position: "top-end",
        icon: icon ? icon : "success",
        text: text,
        showConfirmButton: false,
        timer: timer ?? 2500,
        timerProgressBar: true,
    });
};
