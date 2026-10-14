import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { Slide, toast, ToastContainer } from "react-toastify";

/**
 * Menampilkan pesan flash (success / error) dari backend sebagai toast,
 * satu kali di layout. Sebelumnya setiap halaman memasang ToastContainer
 * sendiri dan membaca flash di onSuccess, sehingga:
 * - pesan error validasi tidak pernah tampil sebagai notifikasi,
 * - toast "undefined" muncul bila backend tidak mengirim flash,
 * - error server (500/419) memunculkan jendela HTML mentah.
 * Komponen ini dipasang sekali di app.jsx (di luar halaman) sehingga
 * toast tidak hilang saat berpindah halaman.
 */
export default function FlashMessages({ initialFlash }) {
    useEffect(() => {
        // Flash saat halaman pertama kali dibuka (mis. setelah redirect penuh).
        showFlash(initialFlash);

        const offSuccess = router.on("success", (event) => {
            showFlash(event.detail.page.props?.auth?.flash);
        });

        const offInvalid = router.on("invalid", (event) => {
            const status = event.detail.response?.status;
            event.preventDefault();
            if (status === 419) {
                toast.error("Sesi Anda telah berakhir. Muat ulang halaman lalu coba lagi.");
            } else if (status === 413) {
                toast.error("Ukuran file terlalu besar untuk diunggah.");
            } else if (status === 429) {
                toast.error("Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.");
            } else {
                toast.error("Terjadi kesalahan pada server. Coba beberapa saat lagi.");
            }
        });

        const offException = router.on("exception", (event) => {
            event.preventDefault();
            toast.error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
        });

        return () => {
            offSuccess();
            offInvalid();
            offException();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ToastContainer
            position="top-right"
            transition={Slide}
            autoClose={4000}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss={false}
            toastClassName="!rounded-xl !text-sm !font-medium !shadow-lg"
        />
    );
}

let lastShown = { key: null, at: 0 };

const showFlash = (flash) => {
    if (!flash) return;
    const now = Date.now();
    // Event "success" dan render awal bisa membawa flash yang sama.
    const key = `${flash.success ?? ""}|${flash.error ?? ""}`;
    if (key === lastShown.key && now - lastShown.at < 1000) return;
    if (flash.success || flash.error) lastShown = { key, at: now };
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
};
